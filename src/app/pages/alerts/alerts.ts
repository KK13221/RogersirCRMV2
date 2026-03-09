import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-alerts',
    imports: [CommonModule, FormsModule],
    template: `
<div class="p-8 space-y-6">
  <div class="flex items-center justify-between">
    <div><h2 class="text-2xl font-bold text-slate-900 dark:text-white">Alerts</h2><p class="text-slate-500">Monitor system alerts and notifications.</p></div>
    <div class="flex gap-2">
      <button (click)="markAllRead()" class="px-4 py-2 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">Mark All Read</button>
      <button (click)="configureAlerts()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
        <span class="material-symbols-outlined text-[18px]">tune</span>Configure
      </button>
    </div>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-4 gap-4">
    @for (stat of stats; track stat.label) {
      <div [class]="'bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform'">
        <div [class]="'p-2 rounded-lg ' + stat.bg"><span [class]="'material-symbols-outlined ' + stat.color">{{ stat.icon }}</span></div>
        <div><p class="text-2xl font-bold">{{ stat.value }}</p><p class="text-xs text-slate-500">{{ stat.label }}</p></div>
      </div>
    }
  </div>

  <!-- Filter -->
  <div class="flex gap-2">
    @for (f of filters; track f) {
      <button (click)="activeFilter = f" [class]="activeFilter === f ? 'px-4 py-1.5 rounded-full text-sm font-bold bg-primary text-white' : 'px-4 py-1.5 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'">{{ f }}</button>
    }
  </div>

  <!-- Alerts list -->
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
    @for (alert of filteredAlerts; track alert.id) {
      <div (click)="markRead(alert)" [class]="'p-5 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ' + (alert.read ? 'opacity-70' : '')">
        <div class="flex items-start gap-4">
          <div [class]="'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ' + alert.colorClass">
            <span class="material-symbols-outlined text-[20px]">{{ alert.icon }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-semibold">{{ alert.title }}</p>
                <p class="text-xs text-slate-500 mt-1">{{ alert.desc }}</p>
              </div>
              <div class="flex items-center gap-2 ml-4">
                @if (!alert.read) { <span class="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span> }
                <span [class]="'px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ' + alert.severityClass">{{ alert.severity }}</span>
                <p class="text-[10px] text-slate-400 whitespace-nowrap">{{ alert.time }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button (click)="resolveAlert(alert, $event)" class="text-xs font-semibold text-green-600 hover:underline">Resolve</button>
              <span class="text-slate-300">|</span>
              <button (click)="dismissAlert(alert, $event)" class="text-xs font-semibold text-slate-400 hover:underline">Dismiss</button>
            </div>
          </div>
        </div>
      </div>
    }
    @if (filteredAlerts.length === 0) {
      <div class="p-12 text-center text-slate-400">
        <span class="material-symbols-outlined text-[48px] block mb-2">check_circle</span>
        <p class="font-semibold">No alerts found</p>
      </div>
    }
  </div>
</div>
`
})
export class AlertsComponent {
    activeFilter = 'All';
    filters = ['All', 'Critical', 'Warning', 'Info'];

    stats = [
        { label: 'Critical', value: 2, icon: 'error', bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-600' },
        { label: 'Warnings', value: 5, icon: 'warning', bg: 'bg-yellow-50 dark:bg-yellow-900/20', color: 'text-yellow-600' },
        { label: 'Info', value: 8, icon: 'info', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600' },
        { label: 'Resolved Today', value: 12, icon: 'check_circle', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-600' },
    ];

    alerts = [
        { id: 1, title: 'Database Connection Failed', desc: 'Attempt to reach main cluster failed from node SG-01.', time: 'Just now', icon: 'error', colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-600', severity: 'CRITICAL', severityClass: 'bg-red-50 text-red-600', read: false },
        { id: 2, title: 'High Memory Usage', desc: 'Instance EU-Central-02 is above 85% utilization.', time: '15m ago', icon: 'warning', colorClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', severity: 'WARNING', severityClass: 'bg-yellow-50 text-yellow-600', read: false },
        { id: 3, title: 'System Update Available', desc: 'New firmware patch v2.4.1 is ready for rollout.', time: '1h ago', icon: 'info', colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', severity: 'INFO', severityClass: 'bg-blue-50 text-blue-600', read: false },
        { id: 4, title: 'CPU Spike Detected', desc: 'Node-042 peaked at 98% CPU utilization for 3 minutes.', time: '2h ago', icon: 'error', colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-600', severity: 'CRITICAL', severityClass: 'bg-red-50 text-red-600', read: true },
        { id: 5, title: 'SSL Certificate Expiring', desc: 'Certificate for api.gbt.io expires in 14 days.', time: '4h ago', icon: 'warning', colorClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', severity: 'WARNING', severityClass: 'bg-yellow-50 text-yellow-600', read: true },
        { id: 6, title: 'Backup Completed', desc: 'Daily backup completed successfully for all nodes.', time: '6h ago', icon: 'info', colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', severity: 'INFO', severityClass: 'bg-blue-50 text-blue-600', read: true },
    ];

    get filteredAlerts() {
        if (this.activeFilter === 'All') return this.alerts;
        return this.alerts.filter(a => a.severity === this.activeFilter.toUpperCase());
    }

    markRead(a: any) { a.read = true; }
    markAllRead() { this.alerts.forEach(a => a.read = true); }
    resolveAlert(a: any, e: Event) { e.stopPropagation(); this.alerts = this.alerts.filter(x => x.id !== a.id); alert(`Alert resolved: ${a.title}`); }
    dismissAlert(a: any, e: Event) { e.stopPropagation(); this.alerts = this.alerts.filter(x => x.id !== a.id); }
    configureAlerts() { alert('Configure alert rules...(mock)'); }
}
