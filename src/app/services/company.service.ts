import { Injectable, signal } from '@angular/core';

export interface CompanyInfo {
  id: number;
  company_name: string;
  package_name?: string;
  owner_name: string;
  owner_mobile: string;
  owner_email: string;
  address: string;
  admin_url: string;
  created_at?: string;
  updated_at?: string;
}

export type EldApiKey =
  | 'analytics'
  | 'drivers'
  | 'clients'
  | 'activeVehicles'
  | 'serverHealth';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  currentCompany = signal<CompanyInfo | null>(null);

  readonly eldApiPaths: Record<EldApiKey, string> = {
    analytics: '/eld_log/master/view_project_detail_analytics',
    drivers: '/eld_log/master/view_driver_information',
    clients: '/eld_log/master/view_client',
    activeVehicles: '/eld_log/master/view_active_vehicle',
    serverHealth: '/eld_log/dispatch/view_server_health'
  };

  normalizeAdminUrl(url: string | null | undefined): string {
    let adminUrl = String(url || '').trim();

    if (!adminUrl) return '';

    if (!/^https?:\/\//i.test(adminUrl)) {
      adminUrl = `https://${adminUrl}`;
    }

    adminUrl = adminUrl.replace(/\/+$/, '');

    // Admin URL must remain base URL only. If user pasted full API URL, remove API path.
    adminUrl = adminUrl.replace(/\/eld_log\/.*$/i, '');

    return adminUrl.replace(/\/+$/, '');
  }

  isInvalidAdminUrl(url: string | null | undefined): boolean {
    const value = String(url || '').trim();
    return /\/eld_log\//i.test(value);
  }

  buildLiveApiUrl(adminUrl: string, apiKey: EldApiKey): string {
    const baseUrl = this.normalizeAdminUrl(adminUrl);
    return `${baseUrl}${this.eldApiPaths[apiKey]}`;
  }

  normalizeCompany(company: CompanyInfo): CompanyInfo {
    return {
      ...company,
      admin_url: this.normalizeAdminUrl(company.admin_url)
    };
  }
}
