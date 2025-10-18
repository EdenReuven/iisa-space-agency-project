import { Injectable, signal } from '@angular/core';
import { Candidate } from '../types';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  candidates = signal<Candidate[]>([]);
  private bc = new BroadcastChannel('candidates-channel');

  constructor(private storageService: StorageService) {
    this.loadCandidate();
    this.bc.onmessage = (event) => {
      if (event.data?.type === 'update-candidate') {
        this.loadCandidate();
      }
    };
  }

  private loadCandidate() {
    this.storageService.getAllCandidates().subscribe((candidates) => {
      this.candidates.set(candidates);
    });
  }

  saveCandidate(candidate: Candidate) {
    const candidatesList = this.candidates();
    const foundIndex = candidatesList.findIndex((x) => x.email === candidate.email);
    candidate.city = this.cityNameFormat(candidate.city);

    candidate.createdDate = foundIndex === -1 ? new Date() : candidatesList[foundIndex].createdDate;
    if (!this.isUpdateAllowed(candidate.createdDate)) return;

    this.storageService.saveCandidate(candidate).subscribe(() => {
      const updatedList =
        foundIndex === -1
          ? [...candidatesList, candidate]
          : candidatesList.map((c) => (c.email === candidate.email ? candidate : c));

      this.candidates.set(updatedList);

      this.bc.postMessage({ type: 'update-candidate', candidate });
    });
  }

  cityNameFormat(city: string) {
    return city
      .split(' ')
      .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
      .join('-');
  }

  getSummary(candidate: Candidate) {
    const city = candidate.city;
    const hobbies = candidate.hobbies ?? '';
    const age = candidate.age;

    return `${age} years old, live in ${city} , love to ${hobbies}`;
  }

  isUpdateAllowed(submittedDate: Date) {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const difference = now.getTime() - submittedDate.getTime();

    return difference < threeDays;
  }
}
