export interface NavLink {
  title: string;
  path: string;
}

export interface RegisterForm {
  name : string;
  label : string;
  type : string;
  required:boolean;
  minLength?:number;
  minAge? : number;
}
