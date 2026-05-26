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
{
  "type": "code",
  "title": "...",
  "content": "...",
  "language": "java"
}
OR for quiz:
{
  "type": "quiz",
  "title": "Quick Challenge",
  "content": "Question text here?",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "answer": "B"
}
OR for fact/tip:
{
  "type": "fact",
  "title": "...",
  "content": "..."
}`;

export class GeminiService {
  // Get free key at: https://aistudio.google.com/app/apikey
  private readonly API_KEY = 'YOUR_GEMINI_API_KEY';
  private readonly MODEL = 'gemini-2.0-flash';
  private readonly URL = `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`;

  async generate(): Promise<GeminiCard> {
    if (this.API_KEY === 'YOUR_GEMINI_API_KEY') {
      return this.fallback();
    }

    const res = await fetch(this.URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }] }],
        generationConfig: { temperature: 1.2, maxOutputTokens: 512 },
      }),
    });

    if (!res.ok) return this.fallback();

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    try {
      // strip any accidental markdown fences
      const clean = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(clean) as GeminiCard;
    } catch {
      return this.fallback();
    }
  }

  private fallback(): GeminiCard {
    const items: GeminiCard[] = [
      {
        type: 'code',
        title: 'Resilient Kafka Consumer',
        language: 'java',
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
        title: 'Did you know?',
        content: 'Kafka can sustain >1 million messages/sec on a single broker by batching writes to disk sequentially — making it faster than random-access databases despite being disk-based.',
      },
      {
        type: 'tip',
        title: 'Circuit Breaker Pattern',
        content: 'Wrap downstream calls in a circuit breaker (Resilience4j). After N failures the circuit opens — requests fail-fast instead of piling up, protecting your thread pool from cascading failure.',
      },
      {
        type: 'quiz',
        title: 'Quick Challenge',
        content: 'Which Java concurrency construct is best for composing async microservice calls without blocking threads?',
        options: ['A. Thread.join()', 'B. CompletableFuture', 'C. synchronized block', 'D. CountDownLatch'],
        answer: 'B',
      },
    ];
    return items[Math.floor(Math.random() * items.length)];
  }
}
