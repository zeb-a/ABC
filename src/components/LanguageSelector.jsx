import React from 'react';
import { useTranslation } from '../i18n';

export default function LanguageSelector() {
  const { lang, setLang } = useTranslation();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={() => setLang('en')}
        style={{
          padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: lang === 'en' ? '#EEF2FF' : 'transparent', color: lang === 'en' ? '#4F46E5' : '#64748B', fontWeight: 700
        }}
        title="English"
      >EN</button>
      <button
        onClick={() => setLang('zh')}
        style={{
          padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: lang === 'zh' ? '#FEF3F2' : 'transparent', color: lang === 'zh' ? '#B91C1C' : '#64748B', fontWeight: 700
        }}
        title="中文"
      >中文</button>
    </div>
  );
}
