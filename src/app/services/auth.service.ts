import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { environment } from '../app.module';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth(initializeApp(environment.firebase));
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {
    this.auth.onAuthStateChanged(user => {
      this.userSubject.next(user);  // Update user state
    });
  }

  // Sign up a user with email and password
  signUp(email: string, password: string): Promise<any> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Sign in a user with email and password
  signIn(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
     return signOut(this.auth)
  }

  // Get current user info
  getCurrentUser(): Observable<any> {
    return this.userSubject.asObservable();
  }
}
