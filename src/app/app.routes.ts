import { Routes } from '@angular/router';
import { DashboardPage, LandingPage } from './pages';


export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'dashboard', component: DashboardPage },
];
