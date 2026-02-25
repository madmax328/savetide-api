'use client';

import { useLocale } from '../../lib/LocaleProvider';
import { LangSwitcher } from '../../lib/LangSwitcher';

const h2Style = { fontSize: 20, fontWeight: 700 as const, margin: '32px 0 12px', color: '#0f172a' };

export default function ExtensionPrivacy() {
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
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#0f172a' }}>
          {t('privacy.title')}
        </h1>
        <p style={{ fontSize: 16, color: '#0ea5e9', fontWeight: 600, marginBottom: 8 }}>
          {t('ext.subtitle')}
        </p>
        <p style={{ color: '#64748b', marginBottom: 32 }}>
          {t('ext.updated')}
        </p>

        <h2 style={h2Style}>{t('ext.s1.title')}</h2>
        <p>{t('ext.s1.desc')}</p>

        <h2 style={h2Style}>{t('ext.s2.title')}</h2>
        <p>{t('ext.s2.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            <strong>{t('ext.s2.l1.strong')}</strong>
            {t('ext.s2.l1.desc')}
          </li>
          <li>
            <strong>{t('ext.s2.l2.strong')}</strong>
            {t('ext.s2.l2.desc')}
          </li>
        </ul>

        <h2 style={h2Style}>{t('ext.s3.title')}</h2>
        <p>{t('ext.s3.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>{t('ext.s3.l1')}</li>
          <li>{t('ext.s3.l2')}</li>
          <li>{t('ext.s3.l3')}</li>
          <li>{t('ext.s3.l4')}</li>
        </ul>

        <h2 style={h2Style}>{t('ext.s4.title')}</h2>
        <p>{t('ext.s4.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>{t('ext.s4.l1')}</li>
          <li>{t('ext.s4.l2')}</li>
          <li>{t('ext.s4.l3')}</li>
        </ul>

        <h2 style={h2Style}>{t('ext.s5.title')}</h2>
        <p><strong>{t('ext.s5.bold')}</strong></p>
        <p>{t('ext.s5.desc')}</p>

        <h2 style={h2Style}>{t('ext.s6.title')}</h2>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            <strong>{t('ext.s6.l1.strong')}</strong>
            {t('ext.s6.l1.desc')}
          </li>
          <li>
            <strong>{t('ext.s6.l2.strong')}</strong>
            {t('ext.s6.l2.desc')}
          </li>
        </ul>

        <h2 style={h2Style}>{t('ext.s7.title')}</h2>
        <p>{t('ext.s7.desc')}</p>

        <h2 style={h2Style}>{t('ext.s8.title')}</h2>
        <p>{t('ext.s8.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>{t('ext.s8.l1')}</li>
          <li>{t('ext.s8.l2')}</li>
          <li>{t('ext.s8.l3')}</li>
        </ul>

        <h2 style={h2Style}>{t('ext.s9.title')}</h2>
        <p>{t('ext.s9.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            <strong>SerpAPI</strong>
            {t('ext.s9.l1')}
          </li>
          <li>
            <strong>Railway.app</strong>
            {t('ext.s9.l2')}
          </li>
        </ul>

        <h2 style={h2Style}>{t('ext.s10.title')}</h2>
        <p>{t('ext.s10.desc')}</p>

        <h2 style={h2Style}>{t('ext.s11.title')}</h2>
        <p>{t('ext.s11.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            Email :{' '}
            <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
              contact@savetide.com
            </a>
          </li>
        </ul>

        <h2 style={h2Style}>{t('ext.s12.title')}</h2>
        <p>{t('ext.s12.desc')}</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>{t('ext.s12.l1')}</li>
          <li>{t('ext.s12.l2')}</li>
          <li>{t('ext.s12.l3')}</li>
        </ul>

        <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
        <p style={{ textAlign: 'center' as const, color: '#64748b', fontSize: 14 }}>
          &copy; 2026 {t('ext.copyright')}
        </p>
      </main>
    </>
  );
}
