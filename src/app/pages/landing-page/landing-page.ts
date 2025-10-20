import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { registerFields } from '../../utils';
import { Candidate, RegisterForm } from '../../types/common';
import { CandidateService } from '../../services/candidate.service';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../components';

@Component({
  selector: 'app-landing-page',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CommonModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
})
export class LandingPage implements OnInit {
  registrationForm!: FormGroup;
  fromFields: RegisterForm[] = registerFields;
  selectedImg: string | ArrayBuffer | null | undefined = null;
  successMessage: string = '';
  errorMessage: string = '';
  formType: 'new' | 'emailOnly' | 'edit' = 'new';

  private fb = inject(FormBuilder);
  private storage = inject(StorageService);
  private candidateService = inject(CandidateService);
  private dialog = inject(MatDialog);

  // constructor(private dialog: MatDialog){}

  ngOnInit(): void {
    this.storage.incrementVisits();
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

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    this.fileToBase64(file).then((base64) => {
      this.selectedImg = base64;
      this.registrationForm.patchValue({ profileImage: this.selectedImg });
    });
  }

  switchToCheckEmail() {
    this.formType = 'emailOnly';
    this.registrationForm.reset();
    this.registrationForm.get('email')?.setValue('');
  }

  switchToNewForm() {
    this.errorMessage = '';
    this.formType = 'new';
    this.registrationForm.get('email')?.enable();
    this.resetForm();
  }

  resetForm() {
    this.formType = 'new';
    this.registrationForm.reset();
    this.registrationForm.get('email')?.enable();
    this.selectedImg = null;

    Object.keys(this.registrationForm.controls).forEach((key) => {
      this.registrationForm.get(key)?.markAsUntouched();
      this.registrationForm.get(key)?.setErrors(null);
      this.registrationForm.get(key)?.markAsPristine();
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const exist = this.candidateService.checkIfExist(this.registrationForm.get('email')?.value);
      if (exist && this.formType !== 'edit') {
        const dialogRef = this.dialog.open(ConfirmDialog, {
          data: {
            title: 'Email Already Exists',
            message:
              'A user with this email already exists. Do you want to update the information?',
          },
        });
        dialogRef.afterClosed().subscribe((res) => {
          if (res) {
            this.loadUpdateForm(exist);
          } else {
            this.resetForm();
          }
        });
      } else {
        this.candidateService.saveCandidate(this.registrationForm.getRawValue());
        this.successMessage =
          this.formType === 'edit'
            ? 'Your registration has been updated.'
            : 'You have successfully registered.';
        this.resetForm();
        setTimeout(() => {
          this.successMessage = '';
        }, 10000);
      }
    }
  }

  onEmailSubmit(): void {
    const exist = this.candidateService.checkIfExist(this.registrationForm.get('email')?.value);
    if (exist) {
      this.loadUpdateForm(exist);
    } else {
      this.errorMessage = 'The email does not exist. Please register.';

      setTimeout(() => {
        this.successMessage = '';
      }, 10000);
    }
  }

  loadUpdateForm(exist: Candidate) {
    this.formType = 'edit';

    this.registrationForm.setValue({
      profileImage: exist.profileImage,
      fullName: exist.fullName,
      email: exist.email,
      phone: exist.phone,
      age: exist.age,
      city: exist.city,
      hobbies: exist.hobbies,
      reason: exist.reason,
    });

    this.selectedImg = exist.profileImage;
    this.registrationForm.get('email')?.disable();
  }
}
