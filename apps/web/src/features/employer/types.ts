export type JobPostingFormValues = {
  title: string;
  description: string;
  educationLevel: string;
  yearsOfExperience: string;
  workMode: string;
  location: string;
  employerId: string;
};

export const EMPTY_JOB_POSTING_FORM: JobPostingFormValues = {
  title: '',
  description: '',
  educationLevel: '',
  yearsOfExperience: '',
  workMode: '',
  location: '',
  employerId: '',
};
