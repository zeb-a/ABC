import React, { useState } from 'react';
import { ChevronLeft, Trash2, Edit2, Plus, LayoutGrid, X, Save } from 'lucide-react';
import api from '../services/api';
import InlineHelpButton from './InlineHelpButton';

const EMOJI_OPTIONS = ['⭐', '🌟', '✨', '👏', '🎉', '🔥', '💪', '🤩', '😔', '👎', '😤', '⚠️', '❌', '🙅', '😠'];

export default function SettingsPage({ activeClass, behaviors, onBack, onUpdateBehaviors }) {
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'students' | 'general'
  const [cards, setCards] = useState(Array.isArray(behaviors) ? behaviors : []);
  const [, setSidebarCollapsed] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCard, setEditingCard] = useState({ label: '', pts: 0, icon: '⭐', type: 'wow' });
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

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
        <div style={styles.headerLeft} onClick={handleBackClick}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0 }}>Settings: {activeClass.name}</h2>
            <InlineHelpButton pageId="settings" />
          </div>
        </div>
        <button style={styles.doneBtn} onClick={handleBackClick}> <X size={24} /></button>
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
              <div style={styles.sectionHeader}>
                <h3>Behavior Point Cards</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    style={styles.addBtnModern}
                    onClick={() => {
                      const newCard = { id: Date.now(), label: 'New Card', pts: 1, type: 'wow', icon: '⭐' };
                      const updated = [newCard, ...cards];
                      setCards(updated);
                      setEditingCardId(newCard.id);
                      setEditingCard({ label: newCard.label, pts: newCard.pts, icon: newCard.icon, type: newCard.type });
                    }}
                  ><Plus size={18}/> Add Card</button>
                  <button
                    style={{...styles.addBtnModern, background: '#FF7675'}}
                    onClick={async () => {
                      const INITIAL_BEHAVIORS = [
                        { id: 1, label: 'Helped Friend', pts: 1, type: 'wow', icon: '🤝' },
                        { id: 2, label: 'Great Work', pts: 2, type: 'wow', icon: '🌟' },
                        { id: 3, label: 'On Task', pts: 1, type: 'wow', icon: '📖' },
                        { id: 4, label: 'Kindness', pts: 1, type: 'wow', icon: '❤️' },
                        { id: 5, label: 'Noisy', pts: -1, type: 'nono', icon: '📢' },
                        { id: 6, label: 'Disruptive', pts: -2, type: 'nono', icon: '⚠️' }
                      ];
                      
                      // Delete all "New Card" entries from backend
                      try {
                        await api.deleteNewCards();
                        // ...existing code...
                      } catch (e) {
                        console.warn('Failed to delete "New Card" entries:', e.message);
                      }
                      
                      setCards(INITIAL_BEHAVIORS);
                      onUpdateBehaviors && onUpdateBehaviors(INITIAL_BEHAVIORS);
                      setEditingCardId(null);
                    }}
                  >Reset to Defaults</button>
                </div>
              </div>
              <div style={styles.cardList}>
                {cards.map(card => (
                  <div key={card.id} style={styles.settingItem}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemIcon}>{card.icon}</span>
                      <div>
                        {editingCardId === card.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 420 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E1', fontSize: 28 }}>{editingCard.icon}</div>
                              <button onClick={() => setIsEmojiPickerOpen(s => !s)} style={{ ...styles.iconBtn, padding: '6px 10px', fontSize: 16 }}>Change</button>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <input
                                value={editingCard.label}
                                onChange={(e) => setEditingCard(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="Card label"
                                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #E6EEF8', fontSize: 16 }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: 6, borderRadius: 12, border: '1px solid #EEF2FF' }}>
                                  <button onClick={() => { const pts = Number(editingCard.pts) - 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={{ ...styles.iconBtn, padding: '6px 8px' }}>-</button>
                                  <div style={{ minWidth: 72, textAlign: 'center', fontSize: 18, fontWeight: 800 }}>{editingCard.pts}</div>
                                  <button onClick={() => { const pts = Number(editingCard.pts) + 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={{ ...styles.iconBtn, padding: '6px 8px' }}>+</button>
                                </div>
                                <div style={{ color: editingCard.pts > 0 ? '#16A34A' : '#DC2626', fontWeight: 700 }}>{editingCard.pts > 0 ? 'WOW' : 'NONO'}</div>
                              </div>
                              {isEmojiPickerOpen && (
                                <div style={styles.emojiGrid}>
                                  {EMOJI_OPTIONS.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        setEditingCard(prev => ({ ...prev, icon: emoji }));
                                        setIsEmojiPickerOpen(false);
                                      }}
                                      style={{
                                        ...styles.emojiBtn,
                                        background: editingCard.icon === emoji ? '#E8F5E9' : 'transparent',
                                        fontSize: 20
                                      }}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
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
                        <>
                          <button onClick={() => handleSaveCard(card.id)} style={{ ...styles.saveBtn, padding: '10px 16px', marginRight: 8 }}>Save</button>
                          <button onClick={() => setEditingCardId(null)} style={{ ...styles.cancelBtn, padding: '10px 14px', marginRight: 8 }}>Cancel</button>
                          <button onClick={() => { handleDeleteCard(card.id); setEditingCardId(null); }} style={{ ...styles.deleteConfirmBtn, padding: '10px 14px' }}>Delete</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingCardId(card.id); setEditingCard({ label: card.label, pts: card.pts, icon: card.icon, type: card.type }); }} style={{ ...styles.actionIcon, background: 'transparent', border: 'none', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteCard(card.id)} style={{ ...styles.actionIcon, color: '#FF7675', background: 'transparent', border: 'none', cursor: 'pointer' }}>Delete</button>
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
  hoverIcons: { position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 },
  // small circular icon button used in the modern controls
  iconBtn: { background: 'white', border: '1px solid #EEF2FF', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#2563EB', fontWeight: 700 },
  editOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  editModal: { background: 'white', padding: '30px', borderRadius: '24px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  editModalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { padding: '15px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};