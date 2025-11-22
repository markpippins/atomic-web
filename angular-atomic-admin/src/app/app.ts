import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav class="sidebar">
        <div class="brand">Atomic Admin</div>
        <ul>
          <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li><a routerLink="/services" routerLinkActive="active">Services</a></li>
          <li><a routerLink="/servers" routerLinkActive="active">Servers</a></li>
        </ul>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      padding: 20px;
    }
    .brand {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 30px;
    }
    .sidebar ul {
      list-style: none;
      padding: 0;
    }
    .sidebar li a {
      display: block;
      padding: 10px;
      color: #ecf0f1;
      text-decoration: none;
      border-radius: 4px;
    }
    .sidebar li a:hover, .sidebar li a.active {
      background: #34495e;
    }
    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  title = 'angular-atomic-admin';
}
