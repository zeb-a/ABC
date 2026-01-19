import React from 'react';
import { createPortal } from 'react-dom';
import Markdown from 'react-markdown';
import { X } from 'lucide-react';
import HELP_GUIDES from '../help_guides';
import { useTranslation } from '../i18n';

export default function InlineHelpModal({ pageId, onClose }) {
  const { lang } = useTranslation();
  const entry = (HELP_GUIDES && HELP_GUIDES[lang] && HELP_GUIDES[lang][pageId]) || (HELP_GUIDES && HELP_GUIDES['en'] && HELP_GUIDES['en'][pageId]) || { title: 'Help', body: 'No help available for this page.' };

  const node = (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>Help</div>
            <h2 style={styles.title}>{entry.title}</h2>
          </div>
          <button onClick={onClose} style={styles.close}><X size={18} /></button>
        </div>
        <div style={styles.content}>
          <Markdown>{entry.body}</Markdown>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') return createPortal(node, document.body);
  return node;
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 24 },
  modal: { width: '640px', maxWidth: '96%', background: '#ffffff', borderRadius: 20, padding: 22, boxShadow: '0 30px 80px rgba(2,6,23,0.35)', border: '1px solid rgba(15,23,42,0.04)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  badge: { background: '#EEF2FF', color: '#4F46E5', padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, marginBottom: 6 },
  title: { margin: 0, fontSize: 20, color: '#0F172A' },
  close: { border: 'none', background: '#F1F5F9', padding: 8, borderRadius: 10, cursor: 'pointer', boxShadow: '0 6px 18px rgba(2,6,23,0.06)' },
  content: { maxHeight: '60vh', overflowY: 'auto', color: '#475569', lineHeight: 1.65, fontSize: 15 }
};
