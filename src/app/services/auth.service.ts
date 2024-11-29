import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { environment } from '../app.module';
import { NgxSpinnerService } from 'ngx-spinner';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth(initializeApp(environment.firebase));
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private spinner : NgxSpinnerService) {
    
    this.auth.onAuthStateChanged(user => {
      this.userSubject.next(user);  // Update user state
    });
  }

  // Sign up a user with email and password
  signUp(email: string, password: string): Promise<any> {
    this.spinner.show();
    return createUserWithEmailAndPassword(this.auth, email, password).finally(()=>this.spinner.hide());
  }

  // Sign in a user with email and password
  signIn(email: string, password: string): Promise<any> {
    this.spinner.show();

    return signInWithEmailAndPassword(this.auth, email, password).finally(()=>this.spinner.hide());
  }

  logout() {
    this.spinner.show();

     return signOut(this.auth).finally(()=>this.spinner.hide())
  }

  // Get current user info
  getCurrentUser(): Observable<any> {

    return this.userSubject.asObservable();
  }
}
