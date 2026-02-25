export interface JobCategory {
  name: string;
  slug: string;
  icon: string;
  subcategories: string[];
}

export const JOB_CATEGORIES: JobCategory[] = [
  {
    name: 'IT & Software',
    slug: 'it-software',
    icon: 'Monitor',
    subcategories: [
      'Web Development', 'Mobile Development', 'Software Engineering',
      'DevOps', 'QA & Testing', 'Database Administration', 'UI/UX Design',
      'Cybersecurity', 'Cloud Computing', 'Data Science', 'AI & Machine Learning',
    ],
  },
  {
    name: 'Banking & Finance',
    slug: 'banking-finance',
    icon: 'Landmark',
    subcategories: [
      'Banking', 'Accounting', 'Financial Analysis', 'Insurance',
      'Investment', 'Microfinance', 'Auditing',
    ],
  },
  {
    name: 'Marketing & Sales',
    slug: 'marketing-sales',
    icon: 'TrendingUp',
    subcategories: [
      'Digital Marketing', 'Sales', 'Brand Management', 'Content Marketing',
      'SEO/SEM', 'Social Media', 'Market Research', 'E-commerce',
    ],
  },
  {
    name: 'Engineering',
    slug: 'engineering',
    icon: 'Wrench',
    subcategories: [
      'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering',
      'Chemical Engineering', 'Textile Engineering', 'Industrial Engineering',
    ],
  },
  {
    name: 'Education & Training',
    slug: 'education-training',
    icon: 'GraduationCap',
    subcategories: [
      'Teaching', 'Academic Research', 'Corporate Training',
      'Tutoring', 'Curriculum Development', 'E-learning',
    ],
  },
  {
    name: 'Healthcare & Pharma',
    slug: 'healthcare-pharma',
    icon: 'Heart',
    subcategories: [
      'Medical Practice', 'Nursing', 'Pharmaceutical',
      'Hospital Management', 'Public Health', 'Lab Technician',
    ],
  },
  {
    name: 'NGO & Development',
    slug: 'ngo-development',
    icon: 'Globe',
    subcategories: [
      'Program Management', 'Monitoring & Evaluation', 'Community Development',
      'Humanitarian Aid', 'Fundraising', 'Advocacy',
    ],
  },
  {
    name: 'Garments & Textile',
    slug: 'garments-textile',
    icon: 'Shirt',
    subcategories: [
      'Production', 'Quality Control', 'Merchandising',
      'Compliance', 'Supply Chain', 'Design',
    ],
  },
  {
    name: 'Telecommunications',
    slug: 'telecommunications',
    icon: 'Phone',
    subcategories: [
      'Network Engineering', 'Customer Support', 'Technical Operations',
      'Sales & Marketing',
    ],
  },
  {
    name: 'Media & Creative',
    slug: 'media-creative',
    icon: 'Palette',
    subcategories: [
      'Journalism', 'Graphic Design', 'Photography', 'Video Production',
      'Content Writing', 'Animation', 'Public Relations',
    ],
  },
  {
    name: 'Government',
    slug: 'government',
    icon: 'Building2',
    subcategories: [
      'Civil Service', 'Defense', 'Public Administration',
      'Law Enforcement', 'Judiciary',
    ],
  },
  {
    name: 'Human Resources',
    slug: 'human-resources',
    icon: 'Users',
    subcategories: [
      'Recruitment', 'HR Management', 'Payroll', 'Training & Development',
      'Employee Relations', 'Compensation & Benefits',
    ],
  },
  {
    name: 'Logistics & Supply Chain',
    slug: 'logistics-supply-chain',
    icon: 'Truck',
    subcategories: [
      'Warehousing', 'Transportation', 'Procurement',
      'Inventory Management', 'Import/Export',
    ],
  },
  {
    name: 'Legal',
    slug: 'legal',
    icon: 'Scale',
    subcategories: [
      'Corporate Law', 'Litigation', 'Compliance',
      'Intellectual Property', 'Contract Management',
    ],
  },
  {
    name: 'Customer Service',
    slug: 'customer-service',
    icon: 'Headphones',
    subcategories: [
      'Call Center', 'Help Desk', 'Client Relations', 'Technical Support',
    ],
  },
  {
    name: 'Real Estate & Construction',
    slug: 'real-estate-construction',
    icon: 'Building',
    subcategories: [
      'Architecture', 'Construction Management', 'Property Management',
      'Interior Design', 'Urban Planning',
    ],
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    icon: 'Sprout',
    subcategories: [
      'Farming', 'Agribusiness', 'Food Processing',
      'Fisheries', 'Livestock',
    ],
  },
  {
    name: 'Others',
    slug: 'others',
    icon: 'MoreHorizontal',
    subcategories: ['General', 'Miscellaneous'],
  },
];

export const ALL_CATEGORY_NAMES = JOB_CATEGORIES.map((c) => c.name);
export const ALL_CATEGORY_SLUGS = JOB_CATEGORIES.map((c) => c.slug);
