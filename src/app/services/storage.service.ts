import { IDBPDatabase, openDB } from 'idb';
import { Candidate, IisaDB } from '../types';
import { Injectable } from '@angular/core';
import { defer, from, map, Observable, shareReplay, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private db$: Observable<IDBPDatabase<IisaDB>>;
  bc = new BroadcastChannel('visits');

  constructor() {
    this.db$ = defer(() =>
      from(
        openDB<IisaDB>('iisa-db', 4, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('candidates')) {
              db.createObjectStore('candidates', { keyPath: 'email' });
            }
            if (!db.objectStoreNames.contains('visitorsCounter')) {
              db.createObjectStore('visitorsCounter');
            }
          },
        })
      )
    ).pipe(shareReplay(1));
    this._initVisits();
  }

  private _initVisits() {
    this.db$
      .pipe(
        switchMap((db) =>
          from(db.get('visitorsCounter', 'totalVisits')).pipe(
            switchMap((exist) => {
              return !exist ? from(db.put('visitorsCounter', 0, 'totalVisits')) : from([null]);
            })
          )
        )
      )
      .subscribe();
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

  incrementVisits(): void {
  this.db$
    .pipe(
      switchMap(db =>
        from(db.get('visitorsCounter', 'totalVisits')).pipe(
          switchMap(current => from(db.put('visitorsCounter', (current || 0) + 1, 'totalVisits'))),
          switchMap(() => from(db.get('visitorsCounter', 'totalVisits')))
        )
      )
    )
    .subscribe(count => {
      this.bc.postMessage(count);
    });
  }

  getVisitors(): Observable<number> {
    return this.db$.pipe(
      switchMap((db) => from(db.get('visitorsCounter', 'totalVisits'))),
      map((val) => val || 0)
    );
  }
}
