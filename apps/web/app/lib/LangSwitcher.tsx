'use client';

import { useLocale } from './LocaleProvider';

export function LangSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
      style={{
        background: 'none',
        border: '1px solid #e2e8f0',
        borderRadius: 9999,
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 600,
        color: '#64748b',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'border-color 0.2s, color 0.2s',
      }}
      aria-label="Switch language"
    >
      {locale === 'fr' ? '🇫🇷 FR' : '🇺🇸 EN'}
    </button>
  );
}
