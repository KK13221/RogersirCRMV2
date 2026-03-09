import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { UsersComponent } from './pages/users/users';
import { AlertsComponent } from './pages/alerts/alerts';
import { DevelopmentComponent } from './pages/development/development';
import { AppsComponent } from './pages/apps/apps';
import { ArchiveComponent } from './pages/archive/archive';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard';
import { ContactsComponent } from './pages/contacts/contacts';
import { ServersComponent } from './pages/servers/servers';
import { FinanceComponent } from './pages/finance/finance';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'users', component: UsersComponent },
    { path: 'alerts', component: AlertsComponent },
    { path: 'development', component: DevelopmentComponent },
    { path: 'apps', component: AppsComponent },
    { path: 'archive', component: ArchiveComponent },
    { path: 'customer-dashboard', component: CustomerDashboardComponent },
    { path: 'contacts', component: ContactsComponent },
    { path: 'servers', component: ServersComponent },
    { path: 'finance', component: FinanceComponent },
    { path: '**', redirectTo: 'dashboard' }
];
