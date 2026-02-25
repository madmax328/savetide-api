'use client';

import { useLocale } from './lib/LocaleProvider';
import { LangSwitcher } from './lib/LangSwitcher';

const MERCHANTS_FR = [
  'Amazon', 'Fnac', 'Cdiscount', 'Darty', 'Boulanger',
  'Rakuten', 'E.Leclerc', 'Carrefour', 'eBay', 'Back Market',
];
const MERCHANTS_EN = [
  'Amazon', 'Walmart', 'Best Buy', 'Target', 'Newegg',
  'Costco', 'Home Depot', 'eBay', 'Back Market', 'B&H Photo',
];
const HERO_STORES_FR = ['Amazon', 'Fnac', 'Cdiscount', 'Darty', 'Boulanger', 'Rakuten', 'eBay'];
const HERO_STORES_EN = ['Amazon', 'Walmart', 'Best Buy', 'Target', 'eBay', 'Newegg', 'Costco'];

export default function Home() {
  const { t, locale } = useLocale();
  const merchants = locale === 'fr' ? MERCHANTS_FR : MERCHANTS_EN;
  const heroStores = locale === 'fr' ? HERO_STORES_FR : HERO_STORES_EN;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="nav-logo">
            Save<span>Tide</span>
          </a>

          <div className="nav-links">
            <a href="#features">{t('nav.features')}</a>
            <a href="#how-it-works">{t('nav.howItWorks')}</a>
            <a href="#merchants">{t('merchants.tag')}</a>
            <LangSwitcher />
            <a href="#download" className="nav-cta">
              {t('nav.download')}
            </a>
          </div>

          <button className="mobile-menu-btn" aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="dot" />
            {t('hero.badge')}
          </div>

          <h1>
            {t('hero.title.before')}
            <span className="highlight">{t('hero.title.highlight')}</span>
            {t('hero.title.after')}
          </h1>

          <p className="hero-desc">{t('hero.desc')}</p>

          <div className="hero-buttons">
            <a href="#download" className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {t('hero.cta')}
            </a>
            <a href="#features" className="btn-secondary">
              {t('hero.learnMore')}
            </a>
          </div>

          <div className="hero-stores">
            <p>{t('hero.compareOn')}</p>
            <div className="store-logos">
              {heroStores.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">{t('features.tag')}</span>
            <h2>{t('features.title')}</h2>
            <p>{t('features.desc')}</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#dbeafe' }}>
                <span role="img" aria-label="scan">
                  {'📱'}
                </span>
              </div>
              <h3>{t('features.scan.title')}</h3>
              <p>{t('features.scan.desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#fef3c7' }}>
                <span role="img" aria-label="search">
                  {'🔍'}
                </span>
              </div>
              <h3>{t('features.search.title')}</h3>
              <p>{t('features.search.desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#d1fae5' }}>
                <span role="img" aria-label="chart">
                  {'📊'}
                </span>
              </div>
              <h3>{t('features.history.title')}</h3>
              <p>{t('features.history.desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#fce7f3' }}>
                <span role="img" aria-label="bell">
                  {'🔔'}
                </span>
              </div>
              <h3>{t('features.alerts.title')}</h3>
              <p>{t('features.alerts.desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#ede9fe' }}>
                <span role="img" aria-label="globe">
                  {'🌍'}
                </span>
              </div>
              <h3>{t('features.multi.title')}</h3>
              <p>{t('features.multi.desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#e0f2fe' }}>
                <span role="img" aria-label="gift">
                  {'🎁'}
                </span>
              </div>
              <h3>{t('features.free.title')}</h3>
              <p>{t('features.free.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">{t('how.tag')}</span>
            <h2>{t('how.title')}</h2>
            <p>{t('how.desc')}</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{t('how.step1.title')}</h3>
              <p>{t('how.step1.desc')}</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>{t('how.step2.title')}</h3>
              <p>{t('how.step2.desc')}</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>{t('how.step3.title')}</h3>
              <p>{t('how.step3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Merchants */}
      <section className="merchants" id="merchants">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">{t('merchants.tag')}</span>
            <h2>{t('merchants.title')}</h2>
            <p>{t('merchants.desc')}</p>
          </div>

          <div className="merchants-grid">
            {merchants.map((name) => (
              <div key={name} className="merchant-card">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Download */}
      <section className="cta-section" id="download">
        <h2>{t('cta.title')}</h2>
        <p>{t('cta.desc')}</p>
        <div className="cta-buttons">
          <a
            href="https://testflight.apple.com/join/KAJTdfCK"
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
          >
            <span className="store-icon">{'🍎'}</span>
            <span className="store-label">
              <small>{t('cta.ios')}</small>
              TestFlight
            </span>
          </a>
          <button className="store-button store-button-disabled" disabled>
            <span className="store-icon">{'▶️'}</span>
            <span className="store-label">
              <small>{t('cta.android.soon')}</small>
              Google Play
            </span>
          </button>
        </div>
        <p className="download-note">{t('cta.note')}</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              Save<span>Tide</span>
            </a>
            <p>{t('footer.desc')}</p>
          </div>

          <div className="footer-col">
            <h4>{t('footer.product')}</h4>
            <a href="#features">{t('nav.features')}</a>
            <a href="#how-it-works">{t('nav.howItWorks')}</a>
            <a href="#merchants">{t('merchants.tag')}</a>
            <a href="#download">{t('nav.download')}</a>
          </div>

          <div className="footer-col">
            <h4>{t('footer.legal')}</h4>
            <a href="/privacy">{t('footer.privacy')}</a>
            <a href="/terms">{t('footer.terms')}</a>
            <a href="/mentions">{t('footer.mentions')}</a>
          </div>

          <div className="footer-col">
            <h4>{t('footer.contact')}</h4>
            <a href="mailto:contact@savetide.com">contact@savetide.com</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} SaveTide. {t('footer.rights')}</span>
          <a href="/privacy">{t('footer.privacyShort')}</a>
        </div>
      </footer>
    </>
  );
}
