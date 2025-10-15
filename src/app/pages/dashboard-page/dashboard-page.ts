import { AfterViewInit, Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../types';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ChartService } from '../../services/chart.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatTableModule, MatSort],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements AfterViewInit {
  private candidateService = inject(CandidateService);
  private chartService = inject(ChartService);

  @ViewChild('ageChart') ageChartRef!: ElementRef<HTMLCanvasElement>;

  candidates = this.candidateService.candidates;
  displayedColumns: string[] = ['picture', 'name', 'email', 'summary'];
  dataSource = new MatTableDataSource<Candidate>([]);
  ageChart: Chart | null = null;
  ageGroups: Record<string, number> = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-60': 0,
    '60+': 0,
  };

  constructor() {
    effect(() => {
      this.dataSource.data = this.candidates();
      if (this.ageChart) this._updateAgeChart();
    });
  }

  ngAfterViewInit(): void {
    this.ageChart = this.chartService.initChart(
      this.ageChartRef.nativeElement,
      this._buildAgeGroups(),
      'Candidates Ages Breakdown',
      'bar'
    );
  }

  private _updateAgeChart() {
    if (!this.ageChart) return;
    const ages = this._buildAgeGroups();
    this.ageChart.data.datasets[0].data = Object.values(ages);
    this.ageChart.update();
  }
  private _buildAgeGroups() {
    this.candidates().forEach((c) => {
      if (c.age <= 25) this.ageGroups['18-25']++;
      else if (c.age <= 35) this.ageGroups['26-35']++;
      else if (c.age <= 45) this.ageGroups['36-45']++;
      else if (c.age <= 60) this.ageGroups['46-60']++;
      else this.ageGroups['60+']++;
    });

    return this.ageGroups;
  }

  getSummary(candidate: Candidate) {
    return this.candidateService.getSummary(candidate);
  }
}
