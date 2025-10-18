import { Component, EventEmitter, Inject, inject, Input, Output } from '@angular/core';
import { CardData } from '../../types';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-card',
  imports: [],
  templateUrl: './popup-card.html',
  styleUrl: './popup-card.scss',
})
export class PopupCard {
  currentIndex: number = 0;
  constructor(
    public dialogRef: MatDialogRef<PopupCard>,
    @Inject(MAT_DIALOG_DATA) public data: CardData[]
  ) {}

  close() {
    this.dialogRef.close();
  }
  next() {
    if (this.currentIndex < this.data.length - 1) this.currentIndex++;
  }

  prev() {
    if (this.currentIndex > 0) this.currentIndex--;
  }
}
