import { Component, inject, effect, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CompanyService } from '../../services/company.service';

interface ServerHealth {
  host: string;
  date: string;
  cpu: number;
  memory: number;
  tomcat: number;
  load: string;
  receivedTimestamp: number;
}

// SVG gauge constants
const RADIUS = 45;
const CIRC   = 2 * Math.PI * RADIUS; // ≈ 282.74

@Component({
  selector: 'app-company-servers',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="p-8 space-y-8">

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Server Monitoring</h3>
          <p class="text-slate-500 text-sm mt-1">
            Real-time health metrics for
            <span class="font-semibold text-primary">{{ company?.company_name }}</span>'s server.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Auto-refresh countdown -->
          @if (!loading && health) {
            <div class="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 border border-primary/10 px-3 py-1.5 rounded-full">
              <span class="material-symbols-outlined text-[14px]">schedule</span>
              Auto-refresh in {{ countdown }}s
            </div>
          }

          <!-- Refresh button -->
          <button (click)="reload()"
            class="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300
                   bg-white dark:bg-slate-900 border border-primary/10 hover:border-primary/40
                   px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="loading">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <!-- ── Loading skeletons ────────────────────────────────────────────── -->
      @if (loading) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 p-6 animate-pulse flex flex-col items-center gap-4">
              <div class="w-36 h-36 rounded-full bg-slate-100 dark:bg-slate-800"></div>
              <div class="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
          }
        </div>
      }

      <!-- ── Error ────────────────────────────────────────────────────────── -->
      @if (error && !loading) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex items-start gap-4">
          <span class="material-symbols-outlined text-red-500 text-2xl mt-0.5">error_outline</span>
          <div>
            <p class="font-bold text-red-700 dark:text-red-400">Failed to load server health</p>
            <p class="text-sm text-red-600 dark:text-red-500 mt-1">{{ error }}</p>
            <button (click)="reload()" class="mt-3 text-xs font-bold text-red-600 hover:underline cursor-pointer">↺ Retry</button>
          </div>
        </div>
      }

      <!-- ── Main Content ─────────────────────────────────────────────────── -->
      @if (health && !loading) {

        <!-- ── Server Info Banner ─────────────────────────────────────────── -->
        <div class="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black
                    rounded-2xl p-5 flex flex-wrap items-center gap-6 shadow-lg">

          <!-- Status badge -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
              <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
            <span class="text-xs font-bold uppercase tracking-widest text-emerald-400">Server Online</span>
          </div>

          <div class="w-px h-8 bg-slate-700 hidden sm:block"></div>

          <!-- Host -->
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-400 text-[18px]">dns</span>
            <div>
              <p class="text-[10px] text-slate-500 uppercase tracking-wider">Host</p>
              <p class="text-white font-mono font-bold text-sm">{{ health.host }}</p>
            </div>
          </div>

          <div class="w-px h-8 bg-slate-700 hidden sm:block"></div>

          <!-- Date -->
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
            <div>
              <p class="text-[10px] text-slate-500 uppercase tracking-wider">Last Recorded</p>
              <p class="text-white font-semibold text-sm">{{ health.date }}</p>
            </div>
          </div>

          <div class="w-px h-8 bg-slate-700 hidden sm:block"></div>

          <!-- System Load (raw) -->
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-400 text-[18px]">speed</span>
            <div>
              <p class="text-[10px] text-slate-500 uppercase tracking-wider">Load Avg (1/5/15m)</p>
              <p class="text-white font-mono font-bold text-sm">{{ health.load }}</p>
            </div>
          </div>
        </div>

        <!-- ── Circular Gauges ─────────────────────────────────────────────── -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">

          @for (gauge of gauges; track gauge.key) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm
                        hover:shadow-md hover:border-primary/30 transition-all p-6 flex flex-col items-center gap-4">

              <!-- SVG Gauge -->
              <div class="relative">
                <svg width="160" height="160" viewBox="0 0 120 120">
                  <!-- Track circle -->
                  <circle
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke-width="9"
                    class="text-slate-100 dark:text-slate-800"
                    [attr.stroke]="'currentColor'"
                    style="color: var(--gauge-track, #f1f5f9);"
                  />
                  <!-- Value circle -->
                  <circle
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke-width="9"
                    stroke-linecap="round"
                    transform="rotate(-90 60 60)"
                    [attr.stroke]="getGaugeColor(getHealthValue(gauge.key))"
                    [attr.stroke-dasharray]="getDashArray(getHealthValue(gauge.key))"
                    style="transition: stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1);"
                  />
                  <!-- Center text: value -->
                  <text x="60" y="54" text-anchor="middle"
                    font-size="20" font-weight="800" font-family="system-ui"
                    [attr.fill]="getGaugeColor(getHealthValue(gauge.key))">
                    {{ getHealthValue(gauge.key) | number:'1.1-1' }}
                  </text>
                  <text x="60" y="70" text-anchor="middle"
                    font-size="9" font-weight="600" font-family="system-ui"
                    fill="#94a3b8">
                    %
                  </text>
                </svg>

                <!-- Status badge under gauge -->
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2
                            text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                     [class]="getStatusBadgeClass(getHealthValue(gauge.key))">
                  {{ getStatusLabel(getHealthValue(gauge.key)) }}
                </div>
              </div>

              <!-- Label -->
              <div class="text-center mt-2">
                <div class="flex items-center justify-center gap-2 mb-1">
                  <div class="p-1.5 rounded-lg" [class]="gauge.iconBg">
                    <span class="material-symbols-outlined text-[18px]" [class]="gauge.iconColor">{{ gauge.icon }}</span>
                  </div>
                  <p class="font-bold text-slate-800 dark:text-white">{{ gauge.label }}</p>
                </div>
                <p class="text-xs text-slate-400">{{ gauge.description }}</p>
              </div>

              <!-- Mini bar -->
              <div class="w-full">
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                       [style.width]="getHealthValue(gauge.key) + '%'"
                       [style.background]="getGaugeColor(getHealthValue(gauge.key))">
                  </div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

            </div>
          }

        </div>

        <!-- ── System Load Averages ────────────────────────────────────────── -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm overflow-hidden">

          <div class="px-6 py-4 border-b border-primary/10 flex items-center gap-3">
            <div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <span class="material-symbols-outlined text-indigo-600">speed</span>
            </div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-white">System Load Average</h4>
              <p class="text-xs text-slate-400 mt-0.5">CPU load over the last 1, 5, and 15 minutes</p>
            </div>
          </div>

          <div class="p-6 grid grid-cols-3 gap-6">
            @for (load of loadValues; track load.label) {
              <div class="text-center">
                <div class="relative w-20 h-20 mx-auto mb-3">
                  <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke-width="7" stroke="#f1f5f9"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke-width="7"
                      stroke="#6366f1" stroke-linecap="round"
                      [attr.stroke-dasharray]="getLoadDash(load.value)"
                      style="transition: stroke-dasharray 0.8s ease;"/>
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm font-black text-slate-800 dark:text-white font-mono">
                      {{ load.value | number:'1.2-2' }}
                    </span>
                  </div>
                </div>
                <p class="font-bold text-slate-700 dark:text-slate-300 text-sm">{{ load.label }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ load.sublabel }}</p>
              </div>
            }
          </div>

        </div>

        <!-- ── API Info Footer ─────────────────────────────────────────────── -->
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="material-symbols-outlined text-[14px]">api</span>
          Data fetched from:
          <code class="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">
            {{ company?.admin_url }}/eld_log/dispatch/view_server_health
          </code>
        </div>

      }

    </div>
  `
})
export class CompanyServersComponent implements OnDestroy {

  private companyService = inject(CompanyService);
  private http           = inject(HttpClient);
  private cdr            = inject(ChangeDetectorRef);

  get company() { return this.companyService.currentCompany(); }

  health:   ServerHealth | null = null;
  loading:  boolean = false;
  error:    string  = '';
  countdown: number = 30;

  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  // ── Gauge configs ────────────────────────────────────────────────────────
  gauges = [
    {
      key: 'cpu',
      label: 'CPU Usage',
      description: 'Processor utilisation',
      icon: 'memory',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600',
    },
    {
      key: 'memory',
      label: 'Memory Usage',
      description: 'RAM utilisation',
      icon: 'storage',
      iconBg: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600',
    },
    {
      key: 'tomcat',
      label: 'Tomcat Usage',
      description: 'Tomcat server load',
      icon: 'cloud_sync',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600',
    },
  ];

  // ── Parse load string into 3 values ─────────────────────────────────────
  get loadValues() {
    const parts = (this.health?.load ?? '0, 0, 0')
      .split(',')
      .map(v => parseFloat(v.trim()));
    return [
      { label: '1 Minute',  sublabel: 'Last minute avg',  value: parts[0] ?? 0 },
      { label: '5 Minutes', sublabel: 'Last 5 min avg',   value: parts[1] ?? 0 },
      { label: '15 Minutes',sublabel: 'Last 15 min avg',  value: parts[2] ?? 0 },
    ];
  }

  constructor() {
    effect(() => {
      const c = this.companyService.currentCompany();
      if (c?.admin_url) {
        this.fetchHealth(c.admin_url);
        this.startAutoRefresh(c.admin_url);
      }
    });
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  // ── API call ─────────────────────────────────────────────────────────────
  fetchHealth(adminUrl: string) {
    this.loading = true;
    this.error   = '';
    this.cdr.detectChanges();

    this.http.post<any>(`${adminUrl}/eld_log/dispatch/view_server_health`, {}).subscribe({
      next: (res) => {
        if (res?.status === 'SUCCESS' && res?.result) {
          this.health = res.result as ServerHealth;
        } else {
          this.error = res?.message ?? 'Unexpected response from the API.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = `Could not reach ${adminUrl}. Make sure the server is accessible.`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  reload() {
    const c = this.companyService.currentCompany();
    if (c?.admin_url) {
      this.fetchHealth(c.admin_url);
      this.resetCountdown();
    }
  }

  // ── Auto-refresh every 30s ───────────────────────────────────────────────
  startAutoRefresh(adminUrl: string) {
    this.clearTimers();
    this.countdown = 30;

    this.countdownTimer = setInterval(() => {
      this.countdown--;
      this.cdr.detectChanges();
    }, 1000);

    this.refreshTimer = setInterval(() => {
      this.fetchHealth(adminUrl);
      this.countdown = 30;
    }, 30_000);
  }

  resetCountdown() {
    this.countdown = 30;
  }

  clearTimers() {
    if (this.refreshTimer)   clearInterval(this.refreshTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  // ── Gauge helpers ────────────────────────────────────────────────────────
  getHealthValue(key: string): number {
    return (this.health as any)?.[key] ?? 0;
  }

  getDashArray(value: number): string {
    const clamped = Math.min(Math.max(value, 0), 100);
    const fill    = (clamped / 100) * CIRC;
    return `${fill} ${CIRC}`;
  }

  // For the smaller load ring (r=32, circ≈201)
  getLoadDash(value: number): string {
    const loadCirc = 2 * Math.PI * 32;
    // Treat 2.0 as "full" for load average
    const pct = Math.min((value / 2.0) * 100, 100);
    const fill = (pct / 100) * loadCirc;
    return `${fill} ${loadCirc}`;
  }

  getGaugeColor(value: number): string {
    if (value >= 80) return '#ef4444'; // red
    if (value >= 50) return '#f59e0b'; // amber
    return '#10b981';                  // emerald
  }

  getStatusLabel(value: number): string {
    if (value >= 80) return 'Critical';
    if (value >= 50) return 'Warning';
    return 'Healthy';
  }

  getStatusBadgeClass(value: number): string {
    if (value >= 80) return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    if (value >= 50) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
    return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
  }
}
