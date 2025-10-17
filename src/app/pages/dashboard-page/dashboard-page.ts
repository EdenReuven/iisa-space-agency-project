import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../types';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ChartService } from '../../services/chart.service';
import { Chart } from 'chart.js';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatTableModule, MatSort],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements AfterViewInit {
  private candidateService = inject(CandidateService);
  private chartService = inject(ChartService);
  private mapService = inject(MapService);

  @ViewChild('ageChart') ageChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cityChart') cityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('map') mapContainer!: ElementRef;

  private isMapInitialized = signal(false);
  candidates = this.candidateService.candidates;
  cities: string[] = [];
  displayedColumns: string[] = ['picture', 'name', 'email', 'summary'];
  dataSource = new MatTableDataSource<Candidate>([]);
  ageChart: Chart | null = null;
  cityChart: Chart | null = null;
  ageGroups: Record<string, number> = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-60': 0,
    '60+': 0,
  };

  constructor() {
    effect(async () => {
      this.dataSource.data = this.candidates();

      if (this.ageChart) this._updateAgeChart();
      if (this.cityChart) this._updateCityChart();

      if (this.isMapInitialized()) {
        const citiesGroups = this._buildCityGroups();
        this.cities = Object.keys(citiesGroups);
        if (this.cities.length > 0) {
          await this.mapService.addCityNames(this.cities);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.ageChart = this.chartService.initChart(
      this.ageChartRef.nativeElement,
      this._buildAgeGroups(),
      'Candidates Ages Breakdown',
      'bar'
    );
    this.cityChart = this.chartService.initChart(
      this.cityChartRef.nativeElement,
      this._buildCityGroups(),
      'Candidates cities Breakdown',
      'doughnut'
    );

    this.mapService
      .initMap(this.mapContainer.nativeElement)
      .then(() => {
        this.isMapInitialized.set(true);
      })
      .catch((err) => console.error('Map init failed', err));
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

  private _updateCityChart() {
    if (!this.cityChart) return;
    const cities = this._buildCityGroups();
    const newLabels = Object.keys(cities);

    this.cityChart.data.labels = newLabels;
    this.cityChart.data.datasets[0].data = Object.values(cities);
    this.cityChart.data.datasets[0].backgroundColor = this.chartService.getColors(newLabels.length);

    this.cityChart.update();
  }

  private _buildCityGroups() {
    const cityGroups: Record<string, number> = {};
    this.candidates().forEach((c) => {
      if (cityGroups[c.city]) {
        cityGroups[c.city]++;
      } else {
        cityGroups[c.city] = 1;
      }
    });
    return cityGroups;
  }

  getSummary(candidate: Candidate) {
    return this.candidateService.getSummary(candidate);
  }
}
