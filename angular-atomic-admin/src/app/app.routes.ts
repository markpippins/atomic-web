import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ServiceListComponent } from './features/services/service-list.component';
import { ServerListComponent } from './features/servers/server-list.component';
import { ConfigComponent } from './features/config/config.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'services', component: ServiceListComponent },
  { path: 'servers', component: ServerListComponent },
  { path: 'config', component: ConfigComponent },
];
