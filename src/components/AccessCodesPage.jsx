import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, Search } from 'lucide-react';
import InlineHelpButton from './InlineHelpButton';

const AccessCodesPage = ({ activeClass, onBack }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const filteredStudents = searchValue.trim()
    ? activeClass.students.filter(s => s.name.toLowerCase().includes(searchValue.trim().toLowerCase()))
    : activeClass.students;
  return (
    <div className="accesscodes-page" style={{ display: 'flex', flexDirection: 'column', background: '#F7F8FA', minHeight: '100vh', padding: 0, overflowY: 'auto' }}>
      <style>{`
        .codes-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px 0 24px;
          min-height: 56px;
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        @media (max-width:768px) {
          .codes-header {
            padding: 14px 8px 0 8px;
            min-height: 48px;
          }
        }
        .codes-header-title {
          position: absolute;
          left: 0;
          right: 0;
          text-align: center;
          pointer-events: none;
          font-size: 1.25rem;
          font-weight: 800;
          color: #222;
          margin: 0;
        }
        .codes-header-inner {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .codes-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .codes-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin: 0 auto;
          max-width: 1200px;
          width: 100%;
          padding: 32px 12px 32px 12px;
        }
        @media (min-width: 700px) {
          .codes-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1020px) {
          .codes-list {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .codes-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(99,102,241,0.07);
          border: 1px solid #E2E8F0;
          padding: 24px 12px 20px 12px;
          gap: 10px;
          margin: 0 auto;
          max-width: 370px;
        }
        .codes-name {
          font-weight: 800;
          color: #222;
          font-size: 1.18rem;
          margin-bottom: 8px;
          text-align: center;
        }
        .codes-codes-row {
          display: flex;
          flex-direction: row;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }
        .codes-code-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          min-width: 120px;
        }
        .codes-label {
          font-size: 0.98rem;
          font-weight: 700;
          color: #6366F1;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .codes-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 4px 0 0 0;
          border-radius: 10px;
          border: 1px solid #E0E0E0;
          margin: 0 auto;
        }
        .codes-code {
          font-family: monospace;
          font-size: 1.08rem;
          background: #F1F8E9;
          color: #2E7D32;
          padding: 6px 16px;
          border-radius: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-align: center;
        }
        .codes-code.student {
          background: #E3F2FD;
          color: #1565C0;
        }
        .codes-copy {
          font-size: 13px;
          padding: 4px 12px;
          border-radius: 7px;
          border: 1px solid #b2dfdb;
          background: #fff;
          color: #2E7D32;
          cursor: pointer;
          transition: background 0.18s;
          margin-top: 6px;
        }
        .codes-copy.student {
          border: 1px solid #90caf9;
          color: #1565C0;
        }
        .codes-qr {
          background: #fff;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid #E0E0E0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        @media (max-width:768px) {
          .codes-header {
            padding: 14px 8px 0 8px;
          }
          .codes-list {
            max-width: 100%;
            padding: 10px 2px 18px 2px;
            gap: 14px;
          }
          .codes-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px 8px;
            gap: 12px;
          }
          .codes-info {
            min-width: 0;
          }
          .codes-codes-row {
            gap: 10px;
          }
        }
      `}</style>
      <div className="codes-header">
        <div className="codes-header-inner">
          <div style={{ minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 30 }}>
            {!searchOpen ? (
              <button
                aria-label="Search students"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setSearchOpen(true)}
              >
                <Search size={22} />
              </button>
            ) : (
              <input
                autoFocus
                type="text"
                placeholder="Search students..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onBlur={() => { if (!searchValue) setSearchOpen(false); }}
                style={{
                  fontSize: '1rem',
                  padding: '4px 8px',
                  borderRadius: '7px',
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  width: 140,
                  transition: 'width 0.2s',
                  color: '#222',
                  background: '#F8FAFC',
                  marginLeft: 0
                }}
              />
            )}
          </div>
          <h2 className="codes-header-title"> Login Access Codes</h2>
          <div className="codes-header-actions">
            <InlineHelpButton pageId="access-codes" />
            <button 
              onClick={onBack} 
              style={{ background: '#F1F5F9', color: '#64748B', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
            >
              <X size={22} />
            </button>
          </div>
        </div>
      </div>
      <div className="codes-list">
        {filteredStudents.map((s) => {
          const codes = (activeClass.Access_Codes && activeClass.Access_Codes[s.id]) || { parentCode: '---', studentCode: '---' };
          const appBaseUrl = window.location.origin;
          const parentUrl = `${appBaseUrl}/#/parent-login/${codes.parentCode}`;
          const studentUrl = `${appBaseUrl}/#/student-login/${codes.studentCode}`;
          return (
            <div key={s.id} className="codes-card">
              <div className="codes-name">{s.name}</div>
              <div className="codes-codes-row">
                <div className="codes-code-block">
                  <div className="codes-label">Parent Code</div>
                  <span className="codes-code">{codes.parentCode}</span>
                  {codes.parentCode !== '---' && (
                    <span className="codes-qr">
                      <QRCode id={`parent-qr-${s.id}`} value={parentUrl} size={36} style={{ height: '36px', maxWidth: '36px', width: '100%' }} />
                      <button
                        className="codes-copy"
                        style={{ marginTop: 8 }}
                        onClick={async () => {
                          const svg = document.getElementById(`parent-qr-${s.id}`);
                          if (svg) {
                            const serializer = new XMLSerializer();
                            const svgString = serializer.serializeToString(svg);
                            const canvas = document.createElement('canvas');
                            const size = 48;
                            canvas.width = size;
                            canvas.height = size;
                            const ctx = canvas.getContext('2d');
                            const img = new window.Image();
                            const svg64 = btoa(unescape(encodeURIComponent(svgString)));
                            const imageSrc = 'data:image/svg+xml;base64,' + svg64;
                            img.onload = async function() {
                              ctx.clearRect(0, 0, size, size);
                              ctx.drawImage(img, 0, 0, size, size);
                              canvas.toBlob(async (blob) => {
                                try {
                                  await navigator.clipboard.write([
                                    new window.ClipboardItem({ 'image/png': blob })
                                  ]);
                                } catch {
                                  alert('Failed to copy image. Your browser may not support this feature.');
                                }
                              }, 'image/png');
                            };
                            img.onerror = function() {
                              alert('Failed to render QR code image.');
                            };
                            img.src = imageSrc;
                          }
                        }}
                      >Copy QR</button>
                    </span>
                  )}
                </div>
                <div className="codes-code-block">
                  <div className="codes-label">Student Code</div>
                  <span className="codes-code student">{codes.studentCode}</span>
                  {codes.studentCode !== '---' && (
                    <span className="codes-qr">
                      <QRCode id={`student-qr-${s.id}`} value={studentUrl} size={36} style={{ height: '36px', maxWidth: '36px', width: '100%' }} />
                      <button
                        className="codes-copy student"
                        style={{ marginTop: 8 }}
                        onClick={async () => {
                          const svg = document.getElementById(`student-qr-${s.id}`);
                          if (svg) {
                            const serializer = new XMLSerializer();
                            const svgString = serializer.serializeToString(svg);
                            const canvas = document.createElement('canvas');
                            const size = 48;
                            canvas.width = size;
                            canvas.height = size;
                            const ctx = canvas.getContext('2d');
                            const img = new window.Image();
                            const svg64 = btoa(unescape(encodeURIComponent(svgString)));
                            const imageSrc = 'data:image/svg+xml;base64,' + svg64;
                            img.onload = async function() {
                              ctx.clearRect(0, 0, size, size);
                              ctx.drawImage(img, 0, 0, size, size);
                              canvas.toBlob(async (blob) => {
                                try {
                                  await navigator.clipboard.write([
                                    new window.ClipboardItem({ 'image/png': blob })
                                  ]);
                                } catch {
                                  alert('Failed to copy image. Your browser may not support this feature.');
                                }
                              }, 'image/png');
                            };
                            img.onerror = function() {
                              alert('Failed to render QR code image.');
                            };
                            img.src = imageSrc;
                          }
                        }}
                      >Copy QR</button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccessCodesPage;