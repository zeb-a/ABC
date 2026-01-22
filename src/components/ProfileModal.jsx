import React, { useState } from 'react';
import { boringAvatar, fallbackInitialsDataUrl, AVATAR_OPTIONS } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';

export default function ProfileModal({ user, onSave, onClose }) {
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || boringAvatar(user.name || user.email));
  // If the avatar is a boringAvatar SVG string, try to match to a preset name
  function getInitialSelectedAvatar() {
    if (!user.avatar) return '';
    for (const opt of AVATAR_OPTIONS) {
      if (user.avatar === boringAvatar(opt.name)) return opt.name;
    }
    return '';
  }
  const [selectedAvatar, setSelectedAvatar] = useState(getInitialSelectedAvatar());
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (password && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      let avatarToSave = avatar;
      // If a preset avatar is selected, use it
      if (selectedAvatar) {
        avatarToSave = boringAvatar(selectedAvatar);
      }
      // Pass the user id explicitly so the API knows who to update
      await onSave({ id: user.id, name, avatar: avatarToSave, password, oldPassword });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Warn if file is too large (avatar images should be small)
    if (file.size > 1024 * 1024) {
      setError('Image is too large. Please choose a smaller image (under 1MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setSelectedAvatar(''); // clear preset selection if uploading
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Edit Profile</h2>
        <button onClick={onClose} style={styles.closeBtn}>×</button>
        <form onSubmit={handleSave} style={styles.form}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <SafeAvatar src={selectedAvatar ? boringAvatar(selectedAvatar) : avatar} name={name} alt={name} style={styles.avatar} />
            <div style={{ margin: '12px 0' }}>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>Choose an avatar:</div>
              <select
                value={selectedAvatar}
                onChange={e => { setSelectedAvatar(e.target.value); setAvatar(''); }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #eee',
                  fontSize: 15,
                  marginBottom: 10
                }}
              >
                <option value="">-- Select an avatar --</option>
                {AVATAR_OPTIONS.map(opt => (
                  <option key={opt.name} value={opt.name}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div style={{ margin: '8px 0' }}>
                <label htmlFor="avatar-upload" style={{
                  display: 'inline-block',
                  padding: '8px 18px',
                  background: '#f3f4f6',
                  border: '2px dashed #d1d5db',
                  borderRadius: 10,
                  cursor: 'pointer',
                  color: '#4b5563',
                  fontWeight: 500,
                  fontSize: 14
                }}>
                  Upload your photo
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={styles.input} />
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current Password (to change password)" style={styles.input} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" style={styles.input} />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm New Password" style={styles.input} />
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          <button data-enter-submit type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  closeBtn: { position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 },
  avatar: { width: 80, height: 80, borderRadius: '50%', margin: '0 auto 10px', objectFit: 'cover', border: '2px solid #eee' },
  input: { padding: 10, borderRadius: 8, border: '1px solid #eee', fontSize: 15 },
  saveBtn: { background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }
};
