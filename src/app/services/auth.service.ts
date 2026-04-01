import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  last_login_fmt?: string;
}

const STORAGE_KEY = 'gbt_auth_user';
const TOKEN_KEY   = 'gbt_auth_token';

// ── Point this to your PHP backend ──────────────────────────────────────────
const LOGIN_URL = 'http://localhost/gbtbackend/api/auth/login.php';
const LOGOUT_URL  = 'http://localhost/gbtbackend/api/auth/logout.php';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<AuthUser | null>(this.loadUserFromStorage());

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Call PHP login API ────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(LOGIN_URL, { email, password })
      );

      if (res?.status === 'SUCCESS' && res?.user) {
        const user: AuthUser = res.user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, res.token ?? '');
        this.currentUser.set(user);
        return { success: true, message: 'Login successful.' };
      }

      return { success: false, message: res?.message ?? 'Login failed.' };

    } catch (err: any) {
      const msg = err?.error?.message ?? 'Could not reach the server. Check your connection.';
      return { success: false, message: msg };
    }
  }

  // ── Clear session ─────────────────────────────────────────────────────────
  async logout() {
    const user = this.currentUser();
    if (user) {
      try {
        await firstValueFrom(
          this.http.post<any>(LOGOUT_URL, { userId: user.id, email: user.email })
        );
      } catch (err) {
        console.warn('Logout log could not be saved to backend.');
      }
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
