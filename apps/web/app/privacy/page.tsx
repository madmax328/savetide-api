'use client';

import { useLocale } from '../lib/LocaleProvider';
import { LangSwitcher } from '../lib/LangSwitcher';

const h2Style = { fontSize: 20, fontWeight: 700 as const, margin: '32px 0 12px', color: '#0f172a' };

export default function Privacy() {
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
          {t('privacy.title')}
        </h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>
          {t('privacy.updated')}
        </p>

        <h2 style={h2Style}>{t('privacy.s1.title')}</h2>
        <p>{t('privacy.s1.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>{t('privacy.s1.l1')}</li>
          <li>{t('privacy.s1.l2')}</li>
          <li>{t('privacy.s1.l3')}</li>
          <li>{t('privacy.s1.l4')}</li>
        </ul>

        <h2 style={h2Style}>{t('privacy.s2.title')}</h2>
        <p>{t('privacy.s2.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>{t('privacy.s2.l1')}</li>
          <li>{t('privacy.s2.l2')}</li>
          <li>{t('privacy.s2.l3')}</li>
        </ul>
        <p>{t('privacy.s2.noSell')}</p>

        <h2 style={h2Style}>{t('privacy.s3.title')}</h2>
        <p>{t('privacy.s3.desc')}</p>

        <h2 style={h2Style}>{t('privacy.s4.title')}</h2>
        <p>{t('privacy.s4.desc')}</p>

        <h2 style={h2Style}>{t('privacy.s5.title')}</h2>
        <p>{t('privacy.s5.desc')}</p>

        <h2 style={h2Style}>{t('privacy.s6.title')}</h2>
        <p>
          {t('privacy.s6.desc')}{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
          .
        </p>

        <h2 style={h2Style}>{t('privacy.s7.title')}</h2>
        <p>
          {t('privacy.s7.desc')}
          <br />
          Email :{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
        </p>
      </main>
    </>
  );
}
