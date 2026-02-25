'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface SkillsFormProps {
  skills: string[];
  onSave: (data: { skills: string[] }) => Promise<void>;
  isSaving: boolean;
}

export default function SkillsForm({ skills: initialSkills, onSave, isSaving }: SkillsFormProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [input, setInput] = useState('');

  const addSkill = () => {
    const skill = input.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async () => {
    await onSave({ skills });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Add Skills
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill and press Enter"
            className="flex h-10 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            Add
          </Button>
        </div>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No skills added yet. Add your skills to help employers find you.
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          Save Skills
        </Button>
      </div>
    </div>
  );
}
