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
import { Candidate, CardData } from '../../types';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ChartService } from '../../services/chart.service';
import { Chart } from 'chart.js';
import { MapService } from '../../services/map.service';
import { StorageService } from '../../services/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupCard } from '../../components';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatTableModule, MatSort, MatInputModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements AfterViewInit {
  private candidateService = inject(CandidateService);
  private chartService = inject(ChartService);
  private mapService = inject(MapService);
  private storageService = inject(StorageService);

  @ViewChild('ageChart') ageChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cityChart') cityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('map') mapContainer!: ElementRef;

  private isMapInitialized = signal(false);
  totalVisits = signal<number>(0);
  filterTerm = signal('');
  candidates = this.candidateService.candidates;
  cities: string[] = [];
  displayedColumns: string[] = ['picture', 'name', 'summary'];
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

  constructor(private dialog: MatDialog) {
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

    this.storageService.bc.onmessage = (event) => {
      this.totalVisits.set(event.data);
    };

    this.storageService.getVisitors().subscribe((count) => {
      this.totalVisits.set(count);
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

  onRowClick(index: number) {
    let data: CardData[] = [];
    this.candidates().forEach((c) => {
      data.push({
        title: c.fullName,
        content: [
          { label: 'Email:', content: c.email },
          { label: 'Phone:', content: c.phone },
          { label: 'Age:', content: c.age },
          { label: 'City:', content: c.city },
          { label: 'Hobbies:', content: c.hobbies },
          { label: 'Reason:', content: c.reason },
        ],
        img: c.profileImage,
      });
    });
    this.dialog.open(PopupCard, {
      data,
      panelClass: 'custom-dialog-container',
    }).componentInstance.currentIndex = index;
  }

  getMonitorString() {
    return `Total Visits : ${this.totalVisits()} | Registered Candidates : ${
      this.candidates().length
    } `;
  }

  filterCandidate(): Candidate[] {
    const term = this.filterTerm().toLowerCase().trim();
    if (!term) return this.candidates();

    return this.candidates().filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        +c.age === +term
    );
  }
  
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterTerm.set(value);
    this.dataSource.data = this.filterCandidate();
  }
}
