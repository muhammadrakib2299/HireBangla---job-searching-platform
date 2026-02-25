import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillDocument extends Document {
  name: string;
  slug: string;
  category?: string;
  description?: string;
  jobCount: number;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkillDocument>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: { type: String, trim: true, index: true },
    description: { type: String, maxlength: 500 },
    jobCount: { type: Number, default: 0 },
    userCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

skillSchema.index({ name: 'text' });

export const Skill = mongoose.model<ISkillDocument>('Skill', skillSchema);
