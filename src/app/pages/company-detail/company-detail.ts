import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CompanyService, CompanyInfo } from '../../services/company.service';
import { API_BASE_URL } from '../../config/api.config';

const API_BASE = API_BASE_URL;

function avatarColor(name: string): string {
  const p = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316'];
  return p[name.charCodeAt(0) % p.length];
}

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col min-h-full">

      <!-- Loading -->
      @if (loading) {
        <div class="flex items-center justify-center py-24">
          <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }

      <!-- Error -->
      @if (!loading && !company) {
        <div class="p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300">error</span>
          <p class="text-slate-500 mt-3">Company not found.</p>
          <a routerLink="/companies" class="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Companies
          </a>
        </div>
      }

      <!-- Company Layout -->
      @if (!loading && company) {

        <!-- ── Sticky Header ───────────────────────────────────────────────── -->
        <div class="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-primary/10 shadow-sm">

          <!-- Company Info Row -->
          <div class="px-8 pt-5 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Avatar -->
              <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                [style.background]="getColor(company.company_name)">
                {{ company.company_name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h2 class="font-bold text-slate-900 dark:text-white text-lg leading-tight">{{ company.company_name }}</h2>
                <button (click)="openAdminUrl()"
                  class="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer mt-0.5">
                  <span class="material-symbols-outlined text-[12px]">link</span>
                  {{ company.admin_url }}
                </button>
              </div>
            </div>
            <a routerLink="/companies"
              class="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              All Companies
            </a>
          </div>

          <!-- ── Tabs ────────────────────────────────────────────────────── -->
          <div class="px-8 flex mt-4">
            @for (tab of tabs; track tab.path) {
              <a [routerLink]="['/companies', companyId, tab.path]"
                routerLinkActive="border-primary text-primary"
                class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors whitespace-nowrap">
                <span class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
                {{ tab.label }}
              </a>
            }
          </div>
        </div>

        <!-- ── Tab Content ─────────────────────────────────────────────────── -->
        <div class="flex-1">
          <router-outlet />
        </div>
      }
    </div>
  `
})
export class CompanyDetailComponent implements OnInit, OnDestroy {

  company: CompanyInfo | null = null;
  companyId = 0;
  loading = false;

  tabs = [
    { label: 'Customer Dashboard', icon: 'monitoring',       path: 'dashboard' },
    { label: 'Contacts',           icon: 'contact_page',     path: 'contacts'  },
    { label: 'Server Monitoring',  icon: 'dns',              path: 'servers'   },
    { label: 'Finance & Billing',  icon: 'account_balance',  path: 'finance'   },
  ];

  private companyService = inject(CompanyService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.companyId = parseInt(params['id'], 10);
      this.loadCompany();
    });
  }

  ngOnDestroy() {
    this.companyService.currentCompany.set(null);
  }

  loadCompany() {
    this.loading = true;
    this.cdr.detectChanges();
    this.http.get<any>(`${API_BASE}/api/companies.php`).subscribe({
      next: (res) => {
        const companies: CompanyInfo[] = res.data ?? [];
        this.company = companies.find(c => c.id === this.companyId) ?? null;
        this.companyService.currentCompany.set(this.company);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAdminUrl() {
    if (this.company) window.open(this.company.admin_url, '_blank');
  }

  getColor(name: string) { return avatarColor(name); }
}
