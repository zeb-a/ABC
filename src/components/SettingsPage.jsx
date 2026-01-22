import React, { useState } from 'react';
import { Edit2, Plus, X, RefreshCw, Trash2, Save } from 'lucide-react';
import api from '../services/api';
import InlineHelpButton from './InlineHelpButton';

const EMOJI_OPTIONS = [
  '⭐','🌟','✨','👏','🎉','🔥','💪','🤩','😊','😄','🙂','😍','😎','🤝','📚',
  '📖','🏅','🥇','👍','👎','⚠️','❌','✅','❤️','💛','💚','💙','🧡','🤍','🧠','📝',
  '🎯','🏆','🚀','🎒','🧩','🔔','📣','📢','🍎','🍪','⚽','🏀','🎵',
  '😇','🤗','🤔','😅','😜','🦄','🌈','🍓','🍉','🥳','🤖','👑','💡','🔆','🧸','🛡️',
  '🎖️','📎','🧪','⚡','🌱','🌻','🍀','🍁','🌊','🌙','☀️','🕶️','🎨','📌','🧭','🔭'
];

export default function SettingsPage({ activeClass, behaviors, onBack, onUpdateBehaviors }) {
  const [activeTab] = useState('cards'); // 'cards' | 'students' | 'general'
  const [cards, setCards] = useState(Array.isArray(behaviors) ? behaviors : []);
  const [, setSidebarCollapsed] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCard, setEditingCard] = useState({ label: '', pts: 0, icon: '⭐', type: 'wow' });
  const [openEmojiFor, setOpenEmojiFor] = useState(null);

  React.useEffect(() => setCards(Array.isArray(behaviors) ? behaviors : []), [behaviors]);

  // Auto-collapse sidebar on small screens
  React.useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 720);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to reload behaviors from backend with class id
  const reloadBehaviors = async () => {
    if (!activeClass?.id) return;
    try {
      const latest = await api.getBehaviors(activeClass.id);
      setCards(Array.isArray(latest) ? latest : []);
    } catch (e) {
      console.warn('Failed to reload behaviors:', e.message);
    }
  };

  const persistBehaviors = async (updated) => {
    setCards(updated);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    try { await api.saveBehaviors(activeClass?.id, updated); } catch (e) { console.warn('saveBehaviors failed', e.message); }
  };

  // Inject mobile-friendly overrides for Settings page
  React.useEffect(() => {
    const style = document.createElement('style');
    style.id = 'settings-mobile-styles';
    style.innerHTML = `@media (max-width:720px){ .settings-page-root header { padding: 12px 16px !important; } .settings-page-root main { padding: 16px !important; } .settings-page-root aside { display: none !important; } .settings-page-root .sidebar-collapsed { display: flex !important; width: 64px !important; } }`;
    document.head.appendChild(style);
    return () => { const el = document.getElementById('settings-mobile-styles'); if (el) el.remove(); };
  }, []);

  // SettingsPage.jsx
