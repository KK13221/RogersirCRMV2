import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-contacts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-6">

      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Contacts</h3>
          <p class="text-slate-500 text-sm mt-1">Customer contacts from {{ company?.company_name }}'s portal.</p>
        </div>
        <div class="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full">
          <span class="material-symbols-outlined text-[14px]">api</span>
          API: {{ company?.admin_url }}/api/contacts
        </div>
      </div>

      <!-- Placeholder Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
          <h4 class="font-bold text-slate-800 dark:text-white">Contact List</h4>
          <span class="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Data from Admin URL API</span>
        </div>
        <div class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-3xl text-blue-400">contact_page</span>
          </div>
          <p class="font-semibold text-slate-700 dark:text-slate-300">Contacts will load here</p>
          <p class="text-slate-400 text-sm mt-1 text-center max-w-sm">
            This section will fetch contact data from<br>
            <code class="text-primary bg-primary/10 px-1 py-0.5 rounded text-xs">{{ company?.admin_url }}/api/contacts</code>
          </p>
        </div>
      </div>

    </div>
  `
})
export class CompanyContactsComponent {
  private companyService = inject(CompanyService);
  get company() { return this.companyService.currentCompany(); }
}
