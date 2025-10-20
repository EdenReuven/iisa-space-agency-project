import { DBSchema } from 'idb';

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
  maxAge?:number;
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
  createdDate: Date;
}

export interface IisaDB extends DBSchema {
  candidates: {
    key: string;
    value: Candidate;
  };
  visitorsCounter: {
    key: 'totalVisits';
    value: number;
  };
}

export interface CardData {
  title: string;
  content: { label: string; content: string | number | undefined , type:'input'| 'textarea' }[];
  img: string | undefined | ArrayBuffer | null;
}
