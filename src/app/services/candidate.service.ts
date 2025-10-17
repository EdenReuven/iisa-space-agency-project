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
}
