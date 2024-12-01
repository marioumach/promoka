import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    const toast: Toast = { message, type };
    this.toastSubject.next(toast);

    // Automatically hide the toast after a few seconds
    setTimeout(() => {
      this.toastSubject.next(null);
    }, 600000); // Toast will disappear after 3 seconds
  }

  hideToast() {
    this.toastSubject.next(null);
  }
}