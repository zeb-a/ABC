/* eslint-disable react-hooks/refs */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Users, Star, Check } from 'lucide-react';

export default function LuckyDrawModal({ students, onClose, onWinner }) {
  const safeStudents = useMemo(() => Array.isArray(students) ? students : [], [students]);
  const [step, setStep] = useState('count_selection');
  const [studentCount, setStudentCount] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [targetWinners, setTargetWinners] = useState([]);
  const [pointsToGive, setPointsToGive] = useState(1);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));
  audioRef.current.loop = true;

  const handleStartDraw = (count) => {
    setStudentCount(count);
    // Shuffle and pick unique students (No duplicates)
    const shuffled = [...safeStudents].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, safeStudents.length));

    setTargetWinners(selected);
    setStep('drawing');
    setRolling(true);

    audioRef.current.play().catch(() => { });

    setTimeout(() => {
      setRolling(false);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }, 2500);
  };


  return (
    <div style={modalStyles.overlay}>
      {step === 'count_selection' ? (
        <div style={modalStyles.glassCard}>
          <X onClick={onClose} style={modalStyles.closeIcon} />
          <div style={modalStyles.headerIcon}><Users size={32} color="#fff" /></div>
          <h2 style={modalStyles.title}>Draw Group</h2>
          <p style={modalStyles.subtitle}>Select number of Students</p>
          <div style={modalStyles.numberGrid}>
            {[1, 2, 3, 4].map((num) => (
              <button key={num} onClick={() => handleStartDraw(num)} style={modalStyles.numberBtn}>
                {num}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          ...modalStyles.drawContainer,
          width: studentCount === 1 ? '450px' : '90%',
          maxHeight: '90vh' // Prevents button from going off-screen
        }}>
          <X onClick={onClose} style={modalStyles.closeIcon} />
          <div style={modalStyles.headerLabel}>{rolling ? "Selecting..." : "Selections!"}</div>

          <div style={{
            ...modalStyles.cardsWrapper,
            flexWrap: studentCount > 2 ? 'wrap' : 'nowrap', // Wraps cards if they are too many
            overflowY: 'auto'
          }}>
            {targetWinners.map((winner, i) => (
              <RollingCard
                key={winner.id || i}
                rolling={rolling}
                students={safeStudents}
                finalStudent={winner}
                count={studentCount}
              />
            ))}
          </div>

          {!rolling && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Point Value Selector */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPointsToGive(val)} // You'll need: const [pointsToGive, setPointsToGive] = useState(1); at the top
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      border: pointsToGive === val ? 'none' : '1px solid #ddd',
                      background: pointsToGive === val ? '#4CAF50' : 'white',
                      color: pointsToGive === val ? 'white' : '#333',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onWinner(studentCount === 1 ? targetWinners[0] : targetWinners, pointsToGive)}
                style={modalStyles.saveBtn}
              >
                Award {pointsToGive * targetWinners.length} Points Total
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RollingCard({ rolling, students, finalStudent, count }) {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (rolling) {
      interval = setInterval(() => {
        setDisplayIndex(Math.floor(Math.random() * students.length));
      }, 80);
    }
    return () => clearInterval(interval);
  }, [rolling, students]);

  const current = rolling ? students[displayIndex] : finalStudent;

  // Dynamic sizing based on student count
  const cardWidth = count === 1 ? '100%' : count === 2 ? '45%' : '22%';

  return (
    <div style={{ ...modalStyles.luckyCard, width: cardWidth, minWidth: '200px' }}>
      <div style={modalStyles.avatarContainer}>
        <img
          src={current?.avatar}
          style={{
            width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover',
            filter: rolling ? 'blur(2px)' : 'none'
          }}
          alt="avatar"
        />
      </div>
      <h3 style={modalStyles.nameLabel}>{current?.name}</h3>
      {!rolling && <div style={modalStyles.pointBadge}>Selected</div>}
    </div>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 },
  glassCard: { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '40px', borderRadius: '40px', width: '400px', textAlign: 'center', position: 'relative' },
  drawContainer: { background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '40px 20px', borderRadius: '40px', textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' },
  headerLabel: { color: '#fff', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', opacity: 0.6 },
  closeIcon: { position: 'absolute', right: 20, top: 20, cursor: 'pointer', color: '#fff', zIndex: 10 },
  headerIcon: { width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  title: { fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 10px 0' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginBottom: '30px' },
  numberGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  numberBtn: { padding: '20px 0', fontSize: '22px', fontWeight: 900, borderRadius: '15px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#fff' },
  cardsWrapper: { display: 'flex', gap: '10px', justifyContent: 'center', width: '100%', marginBottom: '30px', padding: '10px' },
  luckyCard: { background: 'rgba(255, 255, 255, 0.05)', padding: '20px 10px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  avatarContainer: { width: '75%', aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden' },
  nameLabel: { margin: '15px 0 5px 0', fontWeight: 800, color: '#fff', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '90%' },
  pointBadge: { background: '#4CAF50', color: '#fff', padding: '2px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 },
  footer: { width: '100%', maxWidth: '350px', marginTop: 'auto' },
  saveBtn: { width: '100%', padding: '18px', background: '#fff', color: '#000', border: 'none', borderRadius: '18px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};