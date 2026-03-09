import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-archive',
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-8 space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Version Archive</h2>
      <p class="text-slate-500">Historical application snapshots and automated system backups. Archived versions are preserved in a read-only state for compliance and recovery.</p>
    </div>
    <button (click)="exportArchive()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
      <span class="material-symbols-outlined text-[18px]">download</span>Export
    </button>
  </div>

  <!-- Storage Stats -->
  <div class="grid grid-cols-3 gap-5">
    <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
      <p class="text-2xl font-bold text-primary">12.4 GB</p>
      <p class="text-xs text-slate-500 mt-1">Of 50 GB available</p>
      <div class="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full">
        <div class="h-full rounded-full bg-primary" style="width: 24.8%"></div>
      </div>
    </div>
    <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
      <p class="text-2xl font-bold text-green-500">100% Secure</p>
      <p class="text-xs text-slate-500 mt-1">Last scan 4 hours ago</p>
      <div class="flex items-center gap-2 mt-3">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span class="text-xs font-bold text-green-600">Integrity Verified</span>
      </div>
    </div>
    <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
      <p class="text-2xl font-bold">148 Files</p>
      <p class="text-xs text-slate-500 mt-1">Across 12 versions</p>
    </div>
  </div>

  <!-- Notice -->
  <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
    <span class="material-symbols-outlined text-blue-500 flex-shrink-0">info</span>
    <p>Archive integrity is validated upon every system boot. To restore a version, please contact the DevOps lead.</p>
  </div>

  <!-- Versions -->
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
      <h4 class="font-bold text-slate-800 dark:text-white">Version History</h4>
      <div class="flex gap-2">
        @for (f of filters; track f) {
          <button (click)="activeFilter = f" [class]="activeFilter === f ? 'px-3 py-1 rounded-full text-xs font-bold bg-primary text-white' : 'px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500'">{{ f }}</button>
        }
      </div>
    </div>
    <div class="divide-y divide-slate-100 dark:divide-slate-800">
      @for (version of filteredVersions; track version.id) {
        <div (click)="selectVersion(version)" [class]="'px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group ' + (selectedVersion?.id === version.id ? 'bg-primary/5' : '')">
          <div class="flex items-start gap-4">
            <div [class]="'p-2 rounded-xl flex-shrink-0 ' + version.iconBg">
              <span [class]="'material-symbols-outlined ' + version.iconColor">{{ version.icon }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <p class="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{{ version.version }}</p>
                <span [class]="'px-2 py-0.5 text-[10px] font-bold rounded-full ' + version.typeClass">{{ version.type }}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ version.desc }}</p>
              <div class="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">schedule</span>{{ version.date }}</span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">storage</span>{{ version.size }}</span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">person</span>{{ version.author }}</span>
              </div>
            </div>
            <div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
              <button (click)="downloadVersion(version)" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg" title="Download"><span class="material-symbols-outlined text-[18px]">download</span></button>
              <button (click)="restoreVersion(version)" class="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg" title="Restore"><span class="material-symbols-outlined text-[18px]">restore</span></button>
            </div>
          </div>
        </div>
      }
    </div>
    <div class="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t text-xs text-slate-400">Showing {{ filteredVersions.length }} of 12 versions</div>
  </div>
</div>
`
})
export class ArchiveComponent {
  activeFilter = 'All';
  filters = ['All', 'Production Build', 'Pre-release', 'Major Release', 'Security Patch'];
  selectedVersion: any = null;

  versions = [
    { id: 1, version: 'v2.3.9-stable', type: 'Production Build', desc: 'Stable release with performance improvements and bug fixes.', date: 'Nov 24, 2023', size: '1.2 GB', author: 'CI/CD Pipeline', icon: 'verified', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600', typeClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { id: 2, version: 'v2.3.8-beta', type: 'Pre-release', desc: 'Beta build for testing new dashboard features.', date: 'Nov 18, 2023', size: '1.1 GB', author: 'Dev Team', icon: 'science', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600', typeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    { id: 3, version: 'v2.3.0-stable', type: 'Major Release', desc: 'Major release introducing dark mode and multi-tenant support.', date: 'Oct 01, 2023', size: '1.4 GB', author: 'CI/CD Pipeline', icon: 'new_releases', iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600', typeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
    { id: 4, version: 'v2.2.5-hotfix', type: 'Security Patch', desc: 'Critical security patch for CVE-2023-48194 authentication bypass.', date: 'Sep 15, 2023', size: '890 MB', author: 'Security Team', icon: 'security', iconBg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-600', typeClass: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
    { id: 5, version: 'v2.2.0-stable', type: 'Production Build', desc: 'Stable release with analytics module and finance integration.', date: 'Aug 10, 2023', size: '1.0 GB', author: 'CI/CD Pipeline', icon: 'verified', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600', typeClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  ];

  get filteredVersions() {
    if (this.activeFilter === 'All') return this.versions;
    return this.versions.filter(v => v.type === this.activeFilter);
  }

  selectVersion(v: any) { this.selectedVersion = v; }
  downloadVersion(v: any) { alert(`Downloading ${v.version} (${v.size})...(mock)`); }
  restoreVersion(v: any) { if (confirm(`Restore ${v.version}? This will replace the current deployment.`)) alert(`Restoring ${v.version}...(mock)`); }
  exportArchive() { alert('Exporting archive index...(mock)'); }
}
