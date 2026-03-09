import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isDarkMode = false;
  currentUser = { name: 'Alex Rivers', role: 'System Admin' };
  searchQuery = '';

  navSetup = [
    { label: 'Users', icon: 'group', route: '/users' },
    { label: 'Alerts', icon: 'notifications_active', route: '/alerts' },
    { label: 'Development', icon: 'terminal', route: '/development' },
    { label: 'Apps', icon: 'widgets', route: '/apps' },
    { label: 'Archive', icon: 'archive', route: '/archive' },
  ];

  navCustomers = [
    { label: 'Customer Dashboard', icon: 'monitoring', route: '/customer-dashboard' },
    { label: 'Contacts', icon: 'contact_page', route: '/contacts' },
    { label: 'Servers', icon: 'dns', route: '/servers' },
    { label: 'Finance', icon: 'account_balance', route: '/finance' },
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      this.enableDark();
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.enableDark();
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }

  enableDark() {
    this.isDarkMode = true;
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
