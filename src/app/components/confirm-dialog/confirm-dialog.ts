import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
    private dialogRef: MatDialogRef<ConfirmDialog>
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
