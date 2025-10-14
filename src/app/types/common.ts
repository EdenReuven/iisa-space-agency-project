export interface NavLink {
  title: string;
  path: string;
}

export interface RegisterForm {
  name: string;
  label: string;
  type: string;
  required: boolean;
  minLength?: number;
  minAge?: number;
}

export interface Candidate {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  hobbies?: string;
  reason?: string;
  profileImage?: string | ArrayBuffer | null;
}
