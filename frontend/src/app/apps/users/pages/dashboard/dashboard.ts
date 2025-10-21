// dashboard.ts
import { Component } from '@angular/core';
import { DashboardMap } from './dashboard-map/dashboard-map';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardMap],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {}