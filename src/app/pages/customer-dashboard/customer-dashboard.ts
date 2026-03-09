import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-customer-dashboard',
    imports: [CommonModule],
    template: `
<div class="p-8 space-y-6">
  <div class="flex items-center justify-between">
    <div><h2 class="text-2xl font-bold text-slate-900 dark:text-white">Customer Dashboard</h2><p class="text-slate-500">Overview of customer health, activity, and growth.</p></div>
    <button (click)="exportReport()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
      <span class="material-symbols-outlined text-[18px]">download</span>Export Report
    </button>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
    @for (kpi of kpis; track kpi.label) {
      <div (click)="drillDown(kpi)" class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
        <div class="flex items-center justify-between mb-3">
          <div [class]="'p-2 rounded-lg ' + kpi.bg"><span [class]="'material-symbols-outlined ' + kpi.color">{{ kpi.icon }}</span></div>
          <span [class]="'text-xs font-bold px-2 py-1 rounded-full ' + kpi.changeClass">{{ kpi.change }}</span>
        </div>
        <p class="text-slate-500 text-sm">{{ kpi.label }}</p>
        <p class="text-2xl font-bold mt-1">{{ kpi.value }}</p>
      </div>
    }
  </div>

  <!-- Top Customers -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
        <h4 class="font-bold text-slate-800 dark:text-white">Top Customers by Revenue</h4>
        <button (click)="viewContacts()" class="text-primary text-xs font-bold hover:underline">View All</button>
      </div>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        @for (c of topCustomers; track c.id) {
          <div (click)="viewCustomer(c)" class="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">{{ c.rank }}</div>
            <div class="flex-1">
              <p class="text-sm font-semibold group-hover:text-primary transition-colors">{{ c.name }}</p>
              <p class="text-xs text-slate-400">{{ c.industry }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold">{{ c.revenue }}</p>
              <span [class]="'text-[10px] font-bold px-2 py-0.5 rounded-full ' + c.statusClass">{{ c.status }}</span>
            </div>
          </div>
        }
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-primary/10"><h4 class="font-bold text-slate-800 dark:text-white">Customer Acquisition</h4></div>
      <div class="p-6">
        <div class="space-y-4">
          @for (channel of channels; track channel.name) {
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ channel.name }}</span>
                <span class="text-sm font-bold">{{ channel.value }}%</span>
              </div>
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div [class]="'h-full rounded-full ' + channel.color" [style.width]="channel.value + '%'"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  </div>
</div>
`
})
export class CustomerDashboardComponent {
    kpis = [
        { label: 'Total Customers', value: '1,284', change: '+12%', changeClass: 'text-green-500 bg-green-50', icon: 'group', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
        { label: 'New This Month', value: '48', change: '+8%', changeClass: 'text-green-500 bg-green-50', icon: 'person_add', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-600' },
        { label: 'Churn Rate', value: '2.3%', change: '-0.5%', changeClass: 'text-green-500 bg-green-50', icon: 'trending_down', bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-600' },
        { label: 'Avg. Revenue', value: '$4,820', change: '+3.1%', changeClass: 'text-green-500 bg-green-50', icon: 'payments', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-600' },
    ];

    topCustomers = [
        { id: 1, rank: 1, name: 'Acme Corporation', industry: 'Manufacturing', revenue: '$124,000', status: 'Enterprise', statusClass: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
        { id: 2, rank: 2, name: 'Globex Systems', industry: 'Technology', revenue: '$98,500', status: 'Enterprise', statusClass: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
        { id: 3, rank: 3, name: 'TechNova Inc.', industry: 'SaaS', revenue: '$76,200', status: 'Business', statusClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
        { id: 4, rank: 4, name: 'Pinnacle Media', industry: 'Media', revenue: '$54,800', status: 'Business', statusClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
        { id: 5, rank: 5, name: 'Sterling Finance', industry: 'Finance', revenue: '$42,100', status: 'Starter', statusClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    ];

    channels = [
        { name: 'Direct Sales', value: 42, color: 'bg-primary' },
        { name: 'Organic Search', value: 28, color: 'bg-blue-400' },
        { name: 'Referrals', value: 18, color: 'bg-green-500' },
        { name: 'Social Media', value: 12, color: 'bg-purple-500' },
    ];

    constructor(private router: Router) { }
    exportReport() { alert('Exporting customer report...(mock)'); }
    drillDown(kpi: any) { alert(`${kpi.label}: ${kpi.value} (${kpi.change})`); }
    viewCustomer(c: any) { alert(`Customer: ${c.name}\nIndustry: ${c.industry}\nRevenue: ${c.revenue}`); }
    viewContacts() { this.router.navigate(['/contacts']); }
}
