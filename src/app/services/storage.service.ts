import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { Candidate } from '../types';
import { Injectable } from '@angular/core';
import { defer, from, Observable, shareReplay, switchMap } from 'rxjs';

interface IisaDB extends DBSchema {
  candidates: {
    key: string;
    value: Candidate;
  };
}

@Injectable({ providedIn: 'root' })
export class storageService {
  private db$: Observable<IDBPDatabase<IisaDB>>;

  constructor() {
    this.db$ = defer(() =>
      from(
        openDB<IisaDB>('iisa-db', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('candidates')) {
              db.createObjectStore('candidates', { keyPath: 'email' });
            }
          },
        })
      )
    ).pipe(shareReplay(1));
  }

  saveCandidate(candidate: Candidate): Observable<string> {
    return this.db$.pipe(switchMap((db) => from(db.put('candidates', candidate))));
  }

  getCandidate(email: string): Observable<Candidate | undefined> {
    return this.db$.pipe(switchMap((db) => from(db.get('candidates', email))));
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.db$.pipe(switchMap((db) => from(db.getAll('candidates'))));
  }
}
