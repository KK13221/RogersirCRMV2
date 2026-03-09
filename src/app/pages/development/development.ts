import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-development',
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-8 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Development Environment</h2>
      <p class="text-slate-500">Manage build versions, CI/CD pipelines, and approval workflows.</p>
    </div>
    <button (click)="triggerBuild()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
      <span class="material-symbols-outlined text-[18px]">rocket_launch</span>Trigger Build
    </button>
  </div>

  <!-- Env Stats -->
  <div class="grid grid-cols-4 gap-5">
    @for (stat of envStats; track stat.label) {
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <p class="text-2xl font-bold">{{ stat.value }}</p>
        <p class="text-slate-500 text-sm mt-1">{{ stat.label }}</p>
      </div>
    }
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Active Builds -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-primary/10">
        <h4 class="font-bold text-slate-800 dark:text-white">Active Development Builds</h4>
      </div>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        @for (build of builds; track build.id) {
          <div (click)="viewBuild(build)" class="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
            <div class="flex items-center gap-3">
              <div [class]="'w-9 h-9 rounded-lg flex items-center justify-center ' + build.iconBg">
                <span [class]="'material-symbols-outlined text-[20px] ' + build.iconColor">{{ build.icon }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold group-hover:text-primary transition-colors">{{ build.name }}</p>
                  <span class="text-xs text-slate-400">v{{ build.version }}</span>
                </div>
                <p class="text-xs text-slate-500">{{ build.branch }} · {{ build.author }}</p>
              </div>
              <div class="text-right">
                <span [class]="'px-2 py-1 text-[10px] font-bold rounded-full ' + build.statusClass">{{ build.status }}</span>
                <p class="text-[10px] text-slate-400 mt-1">{{ build.time }}</p>
              </div>
            </div>
            @if (build.progress !== undefined) {
              <div class="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full">
                <div class="h-full rounded-full bg-primary animate-pulse" [style.width]="build.progress + '%'"></div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Testing Logs -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
        <h4 class="font-bold text-slate-800 dark:text-white">Real-time Testing Logs</h4>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-xs text-green-600 font-bold">LIVE</span>
        </div>
      </div>
      <div class="p-4 bg-slate-900 dark:bg-slate-950 rounded-b-xl font-mono text-xs space-y-1 max-h-80 overflow-y-auto">
        @for (log of testLogs; track log.id) {
          <div [class]="'flex gap-2 ' + log.color">
            <span class="text-slate-500 flex-shrink-0 text-[10px]">{{ log.time }}</span>
            <span [class]="'font-bold uppercase flex-shrink-0 text-[10px] ' + log.levelColor">{{ log.level }}</span>
            <span class="text-slate-300 text-[10px]">{{ log.msg }}</span>
          </div>
        }
        <div class="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
          <span class="animate-pulse">_</span>
          <span>Waiting for output...</span>
        </div>
      </div>
    </div>

  </div>

  <!-- Approval Workflow + Quick Links -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Approval Workflow -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
      <h4 class="font-bold text-slate-800 dark:text-white mb-5">Approval Workflow</h4>
      <div class="space-y-4">
        @for (step of approvalSteps; track step.label; let i = $index) {
          <div class="flex items-center gap-4">
            <div [class]="'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + step.circleClass">
              <span class="material-symbols-outlined text-[18px]">{{ step.icon }}</span>
            </div>
            @if (i < approvalSteps.length - 1) {
              <div class="absolute ml-4 mt-8 w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            }
            <div>
              <p class="text-sm font-semibold">{{ step.label }}</p>
              <p class="text-xs text-slate-400">{{ step.detail }}</p>
            </div>
            <span [class]="'ml-auto px-2 py-1 text-[10px] font-bold rounded-full ' + step.statusClass">{{ step.status }}</span>
          </div>
        }
      </div>
    </div>

    <!-- Quick Links -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
      <h4 class="font-bold text-slate-800 dark:text-white mb-5">Quick Links</h4>
      <div class="grid grid-cols-2 gap-3">
        @for (link of quickLinks; track link.label) {
          <button (click)="openLink(link)" [class]="'flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition-colors text-left'">
            <span [class]="'material-symbols-outlined text-[22px] ' + link.color">{{ link.icon }}</span>
            <span class="text-sm font-semibold">{{ link.label }}</span>
          </button>
        }
      </div>
    </div>

  </div>
</div>
`
})
export class DevelopmentComponent {
  envStats = [
    { label: 'Active Builds', value: '12' },
    { label: 'Tests Run (24h)', value: '842' },
    { label: 'Pass Rate', value: '98.6%' },
    { label: 'Avg Build Time', value: '4m 12s' },
  ];

  builds = [
    { id: 1, name: 'API Gateway', version: '3.2.1', branch: 'main', author: 'Marcus J.', status: 'SUCCESS', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', icon: 'check_circle', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600', time: '5m ago', progress: undefined },
    { id: 2, name: 'Auth Service', version: '1.8.0', branch: 'develop', author: 'Priya S.', status: 'RUNNING', statusClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', icon: 'sync', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600', time: 'Now', progress: 62 },
    { id: 3, name: 'Dashboard UI', version: '2.1.0', branch: 'feature/dark-mode', author: 'Alex R.', status: 'SUCCESS', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', icon: 'check_circle', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600', time: '1h ago', progress: undefined },
    { id: 4, name: 'Data Pipeline', version: '0.9.3', branch: 'develop', author: 'Elena K.', status: 'FAILED', statusClass: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400', icon: 'error', iconBg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-600', time: '3h ago', progress: undefined },
  ];

  testLogs = [
    { id: 1, time: '14:22:01', level: 'INFO', msg: 'Initiating unit tests for Auth Module...', levelColor: 'text-blue-400', color: '' },
    { id: 2, time: '14:22:05', level: 'INFO', msg: 'Mock server started at localhost:4000', levelColor: 'text-blue-400', color: '' },
    { id: 3, time: '14:22:12', level: 'SUCCESS', msg: '124/124 unit tests passed.', levelColor: 'text-green-400', color: '' },
    { id: 4, time: '14:22:14', level: 'INFO', msg: 'Running integration tests (Step 1/5)...', levelColor: 'text-blue-400', color: '' },
    { id: 5, time: '14:22:20', level: 'WARN', msg: 'Slow response detected in DB connection (240ms)', levelColor: 'text-yellow-400', color: '' },
    { id: 6, time: '14:22:25', level: 'INFO', msg: "Integration test 'UserSignup' completed.", levelColor: 'text-blue-400', color: '' },
  ];

  approvalSteps = [
    { label: 'Automated Testing', detail: 'Passed - 2 mins ago', icon: 'check_circle', circleClass: 'bg-green-100 dark:bg-green-900/30 text-green-600', status: 'PASSED', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { label: 'Lead Dev Review', detail: 'Assigned to Sarah M.', icon: 'person', circleClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', status: 'PENDING', statusClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { label: 'Final Security Scan', detail: 'Pending review', icon: 'security', circleClass: 'bg-slate-100 dark:bg-slate-800 text-slate-400', status: 'WAITING', statusClass: 'bg-slate-100 text-slate-500 dark:bg-slate-800' },
  ];

  quickLinks = [
    { label: 'GitHub Repo', icon: 'code', color: 'text-slate-700 dark:text-slate-300' },
    { label: 'CI/CD Pipelines', icon: 'account_tree', color: 'text-blue-600' },
    { label: 'Test Reports', icon: 'fact_check', color: 'text-green-600' },
    { label: 'Deployments', icon: 'cloud_done', color: 'text-purple-600' },
  ];

  triggerBuild() { alert('Triggering new build...(mock)'); }
  viewBuild(b: any) { alert(`Build: ${b.name} v${b.version}\nBranch: ${b.branch}\nStatus: ${b.status}`); }
  openLink(l: any) { alert(`Opening ${l.label}...(mock)`); }
}
