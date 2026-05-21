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

  submit() {
    if (!this.name || !this.email || !this.message) return;
    const subject = encodeURIComponent(`Portfolio Contact from ${this.name}`);
    const body = encodeURIComponent(`Name: ${this.name}\nEmail: ${this.email}\n\n${this.message}`);
    window.location.href = `mailto:ashusig2@gmail.com?subject=${subject}&body=${body}`;
    this.close.emit();
  }

  dismiss(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close.emit();
  }
}
