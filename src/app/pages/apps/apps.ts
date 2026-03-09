import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apps',
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-8 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Apps Repository</h2>
      <p class="text-slate-500">Manage and distribute application artifacts across different operating systems.</p>
    </div>
    <button (click)="uploadArtifact()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
      <span class="material-symbols-outlined text-[18px]">upload</span>Upload Artifact
    </button>
  </div>

  <!-- Platform Summary -->
  <div class="grid grid-cols-3 gap-6">
    @for (platform of platforms; track platform.name) {
      <div (click)="selectPlatform(platform)" [class]="'bg-white dark:bg-slate-900 p-5 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ' + (activePlatform === platform.name ? 'border-primary shadow-md' : 'border-primary/10 shadow-sm')">
        <div class="flex items-center gap-3 mb-3">
          <div [class]="'p-2 rounded-xl ' + platform.iconBg"><span [class]="'material-symbols-outlined ' + platform.iconColor">{{ platform.icon }}</span></div>
          <p class="font-bold text-slate-800 dark:text-white">{{ platform.name }}</p>
        </div>
        <p class="text-2xl font-bold">{{ platform.builds }}</p>
        <p class="text-xs text-slate-400 mt-1">Active Builds · {{ platform.size }} Total</p>
      </div>
    }
  </div>

  <!-- Artifacts Table -->
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
      <h4 class="font-bold text-slate-800 dark:text-white">Artifacts</h4>
      <div class="flex gap-2">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input [(ngModel)]="searchTerm" class="pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg outline-none w-48" placeholder="Search artifacts..." />
        </div>
        <div class="flex gap-1">
          @for (p of ['All', 'Android', 'iOS', 'Windows']; track p) {
            <button (click)="activePlatform = p" [class]="activePlatform === p ? 'px-3 py-1 rounded-full text-xs font-bold bg-primary text-white' : 'px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500'">{{ p }}</button>
          }
        </div>
      </div>
    </div>
    <div class="divide-y divide-slate-100 dark:divide-slate-800">
      @for (artifact of filteredArtifacts; track artifact.id) {
        <div (click)="viewArtifact(artifact)" class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
          <div class="flex items-center gap-4">
            <div [class]="'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ' + artifact.iconBg">
              <span [class]="'material-symbols-outlined text-[20px] ' + artifact.iconColor">{{ artifact.icon }}</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold group-hover:text-primary transition-colors">{{ artifact.name }}</p>
              <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                <span>{{ artifact.size }}</span>
                @if (artifact.readOnly) { <span class="px-1.5 py-0.5 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 rounded font-bold">Read Only</span> }
                <span>{{ artifact.date }}</span>
                <span>{{ artifact.platform }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span [class]="'px-2 py-1 text-[10px] font-bold rounded-full ' + artifact.statusClass">{{ artifact.status }}</span>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
                <button (click)="downloadArtifact(artifact)" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"><span class="material-symbols-outlined text-[18px]">download</span></button>
                @if (!artifact.readOnly) {
                  <button (click)="deleteArtifact(artifact)" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
    <div class="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">Showing {{ filteredArtifacts.length }} of 14 artifacts</div>
  </div>
</div>
`
})
export class AppsComponent {
  searchTerm = '';
  activePlatform = 'All';

  platforms = [
    { name: 'Android', builds: 14, size: '248MB', icon: 'phone_android', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600' },
    { name: 'iOS', builds: 8, size: '1.2GB', icon: 'phone_iphone', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
    { name: 'Windows', builds: 3, size: '850MB', icon: 'desktop_windows', iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600' },
  ];

  artifacts = [
    { id: 1, name: 'gbt-customer-v2.4.0-stable.apk', size: '42.5 MB', platform: 'Android', date: 'Nov 24, 2023', readOnly: false, status: 'STABLE', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', icon: 'android', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600' },
    { id: 2, name: 'config_manifest_legacy.json', size: '12 KB', platform: 'All', date: 'Nov 20, 2023', readOnly: true, status: 'READ ONLY', statusClass: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400', icon: 'description', iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500' },
    { id: 3, name: 'gbt-customer-v2.3.9-beta.apk', size: '41.8 MB', platform: 'Android', date: 'Nov 18, 2023', readOnly: false, status: 'BETA', statusClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', icon: 'android', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600' },
    { id: 4, name: 'GBT-Enterprise-v2.4.0.ipa', size: '98.2 MB', platform: 'iOS', date: 'Nov 24, 2023', readOnly: false, status: 'STABLE', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', icon: 'phone_iphone', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
    { id: 5, name: 'GBT-Setup-v2.4.0-x64.exe', size: '284 MB', platform: 'Windows', date: 'Nov 24, 2023', readOnly: false, status: 'STABLE', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', icon: 'desktop_windows', iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600' },
  ];

  get filteredArtifacts() {
    return this.artifacts.filter(a =>
      a.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.activePlatform === 'All' || a.platform === this.activePlatform)
    );
  }

  uploadArtifact() { alert('Upload artifact dialog...(mock)'); }
  selectPlatform(p: any) { this.activePlatform = p.name; }
  viewArtifact(a: any) { alert(`Artifact: ${a.name}\nSize: ${a.size}\nPlatform: ${a.platform}\nStatus: ${a.status}`); }
  downloadArtifact(a: any) { alert(`Downloading ${a.name}...(mock)`); }
  deleteArtifact(a: any) { if (confirm(`Delete ${a.name}?`)) { this.artifacts = this.artifacts.filter(x => x.id !== a.id); } }
}
