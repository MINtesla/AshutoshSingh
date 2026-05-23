import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-modal.component.html',
})
export class ContactModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  name = '';
  email = '';
  message = '';
  sending = false;
  sent = false;
  error = '';

  // Get your FREE key at web3forms.com — enter your email, check inbox, paste key here
  private readonly ACCESS_KEY = 'YOUR_WEB3FORMS_KEY';

  async submit() {
    if (!this.name || !this.email || !this.message) {
      this.error = 'Please fill in all fields.';
      return;
    }

    // If key not set yet, fall back to mailto
    if (this.ACCESS_KEY === 'YOUR_WEB3FORMS_KEY') {
      const subject = encodeURIComponent(`Portfolio Contact from ${this.name}`);
      const body = encodeURIComponent(`Name: ${this.name}\nEmail: ${this.email}\n\n${this.message}`);
      window.open(`mailto:ashusig2@gmail.com?subject=${subject}&body=${body}`);
      this.close.emit();
      return;
    }

    this.sending = true;
    this.error = '';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: this.ACCESS_KEY,
          name: this.name,
          email: this.email,
          message: this.message,
          subject: `Portfolio Contact from ${this.name}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        this.sent = true;
        this.name = '';
        this.email = '';
        this.message = '';
        setTimeout(() => {
          this.sent = false;
          this.close.emit();
        }, 2000);
      } else {
        this.error = 'Something went wrong. Please try again.';
      }
    } catch {
      this.error = 'Network error. Please try again.';
    } finally {
      this.sending = false;
    }
  }

  dismiss(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close.emit();
  }
}
