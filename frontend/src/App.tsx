import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, FileText, Info, Loader2, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { analyzeFile, analyzeText, getModelInfo, type PredictionResult } from './services/api';

const outcomeSummary = [
  { title: 'Real', description: 'The model classifies the text as real based on learned language patterns; this does not verify its claims.' },
  { title: 'Fake', description: 'The model classifies the text as fake based on learned language patterns; this does not verify its claims.' },
];

const steps = [
  'User submits a headline and article text or an uploaded document.',
  'The backend validates length, format, and text extraction safety.',
  'A TF-IDF + classifier pipeline analyzes patterns in the text.',
  'The model returns a prediction and clear limitations for human review.',
];

const faqs = [
  {
    question: 'How does fake news detection work?',
    answer: 'The platform uses a trained text-classification model to look for patterns in news language, tone, and structure. It does not prove whether a claim is true or false.',
  },
  {
    question: 'What upload formats are supported?',
    answer: 'The app supports .txt, .pdf, and .docx files up to 5 MB. Other formats are rejected to keep the pipeline safe and predictable.',
  },
  {
    question: 'Is the result always correct?',
    answer: 'No. The model always selects Real or Fake for valid article text, even when the scores are close. It is a text-pattern classification, not proof of factual accuracy.',
  },
  {
    question: 'What do confidence scores mean?',
    answer: 'Confidence is a model estimate of how strongly the text matches the learned patterns in the training domain. It is not a measure of factual certainty.',
  },
  {
    question: 'How are uploaded articles handled?',
    answer: 'Files are checked for size, file signature, and readable content. They are parsed on the backend and are not executed.',
  },
  {
    question: 'Does the platform store submitted content?',
    answer: 'By default, the app is designed not to store article content unless an explicit consented history feature is added in a production deployment.',
  },
  {
    question: 'How can I verify a claim independently?',
    answer: 'Cross-check the claim with reliable reporting, read the original source, and review whether the article includes evidence and named sources.',
  },
  {
    question: 'What languages are supported?',
    answer: 'This demo is designed around English-language news patterns. It may perform poorly on other languages or narrow niche sources.',
  },
];

