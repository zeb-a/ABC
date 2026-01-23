import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

// Large card point animation with student avatar and behavior emoji
export const PointAnimation = ({ isVisible, studentAvatar, studentName, points = 1, behaviorEmoji = '⭐', onComplete, students }) => {
  const isPositive = points > 0;
  const isWholeClass = students && students.length > 0;
  const [sparkles, setSparkles] = useState([]);
  const [emojiBounce, setEmojiBounce] = useState(false);

  // Create sparkle effects for positive points
  useEffect(() => {
    if (isVisible && isPositive) {
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i / 8) * Math.PI * 2,
        distance: 100 + Math.random() * 50
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 1000);
    }
  }, [isVisible, isPositive]);

  // Trigger emoji bounce animation
  useEffect(() => {
    if (isVisible) {
      setEmojiBounce(true);
      const bounceInterval = setInterval(() => setEmojiBounce(prev => !prev), isPositive ? 300 : 400);
      return () => clearInterval(bounceInterval);
    }
  }, [isVisible, isPositive]);
  
  // Play sound effect when animation shows
  useEffect(() => {
    if (!isVisible) return;

    // Audio context for sound effects
    let audioContext = null;
    let oscillators = [];

    try {
      // Check browser support for Web Audio API
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      audioContext = new AudioContextClass({
        latencyHint: 'interactive'
      });

      // Resume if suspended (autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

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
        oscillators.push(osc);
      };

      if (isPositive) {
        // --- POSITIVE SOUND ENGINE - HAPPY CELEBRATORY SOUNDS ---
        const count = Math.min(Math.max(points, 1), 5);

        if (count === 1) {
          // 1 point: Cheerful "Ding!" (bright and happy)
          playNote(1046, startTime, 0.25, 0.15, 'sine'); // C6
          playNote(1318, startTime + 0.08, 0.15, 0.2, 'sine'); // E6
        } else if (count === 2) {
          // 2 points: Rising "Yay!" melody (upward celebration)
          playNote(784, startTime, 0.2, 0.2, 'triangle'); // G5
          playNote(880, startTime + 0.12, 0.2, 0.2, 'triangle'); // A5
          playNote(1046, startTime + 0.24, 0.25, 0.35, 'sine'); // C6
        } else if (count === 3) {
          // 3 points: Triumphant fanfare (celebration!)
          playNote(659, startTime, 0.18, 0.2, 'triangle'); // E5
          playNote(784, startTime + 0.1, 0.18, 0.2, 'triangle'); // G5
          playNote(987, startTime + 0.2, 0.2, 0.25, 'triangle'); // B5
          playNote(1318, startTime + 0.3, 0.25, 0.4, 'sine'); // E6
        } else if (count === 4) {
          // 4 points: Super celebration sparkles (exciting!)
          playNote(523, startTime, 0.15, 0.15, 'triangle'); // C5
          playNote(659, startTime + 0.08, 0.15, 0.15, 'triangle'); // E5
          playNote(784, startTime + 0.16, 0.18, 0.2, 'triangle'); // G5
          playNote(1046, startTime + 0.24, 0.2, 0.25, 'triangle'); // C6
          playNote(1318, startTime + 0.32, 0.25, 0.5, 'sine'); // E6
        } else {
          // 5+ points: Grand victory fanfare (amazing!)
          const chords = [
            {f: [523, 659], t: 0},      // C major chord
            {f: [784, 987], t: 0.15},   // G major chord
            {f: [1046, 1318], t: 0.3},  // E major chord (relative minor)
            {f: [1318, 1567], t: 0.5},  // Victory!
          ];
          chords.forEach(c => c.f.forEach(freq => playNote(freq, startTime + c.t, 0.18, 0.8, 'triangle')));
        }
      } else {
        // --- FUNNY BUMMER SOUND ENGINE (GOOFY SILLY SOUNDS) ---
        const penalty = Math.abs(points);

        if (penalty === 1) {
          // LEVEL -1: "Oops!" (short silly slide down)
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(660, startTime);
          osc.frequency.exponentialRampToValueAtTime(330, startTime + 0.2);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
          osc.start(startTime);
          osc.stop(startTime + 0.2);
          oscillators.push(osc);
        }
        else if (penalty === 2) {
          // LEVEL -2: "Whoops whoops" (two goofy drops)
          playNote(494, startTime, 0.15, 0.15, 'triangle'); // B4
          playNote(330, startTime + 0.12, 0.18, 0.25, 'triangle'); // E4
          playNote(392, startTime + 0.3, 0.15, 0.15, 'triangle'); // G4
          playNote(262, startTime + 0.42, 0.18, 0.25, 'triangle'); // C4
        }
        else if (penalty === 3) {
          // LEVEL -3: "Uh-oh-oh" (three silly downward steps)
          playNote(523, startTime, 0.15, 0.12, 'triangle'); // C5
          playNote(392, startTime + 0.12, 0.15, 0.12, 'triangle'); // G4
          playNote(330, startTime + 0.24, 0.18, 0.15, 'triangle'); // E4
          playNote(262, startTime + 0.36, 0.2, 0.3, 'triangle'); // C4 (ending on low note)
        }
        else if (penalty === 4) {
          // LEVEL -4: "Wah-wah-wah-wah" (classic cartoon wah sound)
          const wahDuration = 0.8;
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          const lfo = audioContext.createOscillator();
          const lfoGain = audioContext.createGain();

          osc.type = 'triangle';
          lfo.type = 'sine';
          lfo.frequency.value = 5; // 5 Hz wobble

          lfoGain.gain.value = 100;

          osc.connect(gain);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          gain.connect(audioContext.destination);

          osc.frequency.value = 400;
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + wahDuration);

          lfo.start(startTime);
          osc.start(startTime);
          osc.stop(startTime + wahDuration);
          lfo.stop(startTime + wahDuration);
          oscillators.push(osc, lfo);
        }
        else {
          // LEVEL -5+: "Oh nooooo..." (dramatic goofy slide)
          const groanDuration = 1.2;
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc1.type = 'triangle';
          osc2.type = 'sine';
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioContext.destination);

          osc1.frequency.setValueAtTime(330, startTime);
          osc1.frequency.exponentialRampToValueAtTime(82, startTime + groanDuration);
          osc2.frequency.setValueAtTime(311, startTime);
          osc2.frequency.exponentialRampToValueAtTime(78, startTime + groanDuration);

          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + groanDuration);

          osc1.start(startTime);
          osc2.start(startTime);
          osc1.stop(startTime + groanDuration);
          osc2.stop(startTime + groanDuration);
          oscillators.push(osc1, osc2);
        }
      }
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }

    // Cleanup function
    return () => {
      // Stop all oscillators
      oscillators.forEach(osc => {
        try {
          if (osc.state !== 'stopped') {
            osc.stop();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      });

      // Close audio context
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isVisible, isPositive, points]);

  const backgroundColor = isPositive 
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
    : 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)';
  const borderColor = isPositive ? '#FFA500' : '#FF4757';
  
  const content = (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <>
          {/* Animated background with particles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 2999 }}
          />

          {/* Sparkles for positive points */}
          <AnimatePresence>
            {sparkles.map(sparkle => (
              <motion.div
                key={sparkle.id}
                initial={{ opacity: 1, scale: 0, x: '50%', y: '50%' }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: `calc(50% + ${Math.cos(sparkle.angle) * sparkle.distance}px)`,
                  y: `calc(50% + ${Math.sin(sparkle.angle) * sparkle.distance}px)`
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={{
                  position: 'fixed',
                  width: '30px',
                  height: '30px',
                  fontSize: '30px',
                  zIndex: 3001,
                  pointerEvents: 'none'
                }}
              >
                ✨
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-40%', rotate: -10 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: '-50%', y: '-40%', rotate: 10 }}
            transition={{ type: "spring", damping: 12, stiffness: 300 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              width: '50vw', maxWidth: '650px', minWidth: '320px',
              background: backgroundColor, borderRadius: '40px', padding: '70px 45px',
              boxShadow: '0 30px 90px rgba(0,0,0,0.4)', zIndex: 3000,
              border: `6px solid ${borderColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px',
              overflow: 'visible'
            }}
          >
            {isWholeClass ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '-15px', position: 'relative' }}>
                {students.slice(0, 8).map((student, idx) => (
                  <motion.img
                    key={student.id} src={student.avatar}
                    animate={{
                      y: [0, -20, 0],
                      rotate: isPositive ? [0, 5, -5, 0] : [-3, 3, -3]
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: idx * 0.08 }}
                    style={{
                      width: '70px', height: '70px', borderRadius: '50%', border: '5px solid white',
                      marginLeft: idx > 0 ? '-20px' : '0', zIndex: 10 - idx,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <motion.img
                  src={studentAvatar}
                  animate={isPositive ? {
                    y: [0, -25, 0],
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  } : {
                    x: [-15, 15, -15],
                    rotate: [-8, 8, -8]
                  }}
                  transition={{
                    duration: isPositive ? 0.8 : 0.4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ width: '130px', height: '130px', borderRadius: '50%', border: '7px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                />
                {/* Avatar glow ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.3],
                    opacity: [0.6, 0],
                    borderColor: isPositive ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 71, 87, 0.8)'
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: '-15px',
                    borderRadius: '50%',
                    border: '8px solid',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            )}

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              style={{ fontSize: '32px', fontWeight: '900', color: 'white', textAlign: 'center', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            >
              {studentName}
            </motion.div>

            {/* Animated Emoji and Points Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px', position: 'relative' }}>
              {/* Dancing Emoji */}
              <motion.span
                key={emojiBounce ? 'bounce1' : 'bounce2'}
                animate={isPositive ? {
                  y: emojiBounce ? [0, -35, 0] : [0, -15, 0],
                  rotate: emojiBounce ? [-20, 20, -20, 20, 0] : [0, -15, 0, 15, 0],
                  scale: emojiBounce ? [1, 1.3, 1] : [1, 1.15, 1]
                } : {
                  x: [-12, 12, -12],
                  rotate: [-10, 10, -10],
                  scale: [1, 0.85, 1]
                }}
                transition={{
                  duration: isPositive ? 0.6 : 0.5,
                  repeat: Infinity,
                  ease: isPositive ? "easeOut" : "easeInOut"
                }}
                style={{
                  fontSize: '100px',
                  filter: isPositive ? 'drop-shadow(0 10px 20px rgba(255,215,0,0.5))' : 'drop-shadow(0 8px 15px rgba(255,71,87,0.5))',
                  display: 'inline-block',
                  cursor: 'default',
                  WebkitFilter: isPositive ? 'drop-shadow(0 10px 20px rgba(255,215,0,0.5))' : 'drop-shadow(0 8px 15px rgba(255,71,87,0.5))'
                }}
              >
                {behaviorEmoji}
              </motion.span>

              {/* Animated Points */}
              <motion.span
                animate={{
                  scale: isPositive ? [1, 1.4, 1] : [1, 0.8, 1],
                  rotate: isPositive ? [0, -5, 5, 0] : [0, -3, 3, 0]
                }}
                transition={{
                  duration: isPositive ? 0.5 : 0.7,
                  repeat: Infinity,
                  delay: 0.1
                }}
                style={{
                  fontSize: '95px',
                  fontWeight: '950',
                  color: 'white',
                  textShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  display: 'inline-block',
                  WebkitTextStroke: isPositive ? '3px rgba(255,255,255,0.3)' : '2px rgba(255,255,255,0.2)',
                  WebkitTextFillColor: 'white'
                }}
              >
                {isPositive ? '+' : ''}{points}
              </motion.span>
            </div>

            {/* Pulsing border ring */}
            <motion.div
              animate={{
                scale: isPositive ? [1, 1.25, 1] : [1, 1.15, 1],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{
                duration: isPositive ? 0.9 : 1.2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{ position: 'absolute', inset: -20, borderRadius: '50px', border: `10px solid ${isPositive ? 'rgba(255,215,0,0.6)' : 'rgba(255,71,87,0.6)'}`, pointerEvents: 'none' }}
            />

            {/* Confetti particles for positive */}
            {isPositive && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: '40px' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: ['-100%', '120%'],
                      x: `${(i / 12) * 100}%`,
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "linear"
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      fontSize: `${20 + Math.random() * 15}px`,
                      opacity: 0.7
                    }}
                  >
                    {['🎉', '✨', '🌟', '💫', '⭐'][i % 5]}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};