import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://localhost/gbtbackend/api/users';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
  created_at: string;
  initials?: string;
  avatarBg?: string;
}

interface UserLog {
  id: number;
  user_email: string;
  action: string;
  pst_time: string;
}

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
    
    @if (isAdmin) {
      <button (click)="openAddModal()" 
        class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
        <span class="material-symbols-outlined text-[18px]">person_add</span>Add User
      </button>
    }
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- User List / Table -->
    <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden flex flex-col h-[75vh]">
      <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between shrink-0">
        <h4 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          All Users
          @if (loading) {
            <div class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          }
        </h4>
        <div class="flex gap-2">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input [(ngModel)]="searchTerm" class="pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg outline-none w-48" placeholder="Search..." />
          </div>
          <select [(ngModel)]="filterRole" class="px-2 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg outline-none cursor-pointer">
            <option value="">All Roles</option>
            <option>Admin</option>
            <option>System Admin</option>
            <option>Sub Admin</option>
          </select>
        </div>
      </div>

      <div class="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto">
        @if (!loading && filteredUsers.length === 0) {
          <div class="p-8 text-center text-slate-500">No users found.</div>
        }
      
        @for (user of filteredUsers; track user.id) {
          <div [class]="'flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'">
            <div [class]="'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ' + user.avatarBg">{{ user.initials }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ user.name }}</p>
              <p class="text-xs text-slate-400 truncate">{{ user.email }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">{{ user.role }}</span>
                <span class="text-[10px] text-slate-400">Created: {{ user.created_at | date:'mediumDate' }}</span>
              </div>
            </div>
            
            <span [class]="'px-2 py-1 text-[10px] font-bold rounded-full mr-4 ' + (user.is_active ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400')">
              {{ user.is_active ? 'ACTIVE' : 'INACTIVE' }}
            </span>
            
            @if (isAdmin) {
              <button (click)="deleteUser(user)" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete User">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            }
          </div>
        }
      </div>
      <div class="px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 shrink-0">
        Showing {{ filteredUsers.length }} of {{ users.length }} entries
      </div>
    </div>

    <!-- Right Column Stats -->
    <div class="space-y-5 flex flex-col h-[75vh]">
      <!-- Summary boxes -->
      <div class="flex gap-4 shrink-0">
        <div class="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-lg"><span class="material-symbols-outlined text-primary">group</span></div>
          <div>
            <p class="text-2xl font-bold text-primary">{{ users.length }}</p>
            <p class="text-xs text-slate-500">Total Users</p>
          </div>
        </div>
        <div class="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm flex items-center gap-3">
          <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"><span class="material-symbols-outlined text-orange-500">admin_panel_settings</span></div>
          <div>
            <p class="text-2xl font-bold">{{ adminCount }} <span class="text-xs text-slate-400 font-normal">/ 3</span></p>
            <p class="text-[11px] text-slate-500 leading-tight">Admins Used</p>
          </div>
        </div>
      </div>

      <!-- Audit Trail -->
      @if (isSystemAdmin) {
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div class="px-5 py-4 border-b border-primary/10 shrink-0 flex items-center justify-between">
            <h4 class="font-bold text-slate-800 dark:text-white">Recent Audit Trail</h4>
            <button (click)="loadLogs()" class="p-1 text-slate-400 hover:text-primary transition-colors">
              <span class="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
          <div class="overflow-y-auto px-5 py-2 space-y-1">
            @if (logsLoading) {
              <p class="text-xs text-slate-400 py-4 text-center">Loading logs...</p>
            }
            @for (log of auditLogs; track log.id) {
              <div class="py-2.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 -mx-2 rounded transition-colors">
                <div class="flex items-center gap-2 mb-0.5">
                  <span [class]="'text-[10px] font-bold px-1.5 py-0.5 rounded ' + (log.action === 'LOGIN' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500')">
                    {{ log.action }}
                  </span>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ log.user_email }}</span>
                </div>
                <p class="text-[11px] text-slate-500 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">schedule</span> 
                  {{ log.pst_time }}
                </p>
              </div>
            }
            @if (!logsLoading && auditLogs.length === 0) {
              <p class="text-xs text-slate-400 py-4 text-center">No activity recorded yet.</p>
            }
          </div>
        </div>
      } @else {
        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center flex-1 p-6 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">lock</span>
          <p class="text-sm font-bold text-slate-400">Audit Logs Locked</p>
          <p class="text-xs text-slate-400 mt-1 max-w-[200px]">Only System Administrators can view activity trails.</p>
        </div>
      }
    </div>
  </div>
</div>

