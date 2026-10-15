import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Analyze News', to: '/analyze' },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-base font-bold text-white shadow-sm">
              TL
            </div>
            <span>TruthLens AI</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-sage' : 'text-charcoal/75 hover:text-charcoal'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/analyze#article-text"
            className="inline-flex items-center gap-2 rounded-full bg-sage px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#7d8c61]"
          >
            Analyze News
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-black/5 bg-[#f1ebdf]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-3 font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-white">TL</div>
              TruthLens AI
            </div>
            <p className="text-sm text-charcoal/70">
              A media-literacy tool that classifies news-language patterns as Real or Fake and encourages independent verification.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm text-charcoal/80">
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-charcoal/80">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/analyze">Analyze News</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Responsible AI</h3>
            <div className="space-y-2 text-sm text-charcoal/80">
              <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 text-sage" size={16} /> Model score transparency</div>
              <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 text-sage" size={16} /> Secure document parsing</div>
              <div className="flex items-start gap-2"><FileText className="mt-0.5 text-sage" size={16} /> Human verification encouraged</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
