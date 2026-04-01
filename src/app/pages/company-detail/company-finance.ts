import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-finance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-6">

      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Finance & Billing</h3>
          <p class="text-slate-500 text-sm mt-1">Billing and payment info for {{ company?.company_name }}.</p>
        </div>
        <div class="flex items-center gap-2 text-xs bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full">
          <span class="material-symbols-outlined text-[14px]">api</span>
          API: {{ company?.admin_url }}/api/finance
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        @for (card of financeCards; track card.label) {
          <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-2 rounded-lg" [class]="card.colorBg">
                <span class="material-symbols-outlined text-[20px]" [class]="card.colorText">{{ card.icon }}</span>
              </div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ card.label }}</p>
            </div>
            <div class="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
            <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2 w-1/2"></div>
          </div>
        }
      </div>

      <!-- Invoice Table Placeholder -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-primary/10">
          <h4 class="font-bold text-slate-800 dark:text-white">Invoices</h4>
        </div>
        <div class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-3xl text-purple-400">account_balance</span>
          </div>
          <p class="font-semibold text-slate-700 dark:text-slate-300">Finance data will load here</p>
          <p class="text-slate-400 text-sm mt-1 text-center max-w-sm">
            Fetched from<br>
            <code class="text-primary bg-primary/10 px-1 py-0.5 rounded text-xs">{{ company?.admin_url }}/api/finance</code>
          </p>
        </div>
      </div>

    </div>
  `
})
export class CompanyFinanceComponent {
  private companyService = inject(CompanyService);
  get company() { return this.companyService.currentCompany(); }

  financeCards = [
    { label: 'Total Revenue',     icon: 'payments',         colorBg: 'bg-green-50 dark:bg-green-900/20',   colorText: 'text-green-600'  },
    { label: 'Pending Invoices',  icon: 'receipt_long',     colorBg: 'bg-amber-50 dark:bg-amber-900/20',   colorText: 'text-amber-600'  },
    { label: 'Subscription Plan', icon: 'workspace_premium',colorBg: 'bg-purple-50 dark:bg-purple-900/20', colorText: 'text-purple-600' },
  ];
}
