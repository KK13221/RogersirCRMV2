import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servers',
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-8 space-y-6">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Server Monitoring</h2>
      <p class="text-slate-500">Real-time performance metrics and status for all active nodes.</p>
    </div>
    <div class="flex gap-3">
      <button (click)="enableAutoScale()" class="px-4 py-2 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">Auto-Scale</button>
      <button (click)="addServer()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
        <span class="material-symbols-outlined text-[18px]">add</span>Add Node
      </button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
    @for (kpi of kpis; track kpi.label) {
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <p class="text-3xl font-bold text-slate-800 dark:text-white">{{ kpi.value }}</p>
        <p class="text-slate-500 text-sm mt-1">{{ kpi.label }}</p>
      </div>
    }
  </div>

  <!-- Performance Chart & Quick Actions -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Chart -->
    <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h4 class="font-bold text-slate-800 dark:text-white">Real-time Performance Trends</h4>
          <p class="text-xs text-slate-400">Last 24 hours • Updates every 30s</p>
        </div>
        <div class="flex gap-3 text-xs font-bold">
          <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary"></span><span class="text-slate-500">CPU</span></div>
          <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span><span class="text-slate-500">Memory</span></div>
          <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-400"></span><span class="text-slate-500">Network</span></div>
        </div>
      </div>
      <div class="h-40 flex items-end gap-1">
        @for (h of perfData; track h; let i = $index) {
          <div class="flex-1 flex flex-col gap-0.5 items-center cursor-pointer hover:opacity-80 transition-opacity" (click)="viewHour(i)">
            <div class="w-full flex flex-col gap-0.5">
              <div class="w-full bg-primary/80 rounded-sm" [style.height]="h.cpu * 1.2 + 'px'"></div>
              <div class="w-full bg-green-400 rounded-sm" [style.height]="h.mem * 1.2 + 'px'"></div>
              <div class="w-full bg-orange-400 rounded-sm" [style.height]="h.net * 1.2 + 'px'"></div>
            </div>
          </div>
        }
      </div>
      <div class="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
        <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>Now</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
      <h4 class="font-bold text-slate-800 dark:text-white mb-2">Quick Actions</h4>
      <div class="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 mb-5 text-sm text-amber-700 dark:text-amber-400">
        <span class="material-symbols-outlined text-[16px] align-middle mr-1">tips_and_updates</span>
        Enable "Auto-Scale" on production nodes to automatically increase RAM when utilization hits 85% for more than 5 minutes.
      </div>
      <div class="space-y-3">
        @for (action of quickActions; track action.label) {
          <button (click)="runAction(action)" [class]="'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ' + action.cls">
            <span [class]="'material-symbols-outlined text-[20px] ' + action.iconColor">{{ action.icon }}</span>
            <div>
              <p class="text-sm font-semibold">{{ action.label }}</p>
              <p class="text-xs text-slate-400">{{ action.desc }}</p>
            </div>
          </button>
        }
      </div>
    </div>
  </div>

  <!-- Server Table -->
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
      <div>
        <h4 class="font-bold text-slate-800 dark:text-white">Active Servers Instance Table</h4>
        <p class="text-xs text-slate-400">Page 1 of 26 · 128 total servers</p>
      </div>
      <div class="flex gap-2">
        @for (f of filters; track f) {
          <button (click)="activeFilter = f" [class]="activeFilter === f ? 'px-3 py-1 rounded-full text-xs font-bold bg-primary text-white' : 'px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500'">{{ f }}</button>
        }
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Server Node</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Region</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">CPU</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Memory</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Disk</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Uptime</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Alerts</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (server of filteredServers; track server.id) {
            <tr (click)="viewServer(server)" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
              <td class="px-6 py-4">
                <p class="text-sm font-semibold group-hover:text-primary transition-colors">{{ server.name }}</p>
                <p class="text-[10px] text-slate-400">{{ server.ip }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ server.region }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full"><div [class]="'h-full rounded-full ' + server.cpuColor" [style.width]="server.cpu + '%'"></div></div>
                  <span class="text-xs font-medium">{{ server.cpu }}%</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full"><div [class]="'h-full rounded-full ' + server.memColor" [style.width]="server.memory + '%'"></div></div>
                  <span class="text-xs font-medium">{{ server.memory }}%</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full"><div class="h-full rounded-full bg-blue-400" [style.width]="server.disk + '%'"></div></div>
                  <span class="text-xs font-medium">{{ server.disk }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ server.uptime }}</td>
              <td class="px-6 py-4">
                @if (server.alerts > 0) {
                  <span class="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full">{{ server.alerts }} alert{{ server.alerts > 1 ? 's' : '' }}</span>
                } @else {
                  <span class="text-xs text-slate-400">None</span>
                }
              </td>
              <td class="px-6 py-4"><span [class]="'px-2 py-1 text-[10px] font-bold rounded-full ' + server.statusClass">{{ server.status }}</span></td>
              <td class="px-6 py-4">
                <div class="flex gap-1" (click)="$event.stopPropagation()">
                  <button (click)="restartServer(server)" class="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg" title="Restart"><span class="material-symbols-outlined text-[18px]">restart_alt</span></button>
                  <button (click)="viewLogs(server)" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg" title="Logs"><span class="material-symbols-outlined text-[18px]">terminal</span></button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
      <span>Showing 5 of 128 servers</span>
      <div class="flex gap-2">
        <button class="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">← Prev</button>
        <button class="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">Next →</button>
      </div>
    </div>
  </div>