<!-- Add User Modal -->
@if (showAddModal) {
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col" style="animation: dropIn 0.2s ease-out">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">person_add</span> Create User
        </h3>
        <button (click)="closeAddModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="p-6 space-y-4">
        @if (errorMsg) {
          <div class="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex gap-2">
            <span class="material-symbols-outlined text-[18px]">error</span> {{ errorMsg }}
          </div>
        }

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
          <input [(ngModel)]="newUser.name" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Jane Doe" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
          <input [(ngModel)]="newUser.email" type="email" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="jane@gbt.com" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Password</label>
          <input [(ngModel)]="newUser.password" type="password" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="••••••••" />
        </div>
        <div>
          <div class="flex justify-between items-end mb-1">
            <label class="block text-xs font-bold text-slate-500">Role</label>
            @if (adminCount >= 3) {
              <span class="text-[10px] text-orange-500 font-medium">Max Admins Reached (3/3)</span>
            }
          </div>
          <select [(ngModel)]="newUser.role" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
            @if (adminCount < 3) {
              <option value="Admin">Admin</option>
            }
            <option value="Sub Admin">Sub Admin</option>
          </select>
        </div>
      </div>
      
      <div class="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900 border-none">
        <button (click)="closeAddModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50" [disabled]="saving">Cancel</button>
        <button (click)="saveUser()" [disabled]="saving || !newUser.name || !newUser.email || !newUser.password" class="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          @if (saving) {
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...
          } @else {
            Create
          }
        </button>
      </div>
    </div>
  </div>
}

<style>
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
  `
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private cdr  = inject(ChangeDetectorRef);

  searchTerm = '';
  filterRole = '';
  loading = false;
  logsLoading = false;
  
  users: User[] = [];
  auditLogs: UserLog[] = [];

  showAddModal = false;
  saving = false;
  errorMsg = '';
  newUser = { name: '', email: '', password: '', role: 'Sub Admin' };

  colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

  get isAdmin(): boolean {
    const r = this.auth.currentUser()?.role?.toLowerCase() || '';
    return r.includes('admin') || r === 'system admin';
  }

  get isSystemAdmin(): boolean {
    const r = this.auth.currentUser()?.role?.toLowerCase() || '';
    return r === 'system admin';
  }

  get adminCount(): number {
    return this.users.filter(u => u.role.toLowerCase() === 'admin' || u.role.toLowerCase() === 'system admin').length;
  }

  get filteredUsers() {
    return this.users.filter(u =>
      (u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || u.email.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.filterRole || u.role === this.filterRole)
    );
  }

  ngOnInit() {
    this.loadUsers();
    this.loadLogs();
  }

  async loadUsers() {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      const res = await firstValueFrom(this.http.get<any>(`${API_BASE}/list.php`));
      if (res?.status === 'SUCCESS') {
        this.users = (res.users || []).map((u: any, i: number) => {
          u.initials = this.getInitials(u.name);
          // Pick a consistent color based on char code sum
          const hash = String(u.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          u.avatarBg = this.colors[hash % this.colors.length];
          return u;
        });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async loadLogs() {
    if (!this.isSystemAdmin) {
      this.auditLogs = [];
      return;
    }
    this.logsLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await firstValueFrom(this.http.get<any>(`${API_BASE}/logs.php`));
      if (res?.status === 'SUCCESS') {
        this.auditLogs = res.logs || [];
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
    this.logsLoading = false;
    this.cdr.detectChanges();
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  openAddModal() {
    this.errorMsg = '';
    
    // Auto default to 'Sub Admin' if 3 admins exist to prevent errors
    const roleDefault = this.adminCount >= 3 ? 'Sub Admin' : 'Admin';
    
    this.newUser = { name: '', email: '', password: '', role: roleDefault };
    this.showAddModal = true;
    this.cdr.detectChanges();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.cdr.detectChanges();
  }

  async saveUser() {
    this.errorMsg = '';
    this.saving = true;
    this.cdr.detectChanges();

    try {
      const res = await firstValueFrom(this.http.post<any>(`${API_BASE}/create.php`, this.newUser));
      if (res?.status === 'SUCCESS') {
        this.closeAddModal();
        await this.loadUsers(); // Refresh list to get new user with ID
      } else {
        this.errorMsg = res?.message || 'Failed to create user.';
      }
    } catch (err: any) {
      this.errorMsg = err?.error?.message || 'Network error occurred.';
    }
    this.saving = false;
    this.cdr.detectChanges();
  }

  async deleteUser(user: User) {
    if (!confirm(`Are you sure you want to permanently delete ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      const res = await firstValueFrom(this.http.post<any>(`${API_BASE}/delete.php`, { id: user.id }));
      if (res?.status === 'SUCCESS') {
        await this.loadUsers();
      } else {
        alert(res?.message || 'Failed to delete user.');
      }
    } catch (err: any) {
      alert('Error connecting to the server while deleting user.');
    }
  }
}
