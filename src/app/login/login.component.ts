import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Handle form submission for login
  onSubmit() {
    this.authService
      .signIn(this.email, this.password)
      .then((userCredential) => {
        console.log('Login successful!');

        // Get the ID token and store it in localStorage
        userCredential.user.getIdToken().then((idToken:any) => {
          // Save token to localStorage
          localStorage.setItem('userToken', idToken);
          localStorage.setItem('userEmail', userCredential.user.email); // Optionally, save user info
        });

        // Navigate to the dashboard or homepage
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Login error:', error);
        this.errorMessage = error.message;  // Show error message
      });
  }
}