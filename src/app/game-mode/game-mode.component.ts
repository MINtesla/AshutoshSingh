import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-game-mode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-mode.component.html',
})
export class GameModeComponent implements OnInit, OnDestroy {
  @Output() openContact = new EventEmitter<void>();
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  speed = 0;
  distance = 0;
  currentSection = '— Drive forward (W) —';
  currentSectionColor = '#1a1a1a';
  interactHint = '';
  panelOpen = false;
  panelTag = '';
  panelTagColor = '';
  panelTagBorderColor = '';
  panelTitle = '';
  panelSubtitle = '';
  panelBodySafe: SafeHtml = '';
  autoMode = false;

  private gameModule: any;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    import('./game.service').then(m => {
      this.gameModule = new m.GameService(
        this.canvasRef.nativeElement,
        {
          onSpeedUpdate: (v: number) => this.speed = v,
          onDistUpdate: (v: number) => this.distance = v,
          onSectionUpdate: (title: string, color: string) => {
            this.currentSection = title;
            this.currentSectionColor = color;
          },
          onHintUpdate: (h: string) => this.interactHint = h,
          onPanelOpen: (section: any) => {
            this.panelTag = `▸ ${section.id.toUpperCase()}`;
            this.panelTagColor = section.color;
            this.panelTagBorderColor = section.color;
            this.panelTitle = section.title;
            this.panelSubtitle = section.subtitle || '';
            this.panelBodySafe = this.sanitizer.bypassSecurityTrustHtml(section.body);
            this.panelOpen = true;
            // Wire up the billboard contact button after render
            setTimeout(() => {
              const cb = document.getElementById('open-contact-from-billboard');
              if (cb) {
                cb.addEventListener('click', () => {
                  this.closePanel();
                  this.openContact.emit();
                });
              }
            }, 50);
          },
          onPanelClose: () => this.panelOpen = false,
          onOpenContact: () => this.openContact.emit(),
          onAutoModeChange: (v: boolean) => this.autoMode = v,
        }
      );
    });
  }

  closePanel() { this.gameModule?.closePanel(); }
  toggleAutoTour() { this.gameModule?.toggleAutoTour(); }

  ngOnDestroy() { this.gameModule?.destroy(); }
}
