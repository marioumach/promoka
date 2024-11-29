import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private authService : AuthService,private router : Router){

  }
  logout(){
    this.authService.logout().then(() => {
      // Clear token and user info from localStorage on logout
      localStorage.removeItem('userToken');
      localStorage.removeItem('userEmail');
      this.router.navigate(['/login'])
      console.log('User logged out successfully');
    }).catch((error) => {
      console.error('Logout failed:', error);
    });
  }
}
