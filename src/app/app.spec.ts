import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { App } from './app';

// Page Components
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

// ============================================================
// APP SHELL TESTS
// ============================================================
describe('App Shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render GBT Admin title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('GBT Admin');
  });

  it('should have setup nav items', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.navSetup.length).toBe(5);
  });

  it('should have customer nav items', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.navCustomers.length).toBe(4);
  });

  it('should toggle dark mode on and off', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.isDarkMode).toBe(false);
    app.toggleDarkMode();
    expect(app.isDarkMode).toBe(true);
    app.toggleDarkMode();
    expect(app.isDarkMode).toBe(false);
  });

  it('should add dark class to html element when dark mode enabled', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.enableDark();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    document.documentElement.classList.remove('dark');
  });

  it('should update searchQuery on search', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.onSearchChange('test query');
    expect(app.searchQuery).toBe('test query');
  });
});

// ============================================================
// DASHBOARD PAGE TESTS
// ============================================================
describe('Dashboard Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(DashboardComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have 4 metric cards', () => {
    const f = TestBed.createComponent(DashboardComponent);
    expect(f.componentInstance.metricsData.length).toBe(4);
  });

  it('should have 12 months for bar chart', () => {
    const f = TestBed.createComponent(DashboardComponent);
    expect(f.componentInstance.months.length).toBe(12);
    expect(f.componentInstance.barHeights.length).toBe(12);
  });

  it('should have 4 weekly data points', () => {
    const f = TestBed.createComponent(DashboardComponent);
    expect(f.componentInstance.weeklyData.length).toBe(4);
  });

  it('should have 3 clusters in server table', () => {
    const f = TestBed.createComponent(DashboardComponent);
    expect(f.componentInstance.clustersData.length).toBe(3);
  });

  it('should have 3 alerts', () => {
    const f = TestBed.createComponent(DashboardComponent);
    expect(f.componentInstance.alertsData.length).toBe(3);
  });

  it('should count unread alerts correctly', () => {
    const f = TestBed.createComponent(DashboardComponent);
    const app = f.componentInstance;
    const unread = app.alertsData.filter((a: any) => !a.read).length;
    expect(app.unreadCount).toBe(unread);
  });

  it('should mark alert as read on click', () => {
    const f = TestBed.createComponent(DashboardComponent);
    const app = f.componentInstance;
    const alert = app.alertsData[0];
    alert.read = false;
    app.markRead(alert);
    expect(alert.read).toBe(true);
  });

  it('should mark all alerts as read', () => {
    const f = TestBed.createComponent(DashboardComponent);
    const app = f.componentInstance;
    app.markAllRead();
    expect(app.alertsData.every((a: any) => a.read)).toBe(true);
  });
});

// ============================================================
// USERS PAGE TESTS
// ============================================================
describe('Users Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(UsersComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have users array', () => {
    const f = TestBed.createComponent(UsersComponent);
    expect(f.componentInstance.users.length).toBeGreaterThan(0);
  });

  it('should have module utilization data', () => {
    const f = TestBed.createComponent(UsersComponent);
    expect(f.componentInstance.modules.length).toBeGreaterThan(0);
  });

  it('should have audit logs', () => {
    const f = TestBed.createComponent(UsersComponent);
    expect(f.componentInstance.auditLogs.length).toBeGreaterThan(0);
  });

  it('should filter users by search term', () => {
    const f = TestBed.createComponent(UsersComponent);
    const app = f.componentInstance;
    const total = app.users.length;
    app.searchTerm = 'Alex';
    expect(app.filteredUsers.length).toBeGreaterThan(0);
    expect(app.filteredUsers.length).toBeLessThanOrEqual(total);
    expect(app.filteredUsers.every((u: any) => u.name.includes('Alex') || u.email.includes('Alex'))).toBe(true);
  });

  it('should filter users by role', () => {
    const f = TestBed.createComponent(UsersComponent);
    const app = f.componentInstance;
    app.filterRole = 'Admin';
    app.filteredUsers.forEach((u: any) => expect(u.role).toBe('Admin'));
  });

  it('should show all users when no filters', () => {
    const f = TestBed.createComponent(UsersComponent);
    const app = f.componentInstance;
    expect(app.filteredUsers.length).toBe(app.users.length);
  });
});

