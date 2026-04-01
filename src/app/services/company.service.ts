import { Injectable, signal } from '@angular/core';

export interface CompanyInfo {
  id: number;
  company_name: string;
  owner_name: string;
  owner_mobile: string;
  owner_email: string;
  address: string;
  admin_url: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  /** Signal — automatically triggers change detection in all components that read it */
  currentCompany = signal<CompanyInfo | null>(null);
}
