import { Assessment, IAssessmentDocument } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { Skill } from '../models/Skill.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug } from '../utils/slug.js';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';
import type { CreateAssessmentInput, SubmitAssessmentInput } from '@job-platform/shared-validators';

// ─── List Assessments ─────────────────────────────────────────────────────────

export async function listAssessments(
  page?: number,
  limit?: number,
  difficulty?: string,
  skillName?: string,
) {
  const pagination = getPaginationOptions(page, limit);
  const filter: Record<string, unknown> = { isActive: true };
  if (difficulty) filter.difficulty = difficulty;
  if (skillName) filter.skillName = { $regex: skillName, $options: 'i' };

  const [assessments, total] = await Promise.all([
    Assessment.find(filter)
      .select('-questions') // Don't send questions in list view
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .lean(),
    Assessment.countDocuments(filter),
  ]);

  return {
    assessments,
    ...getPaginationResult(total, pagination),
  };
}

// ─── Get Assessment by Slug (Public - no answers) ─────────────────────────────

export async function getAssessmentBySlug(slug: string) {
  const assessment = await Assessment.findOne({ slug, isActive: true }).lean();
  if (!assessment) throw new AppError('Assessment not found', 404);

  // Strip correct answers for public view
  const sanitized = {
    ...assessment,
    questions: assessment.questions.map((q) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options.map((o) => ({ text: o.text })), // Remove isCorrect
      points: q.points,
      codeSnippet: q.codeSnippet,
    })),
  };

  return sanitized;
}

// ─── Start Assessment ─────────────────────────────────────────────────────────

export async function startAssessment(assessmentId: string, userId: string) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new AppError('Assessment not found', 404);
  if (!assessment.isActive) throw new AppError('Assessment is not active', 400);

  // Check cooldown: user must wait 24h between attempts
  const lastAttempt = await AssessmentAttempt.findOne({
    user: userId,
    assessment: assessmentId,
  }).sort({ createdAt: -1 });

  if (lastAttempt) {
    const hoursSinceLastAttempt =
      (Date.now() - lastAttempt.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastAttempt < 24) {
      const hoursLeft = Math.ceil(24 - hoursSinceLastAttempt);
      throw new AppError(
        `You can retake this assessment in ${hoursLeft} hour(s)`,
        429,
      );
    }
  }

  // Return assessment with questions but without correct answers
  return {
    _id: assessment._id,
    title: assessment.title,
    duration: assessment.duration,
    totalPoints: assessment.totalPoints,
    passingScore: assessment.passingScore,
    questions: assessment.questions.map((q) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options.map((o) => ({ text: o.text })),
      points: q.points,
      codeSnippet: q.codeSnippet,
    })),
  };
}

// ─── Submit Assessment ────────────────────────────────────────────────────────

export async function submitAssessment(
  assessmentId: string,
  userId: string,
  input: SubmitAssessmentInput,
) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new AppError('Assessment not found', 404);

  // Validate time didn't exceed duration + 1 minute grace
  const maxTimeSeconds = (assessment.duration + 1) * 60;
  if (input.timeTaken > maxTimeSeconds) {
    throw new AppError('Time limit exceeded', 400);
  }

  // Grade the answers
  let pointsEarned = 0;
  const gradedAnswers = input.answers.map((answer) => {
    const question = assessment.questions[answer.questionIndex];
    if (!question) {
      return {
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
        isCorrect: false,
        pointsEarned: 0,
      };
    }

    const selectedOption = question.options[answer.selectedOption];
    const isCorrect = selectedOption?.isCorrect || false;
    const pts = isCorrect ? question.points : 0;
    pointsEarned += pts;

    return {
      questionIndex: answer.questionIndex,
      selectedOption: answer.selectedOption,
      isCorrect,
      pointsEarned: pts,
    };
  });

  const score = Math.round((pointsEarned / assessment.totalPoints) * 100);
  const passed = score >= assessment.passingScore;

  // Create attempt record
  const attempt = await AssessmentAttempt.create({
    user: userId,
    assessment: assessmentId,
    answers: gradedAnswers,
    score,
    pointsEarned,
    totalPoints: assessment.totalPoints,
    passed,
    timeTaken: input.timeTaken,
    startedAt: new Date(input.startedAt),
    completedAt: new Date(),
  });

  // Update assessment stats
  const allAttempts = await AssessmentAttempt.countDocuments({
    assessment: assessmentId,
  });
  const avgScoreResult = await AssessmentAttempt.aggregate([
    { $match: { assessment: assessment._id } },
    { $group: { _id: null, avg: { $avg: '$score' } } },
  ]);

  await Assessment.findByIdAndUpdate(assessmentId, {
    attemptCount: allAttempts,
    avgScore: Math.round(avgScoreResult[0]?.avg || 0),
  });

  // Return full results with explanations
  const results = {
    _id: attempt._id,
    score,
    pointsEarned,
    totalPoints: assessment.totalPoints,
    passed,
    timeTaken: input.timeTaken,
    passingScore: assessment.passingScore,
    answers: gradedAnswers.map((answer, i) => {
      const question = assessment.questions[answer.questionIndex];
      return {
        ...answer,
        questionText: question?.questionText,
        correctOption: question?.options.findIndex((o) => o.isCorrect),
        explanation: question?.explanation,
      };
    }),
  };

  return results;
}

