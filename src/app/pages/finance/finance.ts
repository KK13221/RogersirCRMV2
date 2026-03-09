import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-finance',
  imports: [CommonModule, FormsModule],
  template: `
<div class="p-8 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Finance & Billing</h2>
      <p class="text-slate-500">Track your subscriptions, revenue and pending payouts.</p>
    </div>
    <div class="flex gap-2">
      <select [(ngModel)]="period" class="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer">
        <option>This Month</option><option>Last Month</option><option>Q1 2026</option><option>FY 2025</option>
      </select>
      <button (click)="exportFinance()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
        <span class="material-symbols-outlined text-[18px]">download</span>Export
      </button>
    </div>
  </div>

  <!-- Financial KPIs (from Stitch) -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
    @for (kpi of kpis; track kpi.label) {
      <div (click)="drillDown(kpi)" class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
        <p class="text-slate-500 text-sm">{{ kpi.label }}</p>
        <p class="text-2xl font-bold mt-2">{{ kpi.value }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ kpi.sub }}</p>
      </div>
    }
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Monthly Invoices -->
    <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-primary/10 flex items-center justify-between">
        <h4 class="font-bold text-slate-800 dark:text-white">Monthly Invoices</h4>
        <button (click)="exportInvoices()" class="text-primary text-xs font-bold hover:underline">Export All</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Invoice</th>
              <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
              <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
              <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Due Date</th>
              <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (inv of invoices; track inv.id) {
              <tr (click)="viewInvoice(inv)" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
                <td class="px-6 py-4">
                  <p class="text-sm font-semibold text-primary group-hover:underline">{{ inv.invoiceNo }}</p>
                </td>
                <td class="px-6 py-4 text-sm">{{ inv.customer }}</td>
                <td class="px-6 py-4 text-sm font-bold">{{ inv.amount }}</td>
                <td class="px-6 py-4 text-sm text-slate-500">{{ inv.dueDate }}</td>
                <td class="px-6 py-4"><span [class]="'px-2 py-1 text-[10px] font-bold rounded-full ' + inv.statusClass">{{ inv.status }}</span></td>
                <td class="px-6 py-4">
                  <button (click)="downloadInvoice(inv); $event.stopPropagation()" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"><span class="material-symbols-outlined text-[18px]">download</span></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Right Col -->
    <div class="space-y-5">

      <!-- Device Usage Summary (from Stitch) -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <h4 class="font-bold text-slate-800 dark:text-white mb-4">Device Usage Summary</h4>
        <div class="space-y-3">
          @for (device of deviceUsage; track device.name) {
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-slate-400">{{ device.icon }}</span>
                <span class="text-sm text-slate-600 dark:text-slate-400">{{ device.name }}</span>
              </div>
              <span class="text-sm font-bold">{{ device.count }}</span>
            </div>
          }
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Total Usage Cost</span>
            <span class="text-sm font-bold text-primary">$4,850.25</span>
          </div>
        </div>
      </div>

      <!-- Subscription Status -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10 shadow-sm">
        <h4 class="font-bold text-slate-800 dark:text-white mb-3">Current Plan</h4>
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-lg font-bold text-primary">Enterprise Tier</p>
            <p class="text-xs text-slate-400">32 days remaining in current cycle</p>
          </div>
          <button (click)="managePlan()" class="text-xs font-bold text-primary hover:underline">Manage</button>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full">
          <div class="h-full rounded-full bg-primary" style="width: 89.3%"></div>
        </div>
        <p class="text-[10px] text-slate-400 mt-1 text-right">89% of cycle used</p>
      </div>

      <!-- Zoho Integration -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><span class="material-symbols-outlined text-emerald-600">sync</span></div>
          <div>
            <p class="text-sm font-bold">Zoho Books Integration</p>
            <p class="text-xs text-slate-400">Auto-synced with your Zoho account</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-xs text-green-600 font-bold">Last Sync: 2 minutes ago</span>
        </div>
      </div>

    </div>
  </div>
</div>
`
})
export class FinanceComponent {
  period = 'This Month';

  kpis = [
    { label: 'Total Outstanding', value: '$12,450.00', sub: 'From 24 active contracts' },
    { label: 'Last Payment', value: '$3,200.00', sub: 'Received Oct 14, 2023' },
    { label: 'Current Plan', value: 'Enterprise', sub: 'Renewing in 12 days' },
    { label: 'MRR Forecast', value: '$45,800.00', sub: 'Projected for November' },
  ];

  invoices = [
    { id: 1, invoiceNo: 'INV-2023-0089', customer: 'Acme Corporation', amount: '$12,400.00', dueDate: 'Mar 15, 2026', status: 'PAID', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { id: 2, invoiceNo: 'INV-2023-0088', customer: 'TechNova Inc.', amount: '$3,200.00', dueDate: 'Mar 20, 2026', status: 'PENDING', statusClass: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { id: 3, invoiceNo: 'INV-2023-0087', customer: 'Globex Systems', amount: '$8,750.00', dueDate: 'Mar 10, 2026', status: 'OVERDUE', statusClass: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
    { id: 4, invoiceNo: 'INV-2023-0086', customer: 'Pinnacle Media', amount: '$2,100.00', dueDate: 'Apr 1, 2026', status: 'DRAFT', statusClass: 'bg-slate-100 text-slate-500 dark:bg-slate-800' },
    { id: 5, invoiceNo: 'INV-2023-0085', customer: 'Sterling Finance', amount: '$4,200.00', dueDate: 'Mar 5, 2026', status: 'PAID', statusClass: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  ];

  deviceUsage = [
    { name: 'IoT Active Devices', count: '1,240', icon: 'router' },
    { name: 'Edge Nodes', count: '482', icon: 'hub' },
    { name: 'Enterprise Hubs', count: '12', icon: 'dns' },
  ];

  exportFinance() { alert('Exporting financial report...(mock)'); }
  drillDown(k: any) { alert(`${k.label}: ${k.value}\n${k.sub}`); }
  exportInvoices() { alert('Exporting all invoices as PDF...(mock)'); }
  viewInvoice(inv: any) { alert(`Invoice: ${inv.invoiceNo}\nCustomer: ${inv.customer}\nAmount: ${inv.amount}\nStatus: ${inv.status}`); }
  downloadInvoice(inv: any) { alert(`Downloading ${inv.invoiceNo}...(mock)`); }
  managePlan() { alert('Opening plan management...(mock)'); }
}
