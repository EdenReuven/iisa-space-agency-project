import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../types';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatTableModule, MatSort],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private candidateService = inject(CandidateService);
  candidates = this.candidateService.candidates;

  displayedColumns: string[] = ['picture', 'name', 'email', 'summary'];
  dataSource = new MatTableDataSource<Candidate>([]);

  constructor() {
    effect(() => {
      this.dataSource.data = this.candidates();
      console.log(this.dataSource.data);
    });
  }

  getSummary(candidate: Candidate) {
    return this.candidateService.getSummary(candidate);
  }
}