function HomePage() {
  useEffect(() => {
    document.title = 'TruthLens AI | AI-Powered Fake News Detection';
  }, []);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sage/20 bg-sage/10 px-3 py-1 text-sm font-medium text-sage">
              <Sparkles size={16} /> AI-powered media literacy
            </div>
            <h1 className="max-w-xl text-balance text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
              Question the News. Discover the Evidence.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-charcoal/75">
              TruthLens AI classifies valid news text as Real or Fake according to the higher model score. The score reflects learned patterns, not proof that a story is true or false.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link to="/analyze" className="inline-flex items-center gap-2 rounded-full bg-sage px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-[#7d8c61]">
                Analyze News
                <ArrowRight size={18} />
              </Link>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-white px-6 py-3 font-semibold text-charcoal transition hover:border-sage hover:text-sage">
                How It Works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-8 text-sm text-charcoal/70">
              <div><strong className="text-charcoal">Secure</strong><br />Document validation</div>
              <div><strong className="text-charcoal">Transparent</strong><br />Model limitations</div>
              <div><strong className="text-charcoal">Responsible</strong><br />Human verification first</div>
            </div>
          </div>

          <div className="card-surface rounded-3xl border border-sage/15 bg-[#f5efe7] p-6 shadow-soft">
            <div className="rounded-2xl border border-sage/10 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal/60">Headline</p>
                  <h2 className="text-xl font-semibold">City officials announce new public safety plan</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Real</span>
              </div>
              <p className="text-sm leading-6 text-charcoal/75">
                Local officials released the updated public safety plan after a review of staffing, emergency response timelines, and infrastructure funding. The article includes named offices, dates, and a public comment period before final adoption.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#f7f2eb] p-3">
                  <p className="text-xs uppercase tracking-wide text-charcoal/60">Prediction</p>
                  <p className="mt-2 font-semibold text-sage">Real</p>
                </div>
                <div className="rounded-2xl bg-[#f7f2eb] p-3">
                  <p className="text-xs uppercase tracking-wide text-charcoal/60">Confidence</p>
                  <p className="mt-2 font-semibold">0.81</p>
                </div>
                <div className="rounded-2xl bg-[#f7f2eb] p-3">
                  <p className="text-xs uppercase tracking-wide text-charcoal/60">Status</p>
                  <p className="mt-2 font-semibold text-amber-700">Validated domain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-[#efe8df]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">Possible outcomes</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Two model classes. Always check the evidence.</h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
            {outcomeSummary.map((item) => (
              <div key={item.title} className="card-surface rounded-3xl p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage/10 text-sage">
                  {item.title === 'Real' && <CheckCircle2 size={24} />}
                  {item.title === 'Fake' && <AlertTriangle size={24} />}
                  {item.title === 'Inconclusive' && <Info size={24} />}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-charcoal/75">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">A careful workflow for accountable analysis.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step} className="card-surface rounded-3xl p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-sage text-sm font-bold text-white">{idx + 1}</div>
              <p className="text-charcoal/80">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <ShieldCheck className="mb-4 text-sage" size={28} />
              <h3 className="text-xl font-semibold">Responsible AI</h3>
              <p className="mt-3 text-charcoal/75">The app shows a Real or Fake model class, its score breakdown, and clear limitations, while encouraging independent verification.</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <FileText className="mb-4 text-sage" size={28} />
              <h3 className="text-xl font-semibold">Secure processing</h3>
              <p className="mt-3 text-charcoal/75">Uploaded content is validated, scanned, and parsed safely on the backend without executing files.</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <Sparkles className="mb-4 text-sage" size={28} />
              <h3 className="text-xl font-semibold">Transparent model use</h3>
              <p className="mt-3 text-charcoal/75">Predictions are estimates from learned language patterns, not proof that a claim is true or false.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Common questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.slice(0, 4).map((item) => (
            <div key={item.question} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-2 text-charcoal/75">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-[#f0e7db] p-8 text-center shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">Important notice</p>
          <h3 className="mt-3 text-2xl font-bold">Prediction estimates are not definitive proof.</h3>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal/75">
            TruthLens AI supports critical reading, not unquestioned conclusions. Use the result as a signal for deeper review, not as evidence of objective truth.
          </p>
        </div>
      </section>
    </>
  );
}

function HowItWorksPage() {
  useEffect(() => {
    document.title = 'How It Works | TruthLens AI';
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">How it works</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">From article submission to responsible interpretation.</h1>
      <div className="mt-8 space-y-5 text-charcoal/80">
        <p>1. User submits a news article, headline, or uploaded document.</p>
        <p>2. The backend validates content length, file type, and readable text before preprocessing.</p>
        <p>3. A trained TF-IDF + classifier pipeline analyzes language patterns in the text.</p>
        <p>4. The system returns a prediction, a confidence estimate when appropriate, and clear limitations.</p>
        <p>5. Responsible readers can independently verify claims using reliable sources and original reporting.</p>
      </div>
      <div className="mt-10 rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">Text classification vs. source verification</h2>
        <p className="mt-4 text-charcoal/80">
          Text classification identifies patterns in a document’s wording, tone, and structure. Source verification checks whether the reporting is tied to credible sources and evidence. Fact-checking assesses a specific claim against known evidence. These are related but distinct tasks.
        </p>
      </div>
    </div>
  );
}

function AboutPage() {
  useEffect(() => {
    document.title = 'About | TruthLens AI';
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">About</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">TruthLens AI supports media literacy and thoughtful information review.</h1>
      <p className="mt-6 text-lg text-charcoal/75">
        TruthLens AI is a research-minded web platform intended to help people assess news-text patterns, understand model uncertainty, and reflect critically on what they read.
      </p>
      <p className="mt-4 text-charcoal/80">
        The tool is designed for educational, civic, and editorial contexts. It does not claim to replace journalism, fact checking, or independent source verification. It is best used as one signal among many in a broader verification workflow.
      </p>
    </div>
  );
}

function FaqPage() {
  useEffect(() => {
    document.title = 'FAQ | TruthLens AI';
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">FAQ</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Frequently asked questions</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">{item.question}</h2>
            <p className="mt-2 text-charcoal/75">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | TruthLens AI';
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">Privacy policy</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Privacy and data handling</h1>
      <div className="mt-8 space-y-5 text-charcoal/80">
        <p>The app is designed to minimize unnecessary data collection. It validates input on the server, parses uploaded files for content analysis, and does not execute uploaded files.</p>
        <p>By default, the system does not store uploaded articles or analysis history unless a separate, consent-based feature is added and clearly disclosed.</p>
        <p>Third-party services may be used for deployment and hosting, but the application does not claim legal compliance or certifications without explicit evidence.</p>
        <p>Environment variables are used for secrets and configuration. No private credentials are embedded in the application source.</p>
      </div>
    </div>
  );
}

function TermsPage() {
  useEffect(() => {
    document.title = 'Terms | TruthLens AI';
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">Terms</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Terms of use</h1>
      <div className="mt-8 space-y-5 text-charcoal/80">
        <p>TruthLens AI is an informational tool and should not be treated as a definitive fact-checking system, legal authority, or proof of truth.</p>
        <p>Users are responsible for verifying important claims using credible, independent sources. This service may be unavailable or produce inconclusive results.</p>
        <p>We maintain reasonable security controls and handle uploaded files carefully, but no system can guarantee complete safety or perfect classification performance.</p>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: PredictionResult | null }) {
  if (!result) return null;
  const statusTone = result.prediction === 'real' ? 'text-emerald-700 bg-emerald-50' : result.prediction === 'fake' ? 'text-amber-700 bg-amber-50' : 'text-slate-700 bg-slate-100';
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sage">Prediction</p>
          <h3 className="mt-2 text-3xl font-bold">{result.prediction.replace('_', ' ')}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusTone}`}>
          {result.prediction.replace('_', ' ')}
        </span>
      </div>
      {result.confidence !== null && (
        <div className="mt-5 rounded-2xl bg-[#f8f5f1] p-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-charcoal/60">Top class score (not factual certainty)</p>
          <p className="mt-2 text-2xl font-bold text-charcoal">{result.confidence.toFixed(2)}</p>
        </div>
      )}
      {result.class_probabilities && Object.keys(result.class_probabilities).length > 0 && (
        <div className="mt-4 space-y-3 rounded-2xl border border-black/5 bg-white p-4">
          <p className="text-sm font-semibold text-charcoal">Model score breakdown</p>
          {Object.entries(result.class_probabilities).map(([label, score]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-sm text-charcoal/75">
                <span>{label.replace('_', ' ')}</span>
                <span>{Math.round(score * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sand">
                <div className="h-full rounded-full bg-sage" style={{ width: `${Math.round(score * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-5 text-charcoal/80">{result.explanation}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-charcoal/75">
        {result.limitations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-charcoal/70">
        <span className="rounded-full bg-sand px-3 py-1">Model version: {result.model_version ?? 'training required'}</span>
      </div>
    </div>
  );
}

function AnalyzePage() {
  const [headline, setHeadline] = useState('');
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    document.title = 'Analyze News | TruthLens AI';
  }, []);

  useEffect(() => {
    if (location.hash !== '#article-text') return;
    const articleField = document.getElementById('article-text');
    articleField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    articleField?.focus({ preventScroll: true });
  }, [location.hash]);

  const charCount = text.length;
  const canSubmit = text.trim().length >= 80 && text.trim().length <= 20000;

  const submit = async () => {
    setError('');
    setResult(null);

    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('The selected file exceeds the 5 MB size limit.');
        return;
      }
    }

    if (!selectedFile && !text.trim()) {
      setError('Please paste article text or upload a document before analyzing.');
      return;
    }

    if (!selectedFile && !canSubmit) {
      setError('Please provide at least 80 characters and no more than 20,000 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = selectedFile ? await analyzeFile(selectedFile) : await analyzeText(headline.trim(), text);
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while analyzing the article.');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    const payload = JSON.stringify(result, null, 2);
    await navigator.clipboard.writeText(payload);
  };

  const clearAll = () => {
    setHeadline('');
    setText('');
    setSelectedFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">Analyze</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Submit content for a credibility estimate.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Paste news text</h2>
            <button type="button" onClick={clearAll} className="text-sm font-medium text-sage underline-offset-4 hover:underline">Clear</button>
          </div>

          <label className="mb-3 block text-sm font-medium text-charcoal/80">Headline (optional)</label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Example: City budget plan expands school support"
            className="mb-5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none ring-0 transition focus:border-sage"
          />

          <div className="mb-3 flex items-center justify-between text-sm text-charcoal/70">
            <label className="font-medium">Article text</label>
            <span>{charCount}/20,000</span>
          </div>
          <textarea
            id="article-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            minLength={80}
            maxLength={20000}
            rows={12}
            placeholder="Paste the article text here…"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-sage"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-[#7d8c61] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} />}
              {loading ? 'Analyzing…' : 'Analyze Article'}
            </button>
            <button type="button" onClick={() => setText('')} className="rounded-full border border-black/10 bg-white px-5 py-3 font-medium text-charcoal">Clear text</button>
          </div>

          <div className="mt-8 rounded-3xl border border-dashed border-sage/40 bg-[#f8f6f3] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sage">Upload a document</p>
                <p className="mt-2 text-sm text-charcoal/70">Accepted: .txt, .pdf, .docx</p>
              </div>
              {selectedFile && (
                <button type="button" onClick={() => setSelectedFile(null)} className="text-sm font-medium text-sage underline-offset-4 hover:underline">Remove file</button>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sage/30 bg-white p-6 text-center">
              <UploadCloud className="mb-3 text-sage" size={28} />
              <span className="font-medium">Choose a file or drag one here</span>
              <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
            </label>
            {selectedFile && (
              <div className="mt-4 rounded-2xl bg-white p-3 text-sm text-charcoal/80">
                <p className="font-medium">Selected file: {selectedFile.name}</p>
                <p>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-surface rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Result panel</h2>
            <p className="mt-2 text-sm text-charcoal/70">The model selects the higher-scoring Real or Fake class. Scores reflect learned text patterns, not factual certainty.</p>
            {result ? (
              <div className="mt-4 space-y-4">
                <ResultCard result={result} />
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={copyResult} className="rounded-full border border-black/10 bg-white px-4 py-2 font-medium text-charcoal">Copy results</button>
                  <button type="button" onClick={clearAll} className="rounded-full bg-sage px-4 py-2 font-medium text-white">Analyze another article</button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-dashed border-sage/30 bg-[#f9f7f3] p-6 text-sm text-charcoal/70">
                No analysis yet. Submit a headline and article text or upload a document to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
