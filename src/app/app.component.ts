import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Check if there's a token in localStorage
    const userToken = localStorage.getItem('userToken');
    
    if (userToken) {
      // If token exists, user is logged in, navigate to the dashboard or home page
    } else {
      // If no token, redirect to login page
      this.router.navigate(['/login']);
    }
  }
}