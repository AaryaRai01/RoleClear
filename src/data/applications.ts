export type ApplicationStatus =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface Application {
  id: string;
  company: string;
  role: string;
  date: string;
  status: ApplicationStatus;
  fit: number;
  color: string;
}

export const applications: Application[] = [
  {
    id: 'stripe-software-engineer-intern',
    company: 'Stripe',
    role: 'Software Engineer Intern',
    date: 'Jun 12',
    status: 'Interview',
    fit: 91,
    color: 'orange',
  },
  {
    id: 'razorpay-frontend-engineer',
    company: 'Razorpay',
    role: 'Frontend Engineer',
    date: 'Jun 10',
    status: 'Applied',
    fit: 84,
    color: 'blue',
  },
  {
    id: 'atlassian-backend-intern',
    company: 'Atlassian',
    role: 'Backend Intern',
    date: 'Jun 06',
    status: 'Screening',
    fit: 78,
    color: 'teal',
  },
];