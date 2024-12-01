import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ToastService } from '../toast.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements AfterViewInit{
  @ViewChild('toastDiv') toastDiv!: ElementRef | undefined; // Added safe check for undefined
  toast: any = null;

  constructor(private toastService: ToastService, private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Ensure the toastDiv is available after view initialization
    if (this.toastDiv) {
      this.toastService.toast$.subscribe(toast => {
        this.toast = toast;

        // When toast is received, add the 'show' class and the type
        if (toast) {
          this.showToast(toast);
        } else {
          this.hideToast();
        }
      });
    }
  }

  // Add 'show' and type class to the div element
  showToast(toast: any) {
    if (this.toastDiv) {
      this.renderer.addClass(this.toastDiv.nativeElement, 'show');
      this.renderer.addClass(this.toastDiv.nativeElement, toast.type);
    }
  }

  // Remove 'show' and type class from the div element
  hideToast() {
    if (this.toastDiv) {
      this.renderer.removeClass(this.toastDiv.nativeElement, 'show');
      if (this.toast) {
        this.renderer.removeClass(this.toastDiv.nativeElement, this.toast.type);
      }
    }
  }
}