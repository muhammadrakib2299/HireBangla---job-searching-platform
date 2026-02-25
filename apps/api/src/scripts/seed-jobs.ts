import mongoose from 'mongoose';
import { config } from 'dotenv';
import crypto from 'crypto';
import { Job } from '../models/Job.js';
import { generateSlug } from '../utils/slug.js';
import {
  JobType,
  JobSource,
  JobStatus,
  ExperienceLevel,
  ApplicationMethod,
  SalaryPeriod,
} from '@job-platform/shared-types';

config();

// ─── Data pools ────────────────────────────────────────────────────────────────

const DIVISIONS_DATA = [
  { name: 'Dhaka', districts: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur', 'Narsingdi', 'Manikganj', 'Munshiganj'] },
  { name: 'Chattogram', districts: ['Chattogram', 'Comilla', 'Cox\'s Bazar', 'Feni', 'Noakhali', 'Brahmanbaria'] },
  { name: 'Rajshahi', districts: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore'] },
  { name: 'Khulna', districts: ['Khulna', 'Jessore', 'Kushtia', 'Satkhira'] },
  { name: 'Sylhet', districts: ['Sylhet', 'Habiganj', 'Moulvibazar'] },
  { name: 'Rangpur', districts: ['Rangpur', 'Dinajpur', 'Nilphamari'] },
  { name: 'Barishal', districts: ['Barishal', 'Patuakhali'] },
  { name: 'Mymensingh', districts: ['Mymensingh', 'Jamalpur'] },
];

const CATEGORIES: Record<string, { subcategories: string[]; titles: string[]; skills: string[]; degrees: string[] }> = {
  'IT & Software': {
    subcategories: ['Web Development', 'Mobile Development', 'Software Engineering', 'DevOps', 'QA & Testing', 'UI/UX Design', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'AI & Machine Learning'],
    titles: [
      'Senior Full Stack Developer', 'Junior Frontend Developer', 'Backend Engineer (Node.js)', 'React.js Developer',
      'Mobile App Developer (Flutter)', 'Android Developer', 'iOS Developer', 'DevOps Engineer',
      'QA Engineer', 'UI/UX Designer', 'Data Scientist', 'Machine Learning Engineer',
      'Software Engineer', 'Full Stack Developer', 'Python Developer', 'Java Developer',
      'PHP/Laravel Developer', 'MERN Stack Developer', 'WordPress Developer', 'Database Administrator',
      'Cloud Solutions Architect', 'Cybersecurity Analyst', 'System Administrator', 'Technical Lead',
      'Frontend Developer (Vue.js)', 'Angular Developer', 'Golang Developer', 'Blockchain Developer',
      'Data Analyst', 'IT Support Specialist', 'Network Engineer', 'API Developer',
      'Automation Test Engineer', 'Performance Test Engineer', 'Site Reliability Engineer',
      'Product Designer', 'Graphic Designer (Digital)', 'Game Developer', 'Embedded Systems Engineer',
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'PHP', 'Laravel', 'MongoDB', 'PostgreSQL', 'MySQL', 'Docker', 'AWS', 'Azure', 'Git', 'REST API', 'GraphQL', 'Kubernetes', 'Linux', 'Flutter', 'Swift', 'Kotlin', 'Vue.js', 'Angular', 'Next.js', 'Redis', 'CI/CD', 'Agile', 'Figma', 'Tailwind CSS'],
    degrees: ['BSc in CSE', 'BSc in IT', 'BSc in EEE', 'BSc in SWE', 'MSc in Computer Science', 'Diploma in Computer Science'],
  },
  'Banking & Finance': {
    subcategories: ['Banking', 'Accounting', 'Financial Analysis', 'Insurance', 'Investment', 'Microfinance', 'Auditing'],
    titles: [
      'Bank Officer', 'Senior Accountant', 'Financial Analyst', 'Credit Analyst',
      'Branch Manager', 'Relationship Manager', 'Risk Manager', 'Auditor',
      'Tax Consultant', 'Investment Analyst', 'Treasury Officer', 'Loan Officer',
      'Compliance Officer', 'Insurance Underwriter', 'Microfinance Officer',
      'Accounts Executive', 'Chief Financial Officer', 'Finance Manager',
      'Revenue Analyst', 'Collections Officer',
    ],
    skills: ['Financial Analysis', 'Excel', 'SAP', 'Tally', 'Accounting', 'Risk Management', 'Taxation', 'Auditing', 'Banking Operations', 'Credit Analysis', 'Financial Modeling', 'Budgeting', 'MS Office', 'QuickBooks', 'Bloomberg Terminal'],
    degrees: ['BBA in Finance', 'BBA in Accounting', 'MBA in Finance', 'MBA in Banking', 'CA', 'ACCA', 'CFA'],
  },
  'Marketing & Sales': {
    subcategories: ['Digital Marketing', 'Sales', 'Brand Management', 'Content Marketing', 'SEO/SEM', 'Social Media', 'Market Research', 'E-commerce'],
    titles: [
      'Digital Marketing Manager', 'SEO Specialist', 'Social Media Manager', 'Brand Manager',
      'Sales Executive', 'Business Development Manager', 'Marketing Coordinator', 'Content Strategist',
      'Growth Hacker', 'Performance Marketing Specialist', 'E-commerce Manager', 'Sales Manager',
      'Territory Sales Officer', 'Key Account Manager', 'Marketing Analyst',
      'Copywriter', 'Email Marketing Specialist', 'PPC Specialist', 'Market Research Analyst',
      'Channel Sales Manager',
    ],
    skills: ['Google Analytics', 'SEO', 'SEM', 'Facebook Ads', 'Google Ads', 'Content Marketing', 'Social Media Marketing', 'Salesforce', 'HubSpot', 'Email Marketing', 'Copywriting', 'CRM', 'Market Research', 'Branding', 'MS Office'],
    degrees: ['BBA in Marketing', 'MBA in Marketing', 'BSS in Mass Communication', 'BBA', 'MBA'],
  },
  'Engineering': {
    subcategories: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'Textile Engineering', 'Industrial Engineering'],
    titles: [
      'Civil Engineer', 'Structural Engineer', 'Electrical Engineer', 'Mechanical Engineer',
      'Project Engineer', 'Site Engineer', 'Maintenance Engineer', 'Design Engineer',
      'Production Engineer', 'Quality Engineer', 'Process Engineer', 'Power Plant Engineer',
      'Textile Engineer', 'Industrial Engineer', 'Estimation Engineer', 'Planning Engineer',
      'Environmental Engineer', 'Safety Engineer', 'HVAC Engineer', 'Instrumentation Engineer',
    ],
    skills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Project Management', 'PLC', 'SCADA', 'ETABS', 'Revit', 'SAP2000', 'MS Project', 'Primavera', 'Six Sigma', 'Lean Manufacturing', 'GIS', 'STAAD Pro'],
    degrees: ['BSc in Civil Engineering', 'BSc in EEE', 'BSc in Mechanical Engineering', 'BSc in Textile Engineering', 'BSc in IPE', 'MSc in Engineering'],
  },
  'Education & Training': {
    subcategories: ['Teaching', 'Academic Research', 'Corporate Training', 'Tutoring', 'Curriculum Development', 'E-learning'],
    titles: [
      'Lecturer', 'Assistant Professor', 'School Teacher', 'English Teacher',
      'Mathematics Teacher', 'Science Teacher', 'Corporate Trainer', 'Training Coordinator',
      'Curriculum Developer', 'Academic Coordinator', 'Tutor', 'Education Consultant',
      'Principal', 'Head of Department', 'Research Assistant', 'Online Instructor',
    ],
    skills: ['Teaching', 'Curriculum Development', 'Classroom Management', 'E-learning', 'Research', 'MS Office', 'Presentation', 'Communication', 'LMS', 'Assessment Design', 'Pedagogy'],
    degrees: ['BEd', 'MEd', 'MA in English', 'MSc in Mathematics', 'PhD', 'MBA (for trainers)'],
  },
  'Healthcare & Pharma': {
    subcategories: ['Medical Practice', 'Nursing', 'Pharmaceutical', 'Hospital Management', 'Public Health', 'Lab Technician'],
    titles: [
      'Medical Officer', 'Pharmacist', 'Nurse', 'Lab Technician',
      'Hospital Administrator', 'Public Health Officer', 'Dental Surgeon', 'Physiotherapist',
      'Medical Representative', 'Drug Safety Associate', 'Clinical Research Associate',
      'Radiologist', 'Pathologist', 'Nutritionist', 'Health Inspector',
    ],
    skills: ['Clinical Skills', 'Patient Care', 'Medical Records', 'Pharmacy Management', 'Lab Testing', 'Public Health', 'Research', 'First Aid', 'MS Office', 'EMR/EHR Systems', 'GMP'],
    degrees: ['MBBS', 'BPharm', 'BSc in Nursing', 'MPH', 'Diploma in Medical Technology', 'BDS'],
  },
  'NGO & Development': {
    subcategories: ['Program Management', 'Monitoring & Evaluation', 'Community Development', 'Humanitarian Aid', 'Fundraising', 'Advocacy'],
    titles: [
      'Program Manager', 'Monitoring & Evaluation Officer', 'Community Mobilizer',
      'Field Coordinator', 'Project Coordinator', 'Fundraising Manager', 'Advocacy Officer',
      'Gender Specialist', 'WASH Officer', 'Livelihood Officer', 'Education Officer',
      'Health Program Manager', 'Disaster Response Coordinator', 'Communications Officer',
    ],
    skills: ['Project Management', 'M&E', 'Report Writing', 'Community Mobilization', 'Stakeholder Management', 'MS Office', 'SPSS', 'Data Analysis', 'Donor Reporting', 'Proposal Writing', 'PRA/PLA', 'Gender Mainstreaming'],
    degrees: ['MSS in Development Studies', 'MBA', 'MA in Social Science', 'MPH', 'BSS', 'MA in Sociology'],
  },
  'Garments & Textile': {
    subcategories: ['Production', 'Quality Control', 'Merchandising', 'Compliance', 'Supply Chain', 'Design'],
    titles: [
      'Merchandiser', 'Production Manager', 'Quality Controller', 'Compliance Officer',
      'Cutting Master', 'Washing Manager', 'Fabric Sourcing Manager', 'Pattern Maker',
      'IE Engineer', 'Knitting Manager', 'Dyeing Manager', 'Fashion Designer',
      'Store Manager', 'Sampling Coordinator', 'Export Manager',
    ],
    skills: ['Merchandising', 'Quality Control', 'Production Planning', 'Compliance', 'Excel', 'ERP', 'Pattern Making', 'CAD', 'Supply Chain', 'Lean Manufacturing', 'AQL', 'Fabric Knowledge'],
    degrees: ['BSc in Textile Engineering', 'Diploma in Garments', 'BBA', 'BSc in Apparel Merchandising'],
  },
  'Telecommunications': {
    subcategories: ['Network Engineering', 'Customer Support', 'Technical Operations', 'Sales & Marketing'],
    titles: [
      'Network Engineer', 'RF Engineer', 'Telecom Engineer', 'NOC Engineer',
      'Customer Support Executive', 'Technical Support Engineer', 'Field Engineer',
      'Core Network Engineer', 'Transmission Engineer', 'VAS Engineer',
    ],
    skills: ['Networking', 'TCP/IP', 'CCNA', 'RF Planning', 'OSS/BSS', 'LTE', '5G', 'Fiber Optics', 'Troubleshooting', 'Linux', 'Python', 'Wireshark'],
    degrees: ['BSc in EEE', 'BSc in CSE', 'BSc in Telecom Engineering', 'Diploma in Telecom'],
  },
  'Media & Creative': {
    subcategories: ['Journalism', 'Graphic Design', 'Photography', 'Video Production', 'Content Writing', 'Animation', 'Public Relations'],
    titles: [
      'Graphic Designer', 'Content Writer', 'Video Editor', 'Journalist',
      'Photographer', 'Motion Graphics Designer', 'Art Director', 'Animator',
      'PR Executive', 'Creative Director', 'Social Media Content Creator', 'News Reporter',
    ],
    skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere', 'After Effects', 'Figma', 'Photography', 'Videography', 'Content Writing', 'Copywriting', 'InDesign', 'Blender', 'DaVinci Resolve'],
    degrees: ['BA in Fine Arts', 'BSS in Mass Communication', 'BA in Journalism', 'Diploma in Graphic Design'],
  },
  'Human Resources': {
    subcategories: ['Recruitment', 'HR Management', 'Payroll', 'Training & Development', 'Employee Relations', 'Compensation & Benefits'],
    titles: [
      'HR Executive', 'HR Manager', 'Recruitment Specialist', 'Talent Acquisition Lead',
      'Payroll Officer', 'Training Manager', 'HR Business Partner', 'Compensation & Benefits Manager',
      'Employee Relations Officer', 'HR Coordinator', 'Head of HR', 'People Operations Manager',
    ],
    skills: ['Recruitment', 'HRIS', 'Payroll Management', 'Labor Law', 'Training', 'Performance Management', 'MS Office', 'SAP HR', 'Employee Relations', 'Talent Management', 'Onboarding'],
    degrees: ['BBA in HRM', 'MBA in HRM', 'MA in HRM', 'BBA', 'MBA'],
  },
  'Logistics & Supply Chain': {
    subcategories: ['Warehousing', 'Transportation', 'Procurement', 'Inventory Management', 'Import/Export'],
    titles: [
      'Logistics Manager', 'Supply Chain Manager', 'Procurement Officer', 'Warehouse Manager',
      'Fleet Manager', 'Import/Export Executive', 'Inventory Controller', 'Dispatch Coordinator',
      'Shipping Officer', 'Distribution Manager',
    ],
    skills: ['Supply Chain Management', 'Logistics', 'Procurement', 'Inventory Management', 'SAP MM', 'Excel', 'ERP', 'Customs Clearance', 'Fleet Management', 'Warehouse Management'],
    degrees: ['BBA in Supply Chain', 'MBA in Supply Chain', 'BBA', 'BSc in Industrial Engineering'],
  },
  'Legal': {
    subcategories: ['Corporate Law', 'Litigation', 'Compliance', 'Intellectual Property', 'Contract Management'],
    titles: [
      'Legal Advisor', 'Corporate Lawyer', 'Compliance Officer', 'Legal Associate',
      'Litigation Lawyer', 'Company Secretary', 'Contract Manager', 'IP Lawyer',
    ],
    skills: ['Legal Research', 'Contract Drafting', 'Litigation', 'Corporate Law', 'Compliance', 'Legal Writing', 'Negotiation', 'MS Office', 'IP Law', 'Labor Law'],
    degrees: ['LLB', 'LLM', 'Bar-at-Law', 'MBA (for compliance)'],
  },
  'Customer Service': {
    subcategories: ['Call Center', 'Help Desk', 'Client Relations', 'Technical Support'],
    titles: [
      'Customer Service Representative', 'Call Center Agent', 'Help Desk Analyst',
      'Client Relations Manager', 'Customer Success Manager', 'Technical Support Agent',
      'Customer Service Manager', 'Chat Support Executive',
    ],
    skills: ['Communication', 'Customer Service', 'CRM', 'Problem Solving', 'MS Office', 'Email Support', 'Live Chat', 'Salesforce', 'Zendesk', 'Conflict Resolution'],
    degrees: ['BBA', 'BA in English', 'Any Bachelor\'s Degree'],
  },
  'Real Estate & Construction': {
    subcategories: ['Architecture', 'Construction Management', 'Property Management', 'Interior Design', 'Urban Planning'],
    titles: [
      'Architect', 'Construction Manager', 'Property Manager', 'Interior Designer',
      'Project Manager (Construction)', 'Quantity Surveyor', 'Urban Planner', 'Real Estate Agent',
    ],
    skills: ['AutoCAD', 'Revit', 'SketchUp', '3ds Max', 'Project Management', 'Cost Estimation', 'MS Project', 'Building Codes', 'Interior Design', 'GIS'],
    degrees: ['BArch', 'BSc in Civil Engineering', 'BSc in Architecture', 'Diploma in Interior Design'],
  },
  'Agriculture': {
    subcategories: ['Farming', 'Agribusiness', 'Food Processing', 'Fisheries', 'Livestock'],
    titles: [
      'Agriculture Officer', 'Agribusiness Manager', 'Farm Manager', 'Food Technologist',
      'Fisheries Officer', 'Livestock Specialist', 'Agricultural Extension Officer',
      'Quality Control Officer (Food)',
    ],
    skills: ['Agriculture', 'Crop Management', 'Farm Management', 'Food Processing', 'Quality Control', 'Research', 'MS Office', 'GIS', 'Supply Chain', 'HACCP'],
    degrees: ['BSc in Agriculture', 'MSc in Agriculture', 'BSc in Food Technology', 'BSc in Fisheries', 'DVM'],
  },
  'Government': {
    subcategories: ['Civil Service', 'Defense', 'Public Administration', 'Law Enforcement'],
    titles: [
      'Administrative Officer', 'BCS Cadre Officer', 'Police Officer', 'Customs Officer',
      'Tax Commissioner', 'District Coordinator', 'Government Analyst', 'Public Works Officer',
    ],
    skills: ['Public Administration', 'Policy Analysis', 'MS Office', 'Report Writing', 'Communication', 'Leadership', 'Bangla Typing', 'Data Analysis'],
    degrees: ['Any Bachelor\'s Degree', 'MA in Public Administration', 'LLB', 'MBA'],
  },
};

const COMPANY_NAMES = [
  // Tech
  'TechnoVista Limited', 'Brain Station 23', 'Kaz Software', 'DataSoft Systems', 'Enosis Solutions',
  'Cefalo Bangladesh', 'Therap Services', 'Selise Digital Platforms', 'Nascenia', 'Vivasoft Limited',
  'Tiger IT Bangladesh', 'Mpower Social Enterprises', 'Chaldal Limited', 'Pathao Limited', 'bKash Limited',
  'Shopup Technologies', 'ShopnoBaz', 'Banglalink Digital', 'Robi Axiata', 'Grameenphone',
  // Banking
  'BRAC Bank', 'Dutch-Bangla Bank', 'Eastern Bank', 'City Bank', 'Standard Chartered BD',
  'HSBC Bangladesh', 'Prime Bank', 'Mutual Trust Bank', 'Southeast Bank', 'Bank Asia',
  // Garments
  'Beximco Group', 'Square Group', 'DBL Group', 'PRAN-RFL Group', 'Akij Group',
  'Bashundhara Group', 'Meghna Group', 'City Group', 'Noman Group', 'Ha-Meem Group',
  // NGO
  'BRAC', 'Grameen Bank', 'ASA', 'CARE Bangladesh', 'Save the Children Bangladesh',
  'World Vision Bangladesh', 'Oxfam Bangladesh', 'Action Against Hunger', 'UNDP Bangladesh', 'UNICEF Bangladesh',
  // Others
  'Walton Group', 'Summit Group', 'Aamra Group', 'ADN Group', 'Concord Group',
  'Transcom Group', 'United Group', 'PHP Group', 'Edison Group', 'Navana Group',
  'Agora Limited', 'Daraz Bangladesh', 'ACI Limited', 'Renata Limited', 'Incepta Pharmaceuticals',
  'Orion Group', 'Runner Group', 'Butterfly Group', 'Bengal Group', 'Rahimafrooz',
];

const JOB_TYPES = Object.values(JobType);
const EXP_LEVELS = Object.values(ExperienceLevel);
const APP_METHODS = Object.values(ApplicationMethod);

const BENEFITS = [
  'Competitive salary', 'Health insurance', 'Festival bonus (2)', 'Annual performance bonus',
  'Provident fund', 'Gratuity', 'Lunch facility', 'Transport allowance',
  'Mobile allowance', 'Work from home flexibility', 'Gym membership', 'Learning & development budget',
  'Maternity/Paternity leave', 'Casual leave (10 days)', 'Annual leave (15 days)', 'Sick leave (14 days)',
  'Life insurance', 'Profit sharing', 'Employee stock options', 'Relocation assistance',
  'Career growth opportunities', 'International exposure', 'Modern office environment', 'Team outings & events',
  'Subsidized cafeteria', 'Parking facility', 'Overtime allowance', 'Internet allowance',
];

const REQUIREMENTS_TEMPLATES = [
  'Minimum {years} years of experience in related field',
  'Strong problem-solving and analytical skills',
  'Excellent communication skills in English and Bangla',
  'Ability to work independently and in a team',
  'Proficiency in {skill}',
  'Strong attention to detail',
  'Ability to manage multiple projects simultaneously',
  'Experience with {skill} is preferred',
  'Self-motivated with a positive attitude',
  'Willingness to learn new technologies and tools',
  'Experience working in a fast-paced environment',
  'Strong organizational and time management skills',
];

const RESPONSIBILITIES_TEMPLATES = [
  'Lead and manage daily operations',
  'Collaborate with cross-functional teams',
  'Prepare and present reports to management',
  'Ensure compliance with company policies and industry standards',
  'Mentor and train junior team members',
  'Identify and implement process improvements',
  'Manage stakeholder relationships effectively',
  'Conduct research and analysis as needed',
  'Participate in strategic planning sessions',
  'Maintain documentation and records',
  'Handle client communications professionally',
  'Support business development initiatives',
  'Monitor KPIs and performance metrics',
  'Develop and implement new strategies',
  'Troubleshoot and resolve issues promptly',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randN<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(daysBack: number, daysForward: number): Date {
  const now = Date.now();
  const from = now - daysBack * 86400000;
  const to = now + daysForward * 86400000;
  return new Date(from + Math.random() * (to - from));
}

function getSalaryRange(level: ExperienceLevel): { min: number; max: number } {
  switch (level) {
    case ExperienceLevel.ENTRY:
      return { min: randInt(15, 25) * 1000, max: randInt(25, 40) * 1000 };
    case ExperienceLevel.MID:
      return { min: randInt(30, 50) * 1000, max: randInt(50, 80) * 1000 };
    case ExperienceLevel.SENIOR:
      return { min: randInt(60, 100) * 1000, max: randInt(100, 150) * 1000 };
    case ExperienceLevel.EXECUTIVE:
      return { min: randInt(100, 150) * 1000, max: randInt(150, 300) * 1000 };
    default:
      return { min: randInt(20, 40) * 1000, max: randInt(40, 70) * 1000 };
  }
}

function getExpYears(level: ExperienceLevel): { min: number; max: number } {
  switch (level) {
    case ExperienceLevel.ENTRY: return { min: 0, max: randInt(1, 2) };
    case ExperienceLevel.MID: return { min: randInt(2, 3), max: randInt(4, 6) };
    case ExperienceLevel.SENIOR: return { min: randInt(5, 7), max: randInt(8, 12) };
    case ExperienceLevel.EXECUTIVE: return { min: randInt(10, 12), max: randInt(15, 20) };
    default: return { min: 0, max: 5 };
  }
}

function generateDescription(title: string, company: string, category: string, skills: string[]): string {
  return `We are looking for a talented and motivated **${title}** to join our team at **${company}**.

## About the Role

This is an exciting opportunity to work in the ${category} sector. You will be responsible for delivering high-quality work and contributing to the growth of our organization.

## What We're Looking For

The ideal candidate should have strong skills in ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ` and ${skills[3]}` : ''}. You should be passionate about your work and eager to make an impact.

## Why Join Us?

At ${company}, we believe in fostering a culture of innovation and continuous learning. We offer competitive compensation, excellent benefits, and opportunities for career advancement.

If you're ready to take the next step in your career, we'd love to hear from you!`;
}

// ─── Generate jobs ─────────────────────────────────────────────────────────────

function generateJob(index: number) {
  const categoryName = rand(Object.keys(CATEGORIES));
  const cat = CATEGORIES[categoryName];
  const title = rand(cat.titles);
  const company = rand(COMPANY_NAMES);
  const expLevel = rand(EXP_LEVELS);
  const jobType = rand(JOB_TYPES);
  const division = rand(DIVISIONS_DATA);
  const district = rand(division.districts);
  const isRemote = Math.random() < 0.15;
  const skillNames = randN(cat.skills, 3, 7);
  const salary = getSalaryRange(expLevel);
  const isNegotiable = Math.random() < 0.3;
  const subcategory = rand(cat.subcategories);
  const expYears = getExpYears(expLevel);
  const isFeatured = Math.random() < 0.08;
  const status = Math.random() < 0.85 ? JobStatus.ACTIVE : rand([JobStatus.ACTIVE, JobStatus.PAUSED, JobStatus.EXPIRED, JobStatus.CLOSED]);
  const publishedAt = randDate(90, 0);
  const deadline = new Date(publishedAt.getTime() + randInt(14, 60) * 86400000);

  const requirements = randN(REQUIREMENTS_TEMPLATES, 4, 7).map((r) =>
    r.replace('{years}', String(expYears.min || 1)).replace('{skill}', rand(skillNames)),
  );
  const responsibilities = randN(RESPONSIBILITIES_TEMPLATES, 4, 7);
  const benefits = randN(BENEFITS, 4, 8);

  return {
    title,
    slug: generateSlug(`${title}-${company}-${index}`),
    description: generateDescription(title, company, categoryName, skillNames),
    shortDescription: `${company} is hiring a ${title}. ${isRemote ? 'Remote work available.' : `Location: ${district}, ${division.name}.`} Apply now!`,
    source: JobSource.ORIGINAL,
    sourceJobId: `seed-${index}-${crypto.randomBytes(4).toString('hex')}`,
    companyName: company,
    category: categoryName,
    subcategory,
    jobType,
    experienceLevel: expLevel,
    experienceYears: expYears,
    location: {
      district: isRemote ? undefined : district,
      division: isRemote ? undefined : division.name,
      address: isRemote ? undefined : `${district}, ${division.name}`,
      isRemote,
      country: 'Bangladesh',
    },
    salary: {
      min: salary.min,
      max: salary.max,
      currency: 'BDT',
      isNegotiable,
      period: SalaryPeriod.MONTHLY,
    },
    skillNames,
    education: { degree: rand(cat.degrees) },
    requirements,
    responsibilities,
    benefits,
    applicationMethod: rand(APP_METHODS),
    status,
    publishedAt,
    deadline,
    vacancies: randInt(1, 5),
    viewCount: randInt(0, 500),
    applicationCount: randInt(0, 50),
    saveCount: randInt(0, 30),
    isFeatured,
    isApproved: true,
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const TOTAL_JOBS = 1200;
const BATCH_SIZE = 200;

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_platform';
  console.log(`Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing seeded demo jobs
  const deleted = await Job.deleteMany({ sourceJobId: { $regex: /^seed-/ } });
  console.log(`Cleared ${deleted.deletedCount} existing demo jobs`);

  let totalInserted = 0;

  for (let batch = 0; batch < Math.ceil(TOTAL_JOBS / BATCH_SIZE); batch++) {
    const start = batch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, TOTAL_JOBS);
    const jobs = [];

    for (let i = start; i < end; i++) {
      jobs.push(generateJob(i));
    }

    const result = await Job.insertMany(jobs, { ordered: false });
    totalInserted += result.length;
    console.log(`Batch ${batch + 1}: Inserted ${result.length} jobs (total: ${totalInserted})`);
  }

  console.log(`\nDone! Inserted ${totalInserted} demo job posts.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
