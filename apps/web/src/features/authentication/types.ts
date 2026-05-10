export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  education: string;
  major: string;
  yearsOfExperience: string;
  workExperience: string;
  preferredLocations: string;
  preferredWorkMode: string;
};

export const EMPTY_REGISTER_FORM: RegisterFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  education: '',
  major: '',
  yearsOfExperience: '',
  workExperience: '',
  preferredLocations: '',
  preferredWorkMode: '',
};