</div>
`
})
export class ServersComponent {
  activeFilter = 'All';
  filters = ['All', 'Active', 'Warning', 'Critical', 'Offline'];

  kpis = [
    { label: 'Total Servers', value: '128' },
    { label: 'Active Alerts', value: '3' },
    { label: 'Avg. CPU Load', value: '42.4%' },
    { label: 'System Uptime', value: '99.98%' },
  ];

  perfData = [
    { cpu: 30, mem: 45, net: 20 }, { cpu: 35, mem: 48, net: 25 },
    { cpu: 28, mem: 44, net: 18 }, { cpu: 45, mem: 55, net: 30 },
    { cpu: 60, mem: 62, net: 40 }, { cpu: 55, mem: 58, net: 35 },
    { cpu: 42, mem: 52, net: 28 }, { cpu: 38, mem: 49, net: 22 },
    { cpu: 50, mem: 56, net: 32 }, { cpu: 65, mem: 66, net: 45 },
    { cpu: 70, mem: 70, net: 50 }, { cpu: 58, mem: 62, net: 38 },
    { cpu: 45, mem: 54, net: 28 }, { cpu: 40, mem: 50, net: 24 },
  ];

  quickActions = [
    { label: 'Enable Auto-Scale', desc: 'AWS production cluster', icon: 'auto_awesome', iconColor: 'text-primary', cls: 'border-primary/20 hover:bg-primary/5 dark:border-primary/30' },
    { label: 'Restart Failed Nodes', desc: '2 nodes offline', icon: 'restart_alt', iconColor: 'text-orange-500', cls: 'border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20' },
    { label: 'Run System Diagnostics', desc: 'Full health check', icon: 'health_and_safety', iconColor: 'text-green-500', cls: 'border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20' },
  ];

  servers = [
    { id: 1, name: 'prod-us-east-01', ip: '10.0.1.1', region: 'N. Virginia', cpu: 32, cpuColor: 'bg-green-500', memory: 54, memColor: 'bg-green-500', disk: 45, uptime: '99.9%', alerts: 0, status: 'Active', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { id: 2, name: 'prod-eu-west-01', ip: '10.0.2.1', region: 'Ireland', cpu: 78, cpuColor: 'bg-yellow-500', memory: 82, memColor: 'bg-yellow-500', disk: 60, uptime: '99.1%', alerts: 1, status: 'Warning', statusClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { id: 3, name: 'prod-ap-sgp-01', ip: '10.0.3.1', region: 'Singapore', cpu: 95, cpuColor: 'bg-red-500', memory: 91, memColor: 'bg-red-500', disk: 85, uptime: '97.3%', alerts: 2, status: 'Critical', statusClass: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
    { id: 4, name: 'stg-us-east-01', ip: '10.0.4.1', region: 'N. Virginia', cpu: 15, cpuColor: 'bg-green-500', memory: 28, memColor: 'bg-green-500', disk: 22, uptime: '100%', alerts: 0, status: 'Active', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { id: 5, name: 'dev-us-west-01', ip: '10.0.5.1', region: 'Oregon', cpu: 5, cpuColor: 'bg-green-500', memory: 18, memColor: 'bg-green-500', disk: 38, uptime: '99.5%', alerts: 0, status: 'Active', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  ];

  get filteredServers() {
    if (this.activeFilter === 'All') return this.servers;
    return this.servers.filter(s => s.status === this.activeFilter);
  }

  addServer() { alert('Add server dialog...(mock)'); }
  enableAutoScale() { alert('Enabling Auto-Scale on production nodes...(mock)'); }
  runAction(a: any) { alert(`Running: ${a.label}`); }
  viewServer(s: any) { alert(`Server: ${s.name}\nRegion: ${s.region}\nCPU: ${s.cpu}% | Mem: ${s.memory}%\nStatus: ${s.status}`); }
  restartServer(s: any) { if (confirm(`Restart ${s.name}?`)) alert(`Restarting ${s.name}...(mock)`); }
  viewLogs(s: any) { alert(`Opening logs for ${s.name}...(mock)`); }
  viewHour(i: number) { alert(`Hour ${i}: CPU ${this.perfData[i].cpu}% | Memory ${this.perfData[i].mem}% | Network ${this.perfData[i].net}%`); }
}
