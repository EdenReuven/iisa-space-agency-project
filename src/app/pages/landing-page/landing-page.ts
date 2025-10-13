import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { registerFields } from '../../utils';
import { RegisterForm } from '../../types/common';

@Component({
  selector: 'app-landing-page',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
})
export class LandingPage implements OnInit {
  registrationForm!: FormGroup;
  fromFields: RegisterForm[] = registerFields;

  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this._buildRegisterForm();
  }

  private _buildRegisterForm(): void {
    const group: Record<string, any> = {};
    for (const field of this.fromFields) {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.minAge) validators.push(Validators.min(field.minAge));
      if (field.name === 'email') validators.push(Validators.email);

      group[field.name] = ['', validators];
    }
    this.registrationForm = this.fb.group(group);
    console.log(this.registrationForm);
  }

  getError(fieldName: string): string {
    const control = this.registrationForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) return 'This field is required';

    if (control.hasError('email')) return 'Please enter a valid email address';

    if (control.hasError('minlength'))
      return `Minimum length is ${control.getError('minlength').requiredLength} characters`;

    if (control.hasError('min'))
      return `You must be at least ${control.getError('min').min} years old`;

    return '';
  }
  
  onSubmit(): void {
    if (this.registrationForm.valid) {
      console.log('form  data:', this.registrationForm.value);
    } else console.log('form is invalid');
  }
}
