import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

// Large card point animation with student avatar and behavior emoji
export const PointAnimation = ({ isVisible, studentAvatar, studentName, points = 1, behaviorEmoji = '⭐', onComplete, students }) => {
  const isPositive = points > 0;
  const isWholeClass = students && students.length > 0;
  
  // Play sound effect when animation shows
  useEffect(() => {
    if (isVisible) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const startTime = audioContext.currentTime;
      
      // Helper to play a single note with specific characteristics
      const playNote = (freq, time, volume = 0.2, duration = 0.2, type = 'sine') => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };

      if (isPositive) {
        // --- POSITIVE SOUND ENGINE ---
        const count = Math.min(Math.max(points, 1), 5);
        if (count === 1) {
          playNote(880, startTime, 0.2, 0.1, 'triangle'); // Pop
        } else if (count === 2) {
          playNote(523, startTime, 0.2, 0.15); // C5
          playNote(784, startTime + 0.1, 0.2, 0.2); // G5
        } else if (count === 3) {
          [523, 659, 784].forEach((f, i) => playNote(f, startTime + (i * 0.1), 0.2, 0.3));
        } else if (count === 4) {
          [523, 784, 659, 1046].forEach((f, i) => playNote(f, startTime + (i * 0.08), 0.2, 0.4));
        } else {
          const chords = [{f:[523,659,784], t:0}, {f:[587,739,880], t:0.15}, {f:[659,830,988], t:0.3}];
          chords.forEach(c => c.f.forEach(freq => playNote(freq, startTime + c.t, 0.15, 0.6, 'triangle')));
        }
      } else {
        // --- DYNAMIC NEGATIVE SOUND ENGINE (SAD NONO) ---
        const penalty = Math.abs(points);

        if (penalty === 1) {
          // LEVEL -1: Minor "Uhoh"
          playNote(392, startTime, 0.2, 0.1, 'sawtooth'); // G4
          playNote(370, startTime + 0.1, 0.2, 0.2, 'sawtooth'); // F#4
        } 
        else if (penalty === 2) {
          // LEVEL -2: Double Drop
          playNote(330, startTime, 0.2, 0.15, 'square'); // E4
          playNote(220, startTime + 0.15, 0.2, 0.3, 'square'); // A3
        }
        else if (penalty === 3) {
          // LEVEL -3: The Slide Down
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(440, startTime);
          osc.frequency.exponentialRampToValueAtTime(110, startTime + 0.8);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
          osc.start(startTime);
          osc.stop(startTime + 0.8);
        }
        else if (penalty === 4) {
          // LEVEL -4: Descending Minor Stabs
          [440, 349, 293, 220].forEach((f, i) => { // A4-F4-D4-A3
            playNote(f, startTime + (i * 0.15), 0.2, 0.4, 'sawtooth');
          });
        }
        else {
          // LEVEL -5+: GRAND DISAPPOINTMENT (The Groan)
          const sadDuration = 1.5;
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc1.type = 'sawtooth';
          osc2.type = 'square';
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioContext.destination);
          
          osc1.frequency.setValueAtTime(220, startTime);
          osc1.frequency.linearRampToValueAtTime(55, startTime + sadDuration);
          osc2.frequency.setValueAtTime(215, startTime);
          osc2.frequency.linearRampToValueAtTime(50, startTime + sadDuration);
          
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.linearRampToValueAtTime(0.01, startTime + sadDuration);
          
          osc1.start(startTime);
          osc2.start(startTime);
          osc1.stop(startTime + sadDuration);
          osc2.stop(startTime + sadDuration);
        }
      }
    }
  }, [isVisible, isPositive, points]);

  const backgroundColor = isPositive 
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
    : 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)';
  const borderColor = isPositive ? '#FFA500' : '#FF4757';
  
  const content = (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 2999 }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-40%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.5, x: '-50%', y: '-40%' }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              width: '50vw', maxWidth: '600px', minWidth: '320px',
              background: backgroundColor, borderRadius: '40px', padding: '60px 40px',
              boxShadow: '0 30px 90px rgba(0,0,0,0.4)', zIndex: 3000,
              border: `6px solid ${borderColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px'
            }}
          >
            {isWholeClass ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '-15px' }}>
                {students.slice(0, 8).map((student, idx) => (
                  <motion.img
                    key={student.id} src={student.avatar}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.1 }}
                    style={{
                      width: '70px', height: '70px', borderRadius: '50%', border: '4px solid white',
                      marginLeft: idx > 0 ? '-20px' : '0', zIndex: 10 - idx
                    }}
                  />
                ))}
              </div>
            ) : (
              <motion.img
                src={studentAvatar}
                animate={isPositive ? { y: [0, -20, 0] } : { x: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ width: '120px', height: '120px', borderRadius: '50%', border: '6px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
              />
            )}

            <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', textAlign: 'center' }}>
              {studentName}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '80px' }}>{behaviorEmoji}</span>
              <span style={{ fontSize: '80px', fontWeight: '950', color: 'white' }}>
                {isPositive ? '+' : ''}{points}
              </span>
            </div>

            <motion.div
              animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ position: 'absolute', inset: -10, borderRadius: '50px', border: '8px solid white', pointerEvents: 'none' }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};