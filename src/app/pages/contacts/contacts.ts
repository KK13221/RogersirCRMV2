import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-contacts',
    imports: [CommonModule, FormsModule],
    template: `
<div class="p-8 space-y-6">
  <div class="flex items-center justify-between">
    <div><h2 class="text-2xl font-bold text-slate-900 dark:text-white">Contacts</h2><p class="text-slate-500">Manage customer and partner contacts.</p></div>
    <button (click)="addContact()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20">
      <span class="material-symbols-outlined text-[18px]">person_add</span>New Contact
    </button>
  </div>

  <!-- View Toggle + Search -->
  <div class="flex items-center justify-between">
    <div class="flex gap-2">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input [(ngModel)]="searchTerm" class="pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 w-72" placeholder="Search contacts..." />
      </div>
      <select [(ngModel)]="filterCompany" class="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer">
        <option value="">All Companies</option>
        <option>Acme Corporation</option><option>Globex Systems</option><option>TechNova Inc.</option><option>Pinnacle Media</option>
      </select>
    </div>
    <div class="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      <button (click)="viewMode='grid'" [class]="viewMode==='grid' ? 'p-1.5 bg-white dark:bg-slate-700 rounded-md shadow text-primary' : 'p-1.5 text-slate-400'"><span class="material-symbols-outlined text-[20px]">grid_view</span></button>
      <button (click)="viewMode='list'" [class]="viewMode==='list' ? 'p-1.5 bg-white dark:bg-slate-700 rounded-md shadow text-primary' : 'p-1.5 text-slate-400'"><span class="material-symbols-outlined text-[20px]">list</span></button>
    </div>
  </div>

  <!-- Cards Grid -->
  @if (viewMode === 'grid') {
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      @for (contact of filteredContacts; track contact.id) {
        <div (click)="viewContact(contact)" class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm p-5 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
          <div class="flex items-start gap-4">
            <div [class]="'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ' + contact.avatarBg">{{ contact.initials }}</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800 dark:text-white">{{ contact.name }}</p>
              <p class="text-xs text-slate-500">{{ contact.title }}</p>
              <p class="text-xs text-primary font-medium mt-1">{{ contact.company }}</p>
            </div>
          </div>
          <div class="mt-4 space-y-2">
            <div class="flex items-center gap-2 text-xs text-slate-500"><span class="material-symbols-outlined text-[14px]">mail</span>{{ contact.email }}</div>
            <div class="flex items-center gap-2 text-xs text-slate-500"><span class="material-symbols-outlined text-[14px]">phone</span>{{ contact.phone }}</div>
          </div>
          <div class="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button (click)="emailContact(contact); $event.stopPropagation()" class="flex-1 py-1.5 text-xs font-semibold border border-primary/20 text-primary rounded-lg hover:bg-primary/10 transition-colors"><span class="material-symbols-outlined text-[14px] align-middle">mail</span> Email</button>
            <button (click)="callContact(contact); $event.stopPropagation()" class="flex-1 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span class="material-symbols-outlined text-[14px] align-middle">phone</span> Call</button>
          </div>
        </div>
      }
    </div>
  }

  <!-- List View -->
  @if (viewMode === 'list') {
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <tr>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Company</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Phone</th>
            <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (contact of filteredContacts; track contact.id) {
            <tr (click)="viewContact(contact)" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div [class]="'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ' + contact.avatarBg">{{ contact.initials }}</div>
                  <div><p class="text-sm font-semibold group-hover:text-primary">{{ contact.name }}</p><p class="text-xs text-slate-400">{{ contact.title }}</p></div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-primary font-medium">{{ contact.company }}</td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ contact.email }}</td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ contact.phone }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-1" (click)="$event.stopPropagation()">
                  <button (click)="emailContact(contact)" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"><span class="material-symbols-outlined text-[18px]">mail</span></button>
                  <button (click)="editContact(contact)" class="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>
`
})
export class ContactsComponent {
    searchTerm = '';
    filterCompany = '';
    viewMode = 'grid';

    contacts = [
        { id: 1, name: 'Jennifer Walsh', title: 'CEO', company: 'Acme Corporation', email: 'jen@acme.com', phone: '+1 (555) 010-1234', initials: 'JW', avatarBg: 'bg-primary' },
        { id: 2, name: 'Robert Kim', title: 'CTO', company: 'Globex Systems', email: 'rkim@globex.com', phone: '+1 (555) 020-5678', initials: 'RK', avatarBg: 'bg-purple-500' },
        { id: 3, name: 'Amara Diallo', title: 'Head of Operations', company: 'TechNova Inc.', email: 'amara@technova.io', phone: '+1 (555) 030-9012', initials: 'AD', avatarBg: 'bg-green-500' },
        { id: 4, name: 'Michael Torres', title: 'VP Engineering', company: 'Globex Systems', email: 'mtorres@globex.com', phone: '+1 (555) 040-3456', initials: 'MT', avatarBg: 'bg-orange-500' },
        { id: 5, name: 'Sophie Laurent', title: 'Product Manager', company: 'Pinnacle Media', email: 'slaurent@pinnacle.com', phone: '+1 (555) 050-7890', initials: 'SL', avatarBg: 'bg-pink-500' },
        { id: 6, name: 'David Osei', title: 'Finance Director', company: 'Acme Corporation', email: 'dosei@acme.com', phone: '+1 (555) 060-2345', initials: 'DO', avatarBg: 'bg-teal-500' },
    ];

    get filteredContacts() {
        return this.contacts.filter(c =>
            (c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || c.company.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
            (!this.filterCompany || c.company === this.filterCompany)
        );
    }

    addContact() { alert('Add Contact dialog...(mock)'); }
    viewContact(c: any) { alert(`Contact: ${c.name}\nTitle: ${c.title}\nCompany: ${c.company}\nEmail: ${c.email}`); }
    emailContact(c: any) { alert(`Opening email to ${c.name} (${c.email})...(mock)`); }
    callContact(c: any) { alert(`Calling ${c.name} at ${c.phone}...(mock)`); }
    editContact(c: any) { alert(`Edit contact: ${c.name}...(mock)`); }
}
