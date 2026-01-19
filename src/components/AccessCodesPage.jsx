import React from 'react';
import QRCode from 'react-qr-code';
import { X } from 'lucide-react'; // Import the X icon
import InlineHelpButton from './InlineHelpButton';

const AccessCodesPage = ({ activeClass, onBack }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', padding: '40px', minHeight: '100vh', overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#2D3436' }}>Student Access Codes</h1>
          <InlineHelpButton pageId="access-codes" />
        </div>
        {/* The Close Button */}
        <button 
          onClick={onBack} 
          style={{ 
            background: '#F1F5F9', 
            color: '#64748B', 
            border: 'none', 
            padding: '10px', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
        >
          <X size={24} />
        </button>
      </header>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Student Name</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Parent Code</th>
              <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Student Code</th>
            </tr>
          </thead>
          <tbody>
            {activeClass.students.map((s) => {
              const codes = (activeClass.Access_Codes && activeClass.Access_Codes[s.id]) || { parentCode: '---', studentCode: '---' };
              const appBaseUrl = window.location.origin;
              const parentUrl = `${appBaseUrl}/#/parent-login/${codes.parentCode}`;
              const studentUrl = `${appBaseUrl}/#/student-login/${codes.studentCode}`;
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2D3436' }}>{s.name}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace', background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: '6px', fontSize: '15px' }}>
                          {codes.parentCode}
                        </span>
                        {codes.parentCode !== '---' && (
                          <button
                            style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '5px', border: '1px solid #b2dfdb', background: '#fff', color: '#2E7D32', cursor: 'pointer' }}
                            onClick={async () => {
                              const svg = document.getElementById(`parent-qr-${s.id}`);
                              if (svg) {
                                const serializer = new XMLSerializer();
                                const svgString = serializer.serializeToString(svg);
                                // Create a canvas and draw the SVG onto it
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
                          >
                            Copy QR
                          </button>
                        )}
                      </div>
                      {codes.parentCode !== '---' && (
                        <div style={{ background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
                          <QRCode id={`parent-qr-${s.id}`} value={parentUrl} size={48} style={{ height: '48px', maxWidth: '48px', width: '100%' }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace', background: '#E3F2FD', color: '#1565C0', padding: '4px 10px', borderRadius: '6px', fontSize: '15px' }}>
                          {codes.studentCode}
                        </span>
                        {codes.studentCode !== '---' && (
                          <button
                            style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '5px', border: '1px solid #90caf9', background: '#fff', color: '#1565C0', cursor: 'pointer' }}
                            onClick={async () => {
                              const svg = document.getElementById(`student-qr-${s.id}`);
                              if (svg) {
                                const serializer = new XMLSerializer();
                                const svgString = serializer.serializeToString(svg);
                                // Create a canvas and draw the SVG onto it
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
                          >
                            Copy QR
                          </button>
                        )}
                      </div>
                      {codes.studentCode !== '---' && (
                        <div style={{ background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
                          <QRCode id={`student-qr-${s.id}`} value={studentUrl} size={48} style={{ height: '48px', maxWidth: '48px', width: '100%' }} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessCodesPage;