import { RegisterForm } from '../types';

export const registerFields: RegisterForm[] = [
  {
    name: 'profileImage',
    label: 'Profile Image',
    type: 'file',
    required: false,
  },
  {
    name: 'fullName',
    label: 'FullName',
    type: 'text',
    required: true,
    minLength: 3,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    required: true,
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    required: true,
    minAge: 18,
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    required: true,
  },
  {
    name: 'hobbies',
    label: 'Hobbies',
    type: 'textarea',
    required: false,
  },
  {
    name: 'reason',
    label: 'Why I am the perfect candidate',
    type: 'textarea',
    required: false,
  },
];