// ============================================================
// ALERTS PAGE TESTS
// ============================================================
describe('Alerts Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(AlertsComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have stats data', () => {
    const f = TestBed.createComponent(AlertsComponent);
    expect(f.componentInstance.stats.length).toBe(4);
  });

  it('should have alerts list', () => {
    const f = TestBed.createComponent(AlertsComponent);
    expect(f.componentInstance.alerts.length).toBeGreaterThan(0);
  });

  it('should filter alerts by severity', () => {
    const f = TestBed.createComponent(AlertsComponent);
    const app = f.componentInstance;
    app.activeFilter = 'Critical';
    app.filteredAlerts.forEach((a: any) => expect(a.severity).toBe('CRITICAL'));
  });

  it('should show all alerts when filter is All', () => {
    const f = TestBed.createComponent(AlertsComponent);
    const app = f.componentInstance;
    app.activeFilter = 'All';
    expect(app.filteredAlerts.length).toBe(app.alerts.length);
  });

  it('should mark alert as read', () => {
    const f = TestBed.createComponent(AlertsComponent);
    const app = f.componentInstance;
    const alert = app.alerts[0];
    alert.read = false;
    app.markRead(alert);
    expect(alert.read).toBe(true);
  });

  it('should mark all alerts as read', () => {
    const f = TestBed.createComponent(AlertsComponent);
    const app = f.componentInstance;
    app.markAllRead();
    expect(app.alerts.every((a: any) => a.read)).toBe(true);
  });

  it('should remove alert when resolved', () => {
    const f = TestBed.createComponent(AlertsComponent);
    const app = f.componentInstance;
    const initial = app.alerts.length;
    const fakeEvent = { stopPropagation: () => { } } as Event;
    app.resolveAlert(app.alerts[0], fakeEvent);
    expect(app.alerts.length).toBe(initial - 1);
  });

  it('should remove alert when dismissed', () => {
    const f = TestBed.createComponent(AlertsComponent);
    const app = f.componentInstance;
    const initial = app.alerts.length;
    const fakeEvent = { stopPropagation: () => { } } as Event;
    app.dismissAlert(app.alerts[0], fakeEvent);
    expect(app.alerts.length).toBe(initial - 1);
  });
});

// ============================================================
// APPS PAGE TESTS
// ============================================================
describe('Apps Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppsComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(AppsComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have platforms', () => {
    const f = TestBed.createComponent(AppsComponent);
    expect(f.componentInstance.platforms.length).toBe(3);
  });

  it('should have artifacts', () => {
    const f = TestBed.createComponent(AppsComponent);
    expect(f.componentInstance.artifacts.length).toBeGreaterThan(0);
  });

  it('should filter artifacts by search', () => {
    const f = TestBed.createComponent(AppsComponent);
    const app = f.componentInstance;
    app.searchTerm = 'apk';
    app.filteredArtifacts.forEach((a: any) => expect(a.name.toLowerCase()).toContain('apk'));
  });

  it('should filter artifacts by platform', () => {
    const f = TestBed.createComponent(AppsComponent);
    const app = f.componentInstance;
    app.activePlatform = 'Android';
    app.filteredArtifacts.forEach((a: any) => expect(a.platform).toBe('Android'));
  });

  it('should remove artifact when deleted', () => {
    const f = TestBed.createComponent(AppsComponent);
    const app = f.componentInstance;
    const initial = app.artifacts.length;
    // Delete first non-read-only artifact
    const target = app.artifacts.find((a: any) => !a.readOnly);
    if (target) {
      spyOn(window, 'confirm').and.returnValue(true);
      app.deleteArtifact(target);
      expect(app.artifacts.length).toBe(initial - 1);
    }
  });
});

// ============================================================
// ARCHIVE PAGE TESTS
// ============================================================
describe('Archive Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(ArchiveComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have versions', () => {
    const f = TestBed.createComponent(ArchiveComponent);
    expect(f.componentInstance.versions.length).toBeGreaterThan(0);
  });

  it('should filter by type', () => {
    const f = TestBed.createComponent(ArchiveComponent);
    const app = f.componentInstance;
    app.activeFilter = 'Production Build';
    app.filteredVersions.forEach((v: any) => expect(v.type).toBe('Production Build'));
  });

  it('should show all when filter is All', () => {
    const f = TestBed.createComponent(ArchiveComponent);
    const app = f.componentInstance;
    app.activeFilter = 'All';
    expect(app.filteredVersions.length).toBe(app.versions.length);
  });
});

