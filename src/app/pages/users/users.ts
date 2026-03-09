import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-8 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2>
      <p class="text-slate-500">Control access permissions and oversee user activity across the enterprise.</p>
    </div>
    <button (click)="addUser()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
      <span class="material-symbols-outlined text-[18px]">person_add</span>Add User
    </button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- User List / Table -->
    <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
        <h4 class="font-bold text-slate-800 dark:text-white">All Users</h4>
        <div class="flex gap-2">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input [(ngModel)]="searchTerm" class="pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg outline-none w-48" placeholder="Search..." />
          </div>
          <select [(ngModel)]="filterRole" class="px-2 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg outline-none cursor-pointer">
            <option value="">All Roles</option>
            <option>Super Admin</option><option>Admin</option><option>Manager</option><option>Developer</option><option>Viewer</option>
          </select>
        </div>
      </div>

      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        @for (user of filteredUsers; track user.id) {
          <div (click)="selectUser(user)" [class]="'flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ' + (selectedUser?.id === user.id ? 'bg-primary/5 dark:bg-primary/10' : '')">
            <div [class]="'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ' + user.avatarBg">{{ user.initials }}</div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ user.name }}</p>
              <p class="text-xs text-slate-400">{{ user.email }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">{{ user.role }}</span>
                <span class="text-[10px] text-slate-400">Activated: {{ user.activatedDate }}</span>
                @if (user.expiry) { <span class="text-[10px] text-orange-400">Exp: {{ user.expiry }}</span> }
                @if (!user.active) { <span class="text-[10px] text-red-500">Access Revoked</span> }
              </div>
            </div>
            <span [class]="'px-2 py-1 text-[10px] font-bold rounded-full ' + (user.active ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400')">{{ user.active ? 'ACTIVE' : 'DEACTIVATED' }}</span>
          </div>
        }
      </div>
      <div class="px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">Showing {{ filteredUsers.length }} of {{ users.length }} entries</div>
    </div>

    <!-- Right Column Stats -->
    <div class="space-y-5">
      <!-- Session Stats -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-primary/10 rounded-lg"><span class="material-symbols-outlined text-primary">person_check</span></div>
          <div>
            <p class="text-2xl font-bold text-primary">142</p>
            <p class="text-xs text-slate-500">Active Sessions</p>
          </div>
        </div>
        <p class="text-xs text-green-500 font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">trending_up</span>12% from last hour</p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"><span class="material-symbols-outlined text-orange-500">policy</span></div>
          <div>
            <p class="text-2xl font-bold">28</p>
            <p class="text-xs text-slate-500">Permission Changes</p>
          </div>
        </div>
        <p class="text-xs text-slate-400">Past 7 days</p>
      </div>

      <!-- Module Utilization -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <h4 class="font-bold text-slate-800 dark:text-white mb-4">Module Utilization</h4>
        <div class="space-y-3">
          @for (mod of modules; track mod.name) {
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ mod.name }}</span>
                <span class="text-xs font-bold">{{ mod.usage }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div [class]="'h-full rounded-full ' + mod.color" [style.width]="mod.usage + '%'"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Audit Trail -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <h4 class="font-bold text-slate-800 dark:text-white mb-3">Recent Audit Trail</h4>
        <div class="space-y-3">
          @for (log of auditLogs; track log.id) {
            <div (click)="viewLog(log)" class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
              <p class="text-xs font-semibold">{{ log.action }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ log.user }} · {{ log.time }}</p>
            </div>
          }
        </div>
        <button class="text-xs font-bold text-primary hover:underline mt-3 block">View Full Audit Trail →</button>
      </div>
    </div>
  </div>
</div>
`
})
export class UsersComponent {
  searchTerm = '';
  filterRole = '';
  selectedUser: any = null;

  users = [
    { id: 1, name: 'Alex Rivera', email: 'alex.rivera@gbt-corp.com', role: 'Super Admin', activatedDate: '2023-01-15', expiry: null, active: true, initials: 'AR', avatarBg: 'bg-primary' },
    { id: 2, name: 'Sarah Chen', email: 's.chen@gbt-corp.com', role: 'Manager', activatedDate: '2023-03-22', expiry: '2024-12-31', active: true, initials: 'SC', avatarBg: 'bg-purple-500' },
    { id: 3, name: 'James Wilson', email: 'james.w@gbt-corp.com', role: 'Developer', activatedDate: '2023-11-05', expiry: null, active: false, initials: 'JW', avatarBg: 'bg-slate-400' },
    { id: 4, name: 'Maria Garcia', email: 'm.garcia@gbt-corp.com', role: 'Admin', activatedDate: '2022-11-01', expiry: null, active: true, initials: 'MG', avatarBg: 'bg-green-500' },
    { id: 5, name: 'Priya Sharma', email: 'p.sharma@gbt-corp.com', role: 'Developer', activatedDate: '2024-01-10', expiry: null, active: true, initials: 'PS', avatarBg: 'bg-orange-500' },
    { id: 6, name: 'Tom Williams', email: 'tom.w@gbt-corp.com', role: 'Viewer', activatedDate: '2023-06-01', expiry: '2024-06-01', active: false, initials: 'TW', avatarBg: 'bg-slate-400' },
  ];

  modules = [
    { name: 'Server Dashboard', usage: 92, color: 'bg-primary' },
    { name: 'User Management', usage: 78, color: 'bg-purple-500' },
    { name: 'Finance & Billing', usage: 55, color: 'bg-green-500' },
    { name: 'Development Tools', usage: 44, color: 'bg-orange-400' },
  ];

  auditLogs = [
    { id: 1, action: 'Role changed: Viewer → Manager', user: 'Alex Rivera', time: '2m ago' },
    { id: 2, action: 'User deactivated: tom.w', user: 'Sarah Chen', time: '1h ago' },
    { id: 3, action: 'New user invited: priya.s', user: 'Alex Rivera', time: '3h ago' },
    { id: 4, action: 'Permission revoked: Finance module', user: 'Maria Garcia', time: '1d ago' },
  ];

  get filteredUsers() {
    return this.users.filter(u =>
      (u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || u.email.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.filterRole || u.role === this.filterRole)
    );
  }

  addUser() { alert('Add User dialog...(mock)'); }
  selectUser(u: any) { this.selectedUser = u; alert(`User: ${u.name}\nRole: ${u.role}\nEmail: ${u.email}\nStatus: ${u.active ? 'Active' : 'Deactivated'}`); }
  viewLog(log: any) { alert(`Audit Log: ${log.action}\nBy: ${log.user}\nTime: ${log.time}`); }
}
