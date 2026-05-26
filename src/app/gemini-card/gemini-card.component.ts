import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiCard, GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-gemini-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gemini-card.component.html',
})
export class GeminiCardComponent implements OnInit {
  card: GeminiCard | null = null;
  loading = true;
  selectedOption: string | null = null;
  revealed = false;

  private svc = new GeminiService();

  ngOnInit() { this.load(); }

  async load() {
    this.loading = true;
    this.card = null;
    this.selectedOption = null;
    this.revealed = false;
    this.card = await this.svc.generateCard();
    this.loading = false;
  }

  pick(opt: string) {
    if (this.revealed) return;
    this.selectedOption = opt[0]; // first char is the letter
    this.revealed = true;
  }

  isCorrect(opt: string) {
    return this.card?.answer && opt[0] === this.card.answer;
  }

  isWrong(opt: string) {
    return this.revealed && this.selectedOption === opt[0] && !this.isCorrect(opt);
  }

  typeLabel() {
    const map: Record<string, string> = {
      code: '⚡ Live Code',
      fact: '💡 Did You Know',
      quiz: '🎯 Quick Quiz',
      tip:  '🏗 Design Tip',
    };
    return map[this.card?.type ?? 'fact'] ?? '✦ Gemini';
  }
}