// ─── Get My Attempts ──────────────────────────────────────────────────────────

export async function getMyAttempts(
  userId: string,
  page?: number,
  limit?: number,
) {
  const pagination = getPaginationOptions(page, limit);

  const [attempts, total] = await Promise.all([
    AssessmentAttempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .populate('assessment', 'title slug skillName difficulty duration passingScore')
      .lean(),
    AssessmentAttempt.countDocuments({ user: userId }),
  ]);

  return {
    attempts,
    ...getPaginationResult(total, pagination),
  };
}

// ─── Get User's Verified Skills (passed assessments) ──────────────────────────

export async function getUserVerifiedSkills(userId: string) {
  const passedAttempts = await AssessmentAttempt.find({
    user: userId,
    passed: true,
  })
    .populate('assessment', 'title skillName difficulty')
    .sort({ score: -1 })
    .lean();

  // Deduplicate by skill name (keep best score)
  const skillMap = new Map<string, any>();
  for (const attempt of passedAttempts) {
    const assessment = attempt.assessment as any;
    const skillName = assessment?.skillName;
    if (skillName && !skillMap.has(skillName)) {
      skillMap.set(skillName, {
        skillName,
        assessmentTitle: assessment.title,
        difficulty: assessment.difficulty,
        score: attempt.score,
        passedAt: attempt.completedAt || attempt.createdAt,
      });
    }
  }

  return Array.from(skillMap.values());
}

// ─── Admin: Create Assessment ─────────────────────────────────────────────────

export async function createAssessment(
  input: CreateAssessmentInput,
  createdBy: string,
) {
  const slug = generateSlug(input.title);
  const totalPoints = input.questions.reduce((sum, q) => sum + q.points, 0);

  // Find or create skill
  let skill = await Skill.findOne({
    name: { $regex: new RegExp(`^${input.skillName}$`, 'i') },
  });
  if (!skill) {
    skill = await Skill.create({
      name: input.skillName,
      slug: generateSlug(input.skillName),
    });
  }

  const assessment = await Assessment.create({
    ...input,
    slug,
    skill: skill._id,
    totalPoints,
    createdBy,
  });

  return assessment;
}

// ─── Admin: Update Assessment ─────────────────────────────────────────────────

export async function updateAssessment(
  assessmentId: string,
  updates: Partial<CreateAssessmentInput>,
) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new AppError('Assessment not found', 404);

  if (updates.questions) {
    (updates as any).totalPoints = updates.questions.reduce(
      (sum, q) => sum + q.points,
      0,
    );
  }

  const updated = await Assessment.findByIdAndUpdate(
    assessmentId,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return updated;
}

// ─── Admin: Toggle Active ─────────────────────────────────────────────────────

export async function toggleAssessmentActive(assessmentId: string) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new AppError('Assessment not found', 404);

  assessment.isActive = !assessment.isActive;
  await assessment.save();

  return assessment;
}

// ─── Get Attempt Result ───────────────────────────────────────────────────────

export async function getAttemptResult(attemptId: string, userId: string) {
  const attempt = await AssessmentAttempt.findById(attemptId)
    .populate('assessment')
    .lean();

  if (!attempt) throw new AppError('Attempt not found', 404);
  if (attempt.user.toString() !== userId) {
    throw new AppError('You can only view your own attempts', 403);
  }

  const assessment = attempt.assessment as any as IAssessmentDocument;

  return {
    ...attempt,
    answers: attempt.answers.map((answer) => {
      const question = assessment.questions[answer.questionIndex];
      return {
        ...answer,
        questionText: question?.questionText,
        options: question?.options,
        correctOption: question?.options.findIndex((o: any) => o.isCorrect),
        explanation: question?.explanation,
      };
    }),
  };
}
