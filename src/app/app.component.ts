import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameModeComponent } from './game-mode/game-mode.component';
import { StaticModeComponent } from './static-mode/static-mode.component';
import { ContactModalComponent } from './contact-modal/contact-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameModeComponent, StaticModeComponent, ContactModalComponent],
  template: `
    <!-- Loading overlay -->
    <div id="loader" class="loader" [class.fade]="loaderFade" [style.display]="loaderHidden ? 'none' : ''">
      <div class="loader-inner">
        <div class="loader-title">Booting up…</div>
        <div class="loader-bar"><div></div></div>
      </div>
    </div>

    <!-- Mode switch -->
    <div class="mode-switch">
      <button id="btn-3d" class="mode-btn" [class.active]="mode==='3d'" (click)="setMode('3d')" [disabled]="!webglSupported">3D Drive</button>
      <button id="btn-static" class="mode-btn" [class.active]="mode==='static'" (click)="setMode('static')">Static</button>
    </div>

    <app-game-mode  [hidden]="mode!=='3d'"  (openContact)="contactOpen=true"></app-game-mode>
    <app-static-mode [hidden]="mode!=='static'" (openContact)="contactOpen=true"></app-static-mode>
    <app-contact-modal [open]="contactOpen" (close)="contactOpen=false"></app-contact-modal>
  `,
})
export class AppComponent implements OnInit {
  mode: '3d' | 'static' = '3d';
  webglSupported = true;
  contactOpen = false;
  loaderFade = false;
  loaderHidden = false;

  ngOnInit() {
    this.webglSupported = this.detectWebGL();
    const saved = this.getSavedMode();
    this.setMode(!this.webglSupported ? 'static' : (saved === 'static' ? 'static' : '3d'));
    setTimeout(() => this.loaderFade = true, 400);
    setTimeout(() => this.loaderHidden = true, 1000);
  }

  setMode(m: '3d' | 'static') {
    this.mode = m;
    document.body.style.overflow = m === '3d' ? 'hidden' : 'auto';
    try { localStorage.setItem('portfolio-mode', m); } catch (_) {}
    if (m === '3d') window.dispatchEvent(new Event('resize'));
  }

  private detectWebGL(): boolean {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch { return false; }
  }

  private getSavedMode(): string | null {
    try { return localStorage.getItem('portfolio-mode'); } catch { return null; }
  }
}
