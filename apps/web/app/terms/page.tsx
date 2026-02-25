'use client';

import { useLocale } from '../lib/LocaleProvider';
import { LangSwitcher } from '../lib/LangSwitcher';

const h2Style = { fontSize: 20, fontWeight: 700 as const, margin: '32px 0 12px', color: '#0f172a' };

export default function Terms() {
  const { t } = useLocale();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="nav-logo">
            Save<span>Tide</span>
          </a>
          <div className="nav-links">
            <a href="/#features">{t('nav.features')}</a>
            <LangSwitcher />
            <a href="/#download" className="nav-cta">
              {t('nav.download')}
            </a>
          </div>
        </div>
      </nav>

      <main
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '120px 24px 80px',
          lineHeight: 1.8,
          color: '#334155',
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, color: '#0f172a' }}>
          {t('terms.title')}
        </h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>
          {t('terms.updated')}
        </p>

        <h2 style={h2Style}>{t('terms.s1.title')}</h2>
        <p>{t('terms.s1.desc')}</p>

        <h2 style={h2Style}>{t('terms.s2.title')}</h2>
        <p>{t('terms.s2.desc')}</p>

        <h2 style={h2Style}>{t('terms.s3.title')}</h2>
        <p>{t('terms.s3.desc')}</p>

        <h2 style={h2Style}>{t('terms.s4.title')}</h2>
        <p>{t('terms.s4.desc')}</p>

        <h2 style={h2Style}>{t('terms.s5.title')}</h2>
        <p>{t('terms.s5.desc')}</p>

        <h2 style={h2Style}>{t('terms.s6.title')}</h2>
        <p>{t('terms.s6.desc')}</p>

        <h2 style={h2Style}>{t('terms.s7.title')}</h2>
        <p>{t('terms.s7.desc')}</p>

        <h2 style={h2Style}>{t('terms.s8.title')}</h2>
        <p>
          {t('terms.s8.desc')}{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
        </p>
      </main>
    </>
  );
}
