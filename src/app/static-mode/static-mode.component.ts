import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-static-mode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './static-mode.component.html',
})
export class StaticModeComponent implements AfterViewInit {
  @Output() openContact = new EventEmitter<void>();

  private animationsInited = false;

  ngAfterViewInit() {
    // Small delay so the element is rendered and visible
    setTimeout(() => this.initStaticAnimations(), 80);
  }

  private initStaticAnimations() {
    if (this.animationsInited) return;
    this.animationsInited = true;

    const scrollRoot = document.getElementById('static-mode');
    if (!scrollRoot) return;

    // 1. Scroll-reveal (data-reveal)
    const revealEls = scrollRoot.querySelectorAll('[data-reveal]');
    if (revealEls.length && window.IntersectionObserver) {
      const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const siblings = entry.target.parentElement!.querySelectorAll('[data-reveal]');
            siblings.forEach((el, i) => {
              setTimeout(() => el.classList.add('sp-visible'), i * 80);
            });
            revealObs.unobserve(entry.target);
          }
        });
      }, { root: scrollRoot, rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
      revealEls.forEach(el => revealObs.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('sp-visible'));
    }

    // 2. Number counter animation (data-count)
    const counterEls = scrollRoot.querySelectorAll('.sp-stat-n[data-count]');
    if (counterEls.length && window.IntersectionObserver) {
      const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset['count']!, 10);
          if (isNaN(target)) return;
          const duration = 1400;
          const startTime = performance.now();
          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            el.textContent = String(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          counterObs.unobserve(el);
        });
      }, { root: scrollRoot, threshold: 0.5 });
      counterEls.forEach(el => counterObs.observe(el));
    }

    // 3. Read-more accordion (data-expand)
    scrollRoot.querySelectorAll('[data-expand]').forEach((btn: Element) => {
      const btnEl = btn as HTMLElement;
      const targetId = btnEl.dataset['expand']!;
      const labelClose = btnEl.dataset['labelClose'] || 'Hide ↑';
      const labelOpen = btnEl.textContent!.trim();

      btnEl.addEventListener('click', () => {
        const panel = document.getElementById(targetId);
        if (!panel) return;
        const isOpen = !panel.classList.contains('hidden');
        if (isOpen) {
          panel.classList.add('hidden');
          btnEl.classList.remove('sp-rm-open');
          btnEl.textContent = labelOpen;
        } else {
          panel.classList.remove('hidden');
          btnEl.classList.add('sp-rm-open');
          btnEl.textContent = labelClose;
          setTimeout(() => {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 60);
        }
      });
    });

    // 4. Active nav link tracking on scroll
    const navLinks = scrollRoot.querySelectorAll('.sp-nl[href^="#"]');
    const sections: { id: string; link: Element; sec: Element }[] = [];
    navLinks.forEach(link => {
      const id = link.getAttribute('href')!.slice(1);
      const sec = document.getElementById(id);
      if (sec) sections.push({ id, link, sec });
    });

    if (sections.length && window.IntersectionObserver) {
      const navObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'));
            const found = sections.find(s => s.sec === entry.target);
            if (found) found.link.classList.add('active');
          }
        });
      }, { root: scrollRoot, rootMargin: '-40% 0px -55% 0px', threshold: 0 });
      sections.forEach(({ sec }) => navObs.observe(sec));
    }

    // 5. Smooth scroll for nav anchor links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href')!.slice(1);
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}
