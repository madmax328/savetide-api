'use client';

import { useLocale } from '../lib/LocaleProvider';
import { LangSwitcher } from '../lib/LangSwitcher';

const h2Style = { fontSize: 20, fontWeight: 700 as const, margin: '32px 0 12px', color: '#0f172a' };

export default function MentionsLegales() {
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
          {t('mentions.title')}
        </h1>

        <h2 style={h2Style}>{t('mentions.s1.title')}</h2>
        <p>
          SaveTide
          <br />
          {t('mentions.s1.website')}{' '}
          <a href="https://savetide.com" style={{ color: '#0ea5e9' }}>
            savetide.com
          </a>
          <br />
          Email :{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
        </p>

        <h2 style={h2Style}>{t('mentions.s2.title')}</h2>
        <p>
          {t('mentions.s2.desc')}
          <br />
          Vercel Inc.
          <br />
          440 N Bashaw St, Covina, CA 91723, USA
          <br />
          <a href="https://vercel.com" style={{ color: '#0ea5e9' }}>
            vercel.com
          </a>
        </p>

        <h2 style={h2Style}>{t('mentions.s3.title')}</h2>
        <p>{t('mentions.s3.desc')}</p>

        <h2 style={h2Style}>{t('mentions.s4.title')}</h2>
        <p>{t('mentions.s4.desc')}</p>

        <h2 style={h2Style}>{t('mentions.s5.title')}</h2>
        <p>
          {t('mentions.s5.desc')}{' '}
          <a href="/privacy" style={{ color: '#0ea5e9' }}>
            {t('footer.privacy')}
          </a>
          .
        </p>
      </main>
    </>
  );
}
