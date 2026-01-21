/* eslint-disable no-unused-vars */
import React, { useMemo, useEffect } from 'react';
import { ChevronLeft, Trophy, Star, ArrowUp, Flag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import SafeAvatar from './SafeAvatar';

export default function EggRoad({ classData, onBack }) {
  // 1. Calculate Whole Class Progress
  const classTotal = useMemo(() => 
    classData.students.reduce((sum, s) => sum + s.score, 0), 
  [classData.students]);

  // 2. Get Top Performers (Larger Avatars)
  const topPerformers = useMemo(() => 
    [...classData.students].sort((a, b) => b.score - a.score).slice(0, 5)
  , [classData.students]);

  // 3. Define the Levels (The higher the score, the higher the world)
  const levels = [
    { id: 1, name: "Green Forest", color: "#2ecc71", icon: "🌳", min: 0 },
    { id: 2, name: "Cloud Kingdom", color: "#3498db", icon: "☁️", min: 500 },
    { id: 3, name: "Star Galaxy", color: "#9b59b6", icon: "✨", min: 1000 },
    { id: 4, name: "Golden Victory", color: "#f1c40f", icon: "👑", min: 2000 }
  ];

  // Calculate current level based on total points
  const currentLevel = [...levels].reverse().find(l => classTotal >= l.min) || levels[0];
  const progressPercentage = Math.min((classTotal / 2500) * 100, 100);

  // inject a small mobile-friendly stylesheet so EggRoad fits narrow screens
  useEffect(() => {
    try {
      const style = document.createElement('style');
      style.id = 'eggroad-mobile-styles';
      style.innerHTML = `@media (max-width:768px){ .eggroad-root { padding: 12px !important; } .eggroad-root .header { padding: 12px !important; } .eggroad-root .avatarGroup { width: 95% !important; } .eggroad-root .topFiveContainer { gap: 8px; overflow-x: auto; padding: 10px; } }`;
      document.head.appendChild(style);
      return () => { const el = document.getElementById('eggroad-mobile-styles'); if (el) el.remove(); };
    } catch (e) {
      // noop
    }
  }, []);

  return (
    <div className="eggroad-root" style={{ ...styles.container, background: currentLevel.color }}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={onBack} aria-label="Close map" title="Close" style={styles.backBtn}><X size={18} /></button>
        <div style={styles.classStatus}>
          <div style={styles.levelBadge}>{currentLevel.icon} {currentLevel.name}</div>
          <div style={styles.totalScore}>Class Energy: {classTotal}</div>
        </div>
        <div style={styles.trophyIcon}><Trophy size={32} color="gold" /></div>
      </div>

      {/* THE VERTICAL JOURNEY */}
      <div style={styles.climbArea}>
        
        {/* The Vertical Path */}
        <div style={styles.verticalTrack}>
          {/* Progress Fill (Moves Up) */}
          <motion.div 
            style={styles.trackFill}
            initial={{ height: 0 }}
            animate={{ height: `${progressPercentage}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Level Markers */}
          {levels.map(level => (
            <div key={level.id} style={{ ...styles.marker, bottom: `${(level.min / 2500) * 100}%` }}>
              <div style={styles.markerLine} />
              <span style={styles.markerText}>{level.icon} {level.min}</span>
            </div>
          ))}

          {/* THE CLASS AVATAR GROUP (Moving up the track) */}
          <motion.div 
            style={{ ...styles.avatarGroup, bottom: `${progressPercentage}%` }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <div style={styles.leaderLabel}>Current Progress</div>
            <div style={styles.topFiveContainer}>
              {topPerformers.map((student, index) => (
                <div key={student.id} style={{ 
                  ...styles.starWrapper, 
                  transform: `scale(${1.4 - (index * 0.1)})`, // Leaders are larger
                  zIndex: 5 - index 
                }}>
                  <div style={styles.starCrown}><Star size={16} fill="gold" color="gold" /></div>
                  <SafeAvatar src={student.avatar} size={index === 0 ? 80 : 60} />
                  <div style={styles.studentName}>{student.name}</div>
                </div>
              ))}
            </div>
            <div style={styles.climbArrow}><ArrowUp size={30} color="white" /></div>
          </motion.div>
        </div>

      </div>

      {/* FOOTER GOAL */}
      <div style={styles.footer}>
        <Flag size={24} /> <span>Next Goal: {levels.find(l => l.min > classTotal)?.min || 'Max!'} Points</span>
      </div>

      {/* BACKGROUND DECORATIONS (Pure CSS for offline safety) */}
      <div style={styles.cloud1}>☁️</div>
      <div style={styles.cloud2}>☁️</div>
      <div style={styles.stars}>✨ ✨ ✨</div>
    </div>
  );
}



const styles = {
  container: { position: 'fixed', inset: 0, zIndex: 9999, transition: 'background 1s ease', overflow: 'hidden', fontFamily: 'system-ui' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'rgba(0,0,0,0.1)' },
  backBtn: { background: 'white', border: 'none', padding: '8px', width: '40px', height: '40px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' },
  classStatus: { textAlign: 'center' },
  levelBadge: { color: 'white', fontSize: '24px', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.3)' },
  totalScore: { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '18px' },
  trophyIcon: { background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },

  climbArea: { height: '70vh', position: 'relative', marginTop: '40px', display: 'flex', justifyContent: 'center' },
  verticalTrack: { width: '12px', height: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', position: 'relative' },
  trackFill: { position: 'absolute', bottom: 0, width: '100%', background: 'white', borderRadius: '10px', boxShadow: '0 0 20px white' },
  
  marker: { position: 'absolute', left: '20px', display: 'flex', alignItems: 'center', width: '200px' },
  markerLine: { width: '40px', height: '2px', background: 'rgba(255,255,255,0.5)', marginRight: '10px' },
  markerText: { color: 'white', fontWeight: 'bold', fontSize: '14px' },

  avatarGroup: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '600px' },
  leaderLabel: { background: '#ff7675', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' },
  topFiveContainer: { display: 'flex', gap: '20px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '40px', backdropFilter: 'blur(5px)' },
  starWrapper: { position: 'relative', textAlign: 'center' },
  starCrown: { position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' },
  studentName: { color: 'white', fontWeight: 'bold', marginTop: '5px', fontSize: '12px', textShadow: '0 1px 2px black' },
  climbArrow: { marginTop: '10px', animation: 'bounce 1s infinite alternate' },

  footer: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '800' },

  // Decorations
  cloud1: { position: 'absolute', top: '20%', left: '10%', fontSize: '80px', opacity: 0.3 },
  cloud2: { position: 'absolute', top: '40%', right: '10%', fontSize: '100px', opacity: 0.2 },
  stars: { position: 'absolute', top: '10%', width: '100%', textAlign: 'center', fontSize: '30px', opacity: 0.5 },

  // Keyframes logic in JS
  '@keyframes bounce': { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-10px)' } }
};