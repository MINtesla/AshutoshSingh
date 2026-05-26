import { environment } from '../../environments/environment';

export interface GeminiCard {
  type: 'code' | 'fact' | 'quiz' | 'tip';
  title: string;
  content: string;
  language?: string;
  options?: string[];
  answer?: string;
}

const PROMPT = `You are a creative assistant for a Senior Java Backend Engineer's portfolio.
Generate ONE item randomly chosen from these 4 types. Pick any type you like:

1. type "code"  — A short impressive Java/Spring Boot microservice snippet (8-14 lines), with a clever title.
2. type "fact"  — A surprising, specific fact about distributed systems, Kafka, or high-throughput backends (2-3 sentences).
3. type "quiz"  — A tricky multiple-choice backend/Java question with 4 options and the correct answer letter.
4. type "tip"   — A practical system design tip or pattern used at scale (2-3 sentences with a punchy title).

Respond ONLY with valid JSON (no markdown, no backticks) in this exact shape:
For code: {"type":"code","title":"...","content":"...","language":"java"}
For quiz:  {"type":"quiz","title":"Quick Challenge","content":"Question?","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"B"}
For fact/tip: {"type":"fact","title":"...","content":"..."}`;

export class GeminiService {

  // Mirrors your Java GeminiApiService config
  private readonly apiKey   = environment.geminiApiKey;
  private readonly model    = 'gemini-1.5-flash';
  private readonly baseUrl  = 'https://generativelanguage.googleapis.com/v1beta/models';

  /**
   * Generate text content using Gemini API.
   * Mirrors: GeminiApiService.generate(prompt, maxTokens, temperature)
   */
  async generate(prompt: string, maxTokens = 512, temperature = 1.2): Promise<string> {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.9,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API call failed: ${response.status}`);
    }

    const body = await response.text();
    return this.extractText(body);
  }

  /**
   * Mirrors: GeminiApiService.generateDocument(prompt)
   * Lower temperature, higher token limit for structured output.
   */
  async generateDocument(prompt: string): Promise<string> {
    return this.generate(prompt, 8192, 0.2);
  }

  /**
   * Main method used by GeminiCardComponent.
   * Calls generate() and parses JSON into a GeminiCard.
   */
  async generateCard(): Promise<GeminiCard> {
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY' || this.apiKey === 'GEMINI_KEY_PLACEHOLDER') {
      return this.fallback();
    }
    try {
      const raw = await this.generate(PROMPT, 512, 1.2);
      // Strip accidental markdown fences (mirrors your extractText safety)
      const clean = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(clean) as GeminiCard;
    } catch (e) {
      console.error('Gemini card generation failed:', e);
      return this.fallback();
    }
  }

  /**
   * Mirrors: GeminiApiService.extractText(responseBody)
   */
  private extractText(responseBody: string): string {
    try {
      const root = JSON.parse(responseBody);
      const candidates = root?.candidates;
      if (Array.isArray(candidates) && candidates.length > 0) {
        const parts = candidates[0]?.content?.parts;
        if (Array.isArray(parts) && parts.length > 0) {
          return parts[0]?.text ?? '';
        }
      }
      const error = root?.error;
      if (error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      console.warn('Unexpected Gemini response structure:', responseBody);
      return '';
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      throw new Error('Failed to parse Gemini response');
    }
  }

  /** Fallback content when API key is not set */
  private fallback(): GeminiCard {
    const items: GeminiCard[] = [
      {
        type: 'code', language: 'java',
        title: 'Resilient Kafka Consumer',
        content:
`@KafkaListener(topics = "events", groupId = "svc")
public void consume(ConsumerRecord<String, Event> rec) {
  try {
    process(rec.value());
  } catch (RetryableException ex) {
    retryTemplate.execute(ctx -> process(rec.value()));
  } catch (Exception ex) {
    deadLetter.send(rec);
    log.error("DLQ → {}", rec.key(), ex);
  }
}`,
      },
      {
        type: 'fact',
        title: 'Did You Know?',
        content: 'Kafka sustains >1M messages/sec on a single broker by batching sequential disk writes — faster than random-access DBs despite being disk-based.',
      },
      {
        type: 'tip',
        title: 'Circuit Breaker Pattern',
        content: 'Wrap downstream calls in Resilience4j. After N failures the circuit opens — requests fail-fast instead of piling up, protecting your thread pool from cascading failure.',
      },
      {
        type: 'quiz',
        title: 'Quick Challenge',
        content: 'Which construct is best for composing async microservice calls without blocking threads?',
        options: ['A. Thread.join()', 'B. CompletableFuture', 'C. synchronized block', 'D. CountDownLatch'],
        answer: 'B',
      },
    ];
    return items[Math.floor(Math.random() * items.length)];
  }
}