// Optimistic close: close UI immediately, save in background
const handleBackClick = () => {
  try {
    // Close the settings UI immediately for a snappy experience
    onBack();
    // Persist changes in the background. Log failures but do not block UI.
    api.saveBehaviors(activeClass?.id, cards).catch(err => {
      console.error('Failed to persist behavior cards (background):', err);
    });
  } catch (err) {
    console.error('Error closing settings:', err);
    onBack();
  }
};
  const handleSaveCard = (id) => {
    const pts = Number(editingCard.pts);
    const type = pts > 0 ? 'wow' : 'nono';
    const updated = cards.map(c => c.id === id ? { 
      ...c, 
      label: editingCard.label, 
      pts: pts,
      icon: editingCard.icon,
      type: type
    } : c);
    setCards(updated);
    setEditingCardId(null);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    // Save to backend with class id
    api.saveBehaviors(activeClass.id, updated).then(reloadBehaviors);
  };

  const handleDeleteCard = (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    api.saveBehaviors(activeClass.id, updated).then(reloadBehaviors);
  };

  return (
    <div className="settings-page-root" style={styles.pageContainer}>
      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            title="Add card"
            onClick={() => {
              const newCard = { id: Date.now(), label: 'New Card', pts: 1, type: 'wow', icon: '⭐' };
              const updated = [newCard, ...cards];
              setCards(updated);
              setEditingCardId(newCard.id);
              setEditingCard({ label: newCard.label, pts: newCard.pts, icon: newCard.icon, type: newCard.type });
            }}
            style={{ ...styles.iconBtn, padding: 10 }}
            aria-label="Add card"
          ><Plus size={18} /></button>
          <button
            title="Reset behaviors"
            onClick={async () => {
              const INITIAL_BEHAVIORS = [
                { id: 1, label: 'Helped Friend', pts: 1, type: 'wow', icon: '🤝' },
                { id: 2, label: 'Great Work', pts: 2, type: 'wow', icon: '🌟' },
                { id: 3, label: 'On Task', pts: 1, type: 'wow', icon: '📖' },
                { id: 4, label: 'Kindness', pts: 1, type: 'wow', icon: '❤️' },
                { id: 5, label: 'Noisy', pts: -1, type: 'nono', icon: '📢' },
                { id: 6, label: 'Disruptive', pts: -2, type: 'nono', icon: '⚠️' }
              ];
              try {
                await api.deleteNewCards();
              } catch (e) {
                console.warn('Failed to delete "New Card" entries:', e.message);
              }
              setCards(INITIAL_BEHAVIORS);
              onUpdateBehaviors && onUpdateBehaviors(INITIAL_BEHAVIORS);
              setEditingCardId(null);
            }}
            style={{ ...styles.iconBtn, padding: 10 }}
            aria-label="Reset behaviors"
          ><RefreshCw size={18} /></button>
          <button style={styles.doneBtn} onClick={handleBackClick}><X size={18} /></button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* Settings Sidebar */}
        {/* <aside style={{ ...styles.sidebar, width: sidebarCollapsed ? '84px' : styles.sidebar.width }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong style={{ display: sidebarCollapsed ? 'none' : 'block' }}>{activeClass?.name}</strong>
            </div>
            <button onClick={() => setSidebarCollapsed(s => !s)} style={styles.iconBtn} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
              {sidebarCollapsed ? <ChevronLeft size={18} /> : <LayoutGrid size={16} />}
            </button>
          </div>
          <button 
            onClick={() => setActiveTab('cards')} 
            style={activeTab === 'cards' ? styles.tabActive : styles.tab}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LayoutGrid size={20} />
              {!sidebarCollapsed && <span>Behavior Cards</span>}
            </div>
          </button>
        </aside> */}

        {/* Dynamic Content Area */}
        <main style={styles.content}>
          {activeTab === 'cards' ? (
            <section>
         
              <div style={styles.cardList}>
                {cards.map(card => (
                  <div key={card.id} style={styles.settingItem}>
                    <div style={styles.itemInfo}>
                      <div style={{ position: 'relative' }}>
                        {/* Only allow opening emoji picker when editing this card */}
                        <button
                          onClick={() => {
                            if (editingCardId === card.id) {
                              setOpenEmojiFor(openEmojiFor === card.id ? null : card.id);
                            }
                          }}
                          style={{ ...styles.iconBtn, width: 44, height: 44, fontSize: 20 }}
                          aria-label="Pick emoji"
                        >
                          {editingCardId === card.id ? (editingCard.icon) : (card.icon)}
                        </button>
                        {openEmojiFor === card.id && (
                          <div style={styles.centerEmojiModal} onClick={e => e.stopPropagation()}>
                            <div style={styles.centerEmojiGrid}>
                              {EMOJI_OPTIONS.map(em => (
                                <button key={em} onClick={() => {
                                  if (editingCardId === card.id) {
                                    setEditingCard(prev => ({ ...prev, icon: em }));
                                  } else {
                                    const updated = cards.map(c => c.id === card.id ? { ...c, icon: em } : c);
                                    persistBehaviors(updated);
                                  }
                                  setOpenEmojiFor(null);
                                }} style={{ ...styles.emojiBtn, padding: 8, fontSize: 20 }}>{em}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                          {editingCardId === card.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                  {/* Remove large avatar in edit view; left avatar opens picker */}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                value={editingCard.label}
                                onChange={(e) => setEditingCard(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="Card label"
                                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #E6EEF8', fontSize: 15, flex: '1 1 140px', minWidth: 120 }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button onClick={() => { const pts = Number(editingCard.pts) - 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={styles.smallIconBtn} aria-label="Decrease">-</button>
                                <div style={{ minWidth: 36, textAlign: 'center', fontWeight: 800 }}>{editingCard.pts}</div>
                                <button onClick={() => { const pts = Number(editingCard.pts) + 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={styles.smallIconBtn} aria-label="Increase">+</button>
                              </div>
                              {/* Emoji grid inside edit area removed to avoid duplicate menus. Left avatar opens a single compact picker. */}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={styles.itemLabel}>{card.label}</div>
                            <div style={{ color: card.pts > 0 ? '#4CAF50' : '#F44336', fontSize: '14px' }}>
                              {card.pts > 0 ? '+' : ''}{card.pts} Points ({card.type === 'wow' ? 'WOW' : 'NONO'})
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.itemActions}>
                      {editingCardId === card.id ? (
                        <div style={styles.verticalActionStack}>
                          <button onClick={() => handleSaveCard(card.id)} style={styles.saveIconBtn} aria-label="Save"><Save size={18} /></button>
                          <button onClick={() => setEditingCardId(null)} style={styles.cancelIconBtn} aria-label="Cancel"><X size={18} /></button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setEditingCardId(card.id); setEditingCard({ label: card.label, pts: card.pts, icon: card.icon, type: card.type }); }} style={styles.iconOnlyBtn} aria-label="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteCard(card.id)} style={styles.iconOnlyBtn} aria-label="Delete"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { height: '100vh', display: 'flex', flexDirection: 'column',overflowY: 'auto', background: '#F8FAFC', position: 'relative' },
  header: { padding: '15px 30px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' },
  doneBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  mainLayout: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '260px', background: '#fff', borderRight: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  tab: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'transparent', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#64748B' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: '#E8F5E9', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#2E7D32', fontWeight: 'bold' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  addBtn: { background: '#f0f0f0', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  addBtnModern: { background: 'linear-gradient(90deg,#4CAF50,#2E7D32)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(46,125,50,0.12)', fontWeight: 800 },
  cardList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  settingItem: { background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
  itemIcon: { fontSize: '24px' },
  itemLabel: { fontWeight: 'bold', fontSize: '1.1rem' },
  miniAvatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5' },
  itemActions: { display: 'flex', gap: '20px' },
  actionIcon: { cursor: 'pointer', color: '#94A3B8' },
  emojiPickerBtn: { background: '#fff', border: '1px solid #E6EEF8', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginTop: 8, padding: '10px', background: 'rgba(255,255,255,0.9)', borderRadius: '12px', boxShadow: '0 8px 30px rgba(2,6,23,0.08)' },
  emojiBtn: { fontSize: '20px', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', background: 'transparent' },
  // compact grid picker that appears in a centered top overlay
  verticalEmojiGrid: { position: 'absolute', left: -140, top: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: 8, background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(2,6,23,0.12)', zIndex: 2500 },
  centerEmojiModal: { position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 3500, display: 'flex', justifyContent: 'center', width: 'min(760px, 90%)', pointerEvents: 'auto' },
  centerEmojiGrid: { width: '100%', background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 20px 60px rgba(2,6,23,0.12)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(44px, 1fr))', gap: 8, justifyItems: 'center', alignItems: 'center' },
  verticalActionStack: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' },
  hoverIcons: { position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 },
  // small circular icon button used in the modern controls
  iconBtn: { background: 'white', border: '1px solid #EEF2FF', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#2563EB', fontWeight: 700 },
  compactBtn: { padding: 8, borderRadius: 8, border: '1px solid #E6EEF8', background: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  compactDelete: { padding: 8, borderRadius: 8, border: '1px solid #ffd6d6', background: 'white', color: '#FF6B6B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  iconOnlyBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  smallIconBtn: { padding: '6px 8px', borderRadius: 8, border: '1px solid #EEF2FF', background: 'white', cursor: 'pointer' },
  saveActionBtn: { padding: '8px 12px', borderRadius: '10px', background: '#2E7D32', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' },
  cancelActionBtn: { padding: '8px 12px', borderRadius: '10px', background: 'transparent', color: '#333', border: '1px solid #E6EEF8', fontWeight: 700, cursor: 'pointer', marginLeft: 8 },
  saveIconBtn: { width: 44, height: 44, padding: 8, borderRadius: 12, background: '#2E7D32', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  cancelIconBtn: { width: 44, height: 44, padding: 8, borderRadius: 12, background: 'transparent', color: '#333', border: '1px solid #E6EEF8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' , marginLeft: 0 },
  editOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  editModal: { background: 'white', padding: '30px', borderRadius: '24px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  editModalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { padding: '15px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};