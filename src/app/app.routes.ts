import { Routes } from '@angular/router';
import { DashboardPage, LandingPage } from './pages';


export const routes: Routes = [
    { path: '', component: LandingPage, data: { title: 'IISA | Landing Page' }  },
    { path: 'dashboard', component: DashboardPage ,data: { title: 'IISA | Dashboard' } },
];