// ============================================================
// DEVELOPMENT PAGE TESTS
// ============================================================
describe('Development Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopmentComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(DevelopmentComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have env stats', () => {
    const f = TestBed.createComponent(DevelopmentComponent);
    expect(f.componentInstance.envStats.length).toBe(4);
  });

  it('should have builds', () => {
    const f = TestBed.createComponent(DevelopmentComponent);
    expect(f.componentInstance.builds.length).toBeGreaterThan(0);
  });

  it('should have test logs', () => {
    const f = TestBed.createComponent(DevelopmentComponent);
    expect(f.componentInstance.testLogs.length).toBeGreaterThan(0);
  });

  it('should have approval steps', () => {
    const f = TestBed.createComponent(DevelopmentComponent);
    expect(f.componentInstance.approvalSteps.length).toBe(3);
  });

  it('should have quick links', () => {
    const f = TestBed.createComponent(DevelopmentComponent);
    expect(f.componentInstance.quickLinks.length).toBe(4);
  });
});

// ============================================================
// SERVERS PAGE TESTS
// ============================================================
describe('Servers Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServersComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(ServersComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have 4 KPI cards', () => {
    const f = TestBed.createComponent(ServersComponent);
    expect(f.componentInstance.kpis.length).toBe(4);
  });

  it('should have performance data', () => {
    const f = TestBed.createComponent(ServersComponent);
    expect(f.componentInstance.perfData.length).toBeGreaterThan(0);
  });

  it('should have quick actions', () => {
    const f = TestBed.createComponent(ServersComponent);
    expect(f.componentInstance.quickActions.length).toBeGreaterThan(0);
  });

  it('should have servers', () => {
    const f = TestBed.createComponent(ServersComponent);
    expect(f.componentInstance.servers.length).toBeGreaterThan(0);
  });

  it('should filter servers by status', () => {
    const f = TestBed.createComponent(ServersComponent);
    const app = f.componentInstance;
    app.activeFilter = 'Active';
    app.filteredServers.forEach((s: any) => expect(s.status).toBe('Active'));
  });

  it('should show all servers when filter is All', () => {
    const f = TestBed.createComponent(ServersComponent);
    const app = f.componentInstance;
    app.activeFilter = 'All';
    expect(app.filteredServers.length).toBe(app.servers.length);
  });
});

// ============================================================
// FINANCE PAGE TESTS
// ============================================================
describe('Finance Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(FinanceComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have KPIs', () => {
    const f = TestBed.createComponent(FinanceComponent);
    expect(f.componentInstance.kpis.length).toBe(4);
  });

  it('should have invoices', () => {
    const f = TestBed.createComponent(FinanceComponent);
    expect(f.componentInstance.invoices.length).toBeGreaterThan(0);
  });

  it('should have device usage data', () => {
    const f = TestBed.createComponent(FinanceComponent);
    expect(f.componentInstance.deviceUsage.length).toBe(3);
  });
});

// ============================================================
// CUSTOMER DASHBOARD TESTS
// ============================================================
describe('Customer Dashboard Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDashboardComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(CustomerDashboardComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have 4 KPIs', () => {
    const f = TestBed.createComponent(CustomerDashboardComponent);
    expect(f.componentInstance.kpis.length).toBe(4);
  });

  it('should have top customers', () => {
    const f = TestBed.createComponent(CustomerDashboardComponent);
    expect(f.componentInstance.topCustomers.length).toBeGreaterThan(0);
  });

  it('should have acquisition channels', () => {
    const f = TestBed.createComponent(CustomerDashboardComponent);
    expect(f.componentInstance.channels.length).toBeGreaterThan(0);
  });
});

// ============================================================
// CONTACTS PAGE TESTS
// ============================================================
describe('Contacts Page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const f = TestBed.createComponent(ContactsComponent);
    expect(f.componentInstance).toBeTruthy();
  });

  it('should have contacts', () => {
    const f = TestBed.createComponent(ContactsComponent);
    expect(f.componentInstance.contacts.length).toBeGreaterThan(0);
  });

  it('should default to grid view', () => {
    const f = TestBed.createComponent(ContactsComponent);
    expect(f.componentInstance.viewMode).toBe('grid');
  });

  it('should switch to list view', () => {
    const f = TestBed.createComponent(ContactsComponent);
    f.componentInstance.viewMode = 'list';
    expect(f.componentInstance.viewMode).toBe('list');
  });

  it('should filter contacts by search term', () => {
    const f = TestBed.createComponent(ContactsComponent);
    const app = f.componentInstance;
    app.searchTerm = 'Jennifer';
    expect(app.filteredContacts.length).toBeGreaterThan(0);
    expect(app.filteredContacts[0].name).toContain('Jennifer');
  });

  it('should filter contacts by company', () => {
    const f = TestBed.createComponent(ContactsComponent);
    const app = f.componentInstance;
    app.filterCompany = 'Globex Systems';
    app.filteredContacts.forEach((c: any) => expect(c.company).toBe('Globex Systems'));
  });
});
