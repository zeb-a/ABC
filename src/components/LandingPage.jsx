import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import {
  X, ArrowRight, GaugeCircle, Dices, BarChart3, Ghost, ClipboardList, QrCode, Timer, Bell, Layout, Settings, Heart, BookOpen, Star, GraduationCap, Users, MessageSquare, Pencil, Trash2, Trophy
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../i18n';
import api from '../services/api';
import ParentPortal from './ParentPortal';
import StudentPortal from './StudentPortal';
// --- THE LOGO COMPONENT ---
import ClassABCLogo from './ClassABCLogo';
import './LandingPage.css';

// Small motion-enabled card wrapper. Uses motion values to create a subtle
// tilt + scale on pointer move. Respects prefers-reduced-motion.
function MotionCard({ children, className, style, ...props }) {
  const shouldReduce = useReducedMotion();
  // Dev override: set `VITE_FORCE_MOTION=true` when running the dev server to force animations.
  const forceMotion = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FORCE_MOTION === 'true';

  // Hooks must run unconditionally. Call all hooks first, then return early if reduced-motion is set.
  const [hovered, setHovered] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Slightly snappier springs for a faster response and quicker settle
  // Softer springs for a smoother, forward pop feel
  const sx = useSpring(mx, { stiffness: 300, damping: 24 });
  const sy = useSpring(my, { stiffness: 300, damping: 24 });

  // Amplify amount when developer forces motion for easier debugging.
  const amplify = forceMotion ? 3 : 1;
  // Slightly stronger tilt and pop when not forced; amplified more when forced for debugging
  const rotateY = useTransform(sx, (v) => v * 7 * amplify); // degrees
  const rotateX = useTransform(sy, (v) => -v * 7 * amplify);
  const scale = useTransform(sx, (v) => 1 + Math.min(0.16 * amplify, Math.abs(v) * 0.09 * amplify));

  // Respect prefers-reduced-motion unless developer explicitly forces motion.
  if (shouldReduce && !forceMotion) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const handlePointerLeave = () => {
    setHovered(false);
    mx.set(0);
    my.set(0);
  };

  // Wrap the motion.div in a parent that provides `perspective` so rotateX/rotateY are visually apparent.
  const wrapperStyle = { perspective: '900px', display: 'inline-block' };

  return (
    <div style={wrapperStyle}>
      <motion.div
        className={className}
        style={{
          ...style,
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          pointerEvents: 'auto',
          outline: hovered ? '2px solid rgba(16,185,129,0.18)' : 'none'
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={() => {
          setHovered(true);
          mx.set(0); my.set(0);
        }}
        whileHover={{ scale: forceMotion ? 1.22 : 1.08 }}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Motion-enabled button to animate hover/press with same spring behavior.
function MotionButton({ children, className, style, ...props }) {
  const shouldReduce = useReducedMotion();
  // Hooks first
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Softer springs for smoother hover/settle
  const sx = useSpring(mx, { stiffness: 220, damping: 24 });
  const sy = useSpring(my, { stiffness: 220, damping: 24 });

  const rotateY = useTransform(sx, (v) => v * 6);
  const rotateX = useTransform(sy, (v) => -v * 6);
  const scale = useTransform(sx, (v) => 1 + Math.min(0.025, Math.abs(v) * 0.025));

  if (shouldReduce) {
    return (
      <button className={className} style={style} {...props}>
        {children}
      </button>
    );
  }

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      className={className}
      style={{ ...style, rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.06 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default function LandingPage({ onLoginSuccess, classes, setClasses, refreshClasses, showSearchGuide, openModal }) {

  const [modalMode, setModalMode] = useState(null); // 'role', 'login', 'signup', 'student-login'
  const [portalView, setPortalView] = useState(null); // 'parent' or 'student'
  // Responsive state
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  // Teacher Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student/Parent Access State
  const [accessCode, setAccessCode] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Translation hook must be called unconditionally at top-level
  const { t } = useTranslation();

  React.useEffect(() => {
    if (openModal === 'signup') setModalMode('signup');
    if (openModal === 'login') setModalMode('login');
  }, [openModal]);

  // Resize handler for responsive styles
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // --- 1. TEACHER AUTH HANDLERS ---
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    try {
      await api.register({ email, password, name });
      setModalMode('verify-email-info');
      setError('');
    } catch (err) { setError(err.message); }
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.login({ email, password });
      if (resp.token) {
        api.setToken(resp.token);
        onLoginSuccess({ ...resp.user, token: resp.token });
      }
    } catch (err) { setError(err.message); }
  };

  // --- 2. STUDENT LOGIN HANDLER (THE FIX) ---
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    // Normalize code input
    const cleanCode = accessCode.replace(/[^0-9]/g, '');

    if (cleanCode.length < 5) return setError('Enter 5-digit code.');
    setLoading(true);

    try {
      // Step A: Check local classes prop first (Fastest)
      let foundStudent = null;
      let foundClass = null;

      if (classes && classes.length > 0) {
        for (const c of classes) {
          const s = c.students?.find(stud => String(stud.accessCode) === cleanCode);
          if (s) {
            foundStudent = s;
            foundClass = c;
            break;
          }
        }
      }

      // Step B: If not found locally, ask the API (Crucial for fresh devices)
      if (!foundStudent) {
        const remoteData = await api.getStudentByCode(cleanCode, 'student');
        if (remoteData) {
          foundStudent = {
            id: remoteData.studentId,
            name: remoteData.studentName,
            accessCode: cleanCode
          };
          // CRITICAL FIX: The API returns the FULL class data. 
          // We must update the global state so StudentPortal can see assignments.
          if (remoteData.classData) {
            foundClass = remoteData.classData;
            // Inject this class into the global app state
            if (setClasses) {
              setClasses([remoteData.classData]);
            }
          }
        }
      }

      if (foundStudent && foundClass) {
        // Step C: Save Session & Switch View
        const sessionData = {
          studentId: String(foundStudent.id),
          studentName: foundStudent.name,
          accessCode: cleanCode,
          classId: String(foundClass.id)
        };

        localStorage.setItem('classABC_student_portal', JSON.stringify(sessionData));
        setLoading(false);
        setModalMode(null); // Close modal
        setPortalView('student'); // Switch to Portal Component
      } else {
        setError('Invalid student code or class not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. RENDER PORTALS BASED ON STATE ---
  if (portalView === 'parent') {
    return <ParentPortal onBack={() => setPortalView(null)} />;
  }

  if (portalView === 'student') {
    return (
      <StudentPortal
        onBack={() => setPortalView(null)}
        classes={classes}
        setClasses={setClasses}
        refreshClasses={refreshClasses}
      />
    );
  }

  return (
    <div style={modernStyles.container}>
      <div style={modernStyles.meshBackground}></div>

      {/* --- NAVBAR --- */}
      <nav style={{ ...modernStyles.nav, ...(isMobile ? modernStyles.navMobile : {}) }}>
        <div style={{ ...modernStyles.logo, ...(isMobile ? { maxWidth: '150px' } : {}) }}>
          <ClassABCLogo />
        </div>
        <div style={{ ...modernStyles.navActions, ...(isMobile ? { gap: '8px' } : {}) }}>
          <LanguageSelector />
          <button className="lp-nav-link" onClick={showSearchGuide} style={{ ...modernStyles.loginLink, ...(isMobile ? { fontSize: '13px', padding: '6px 10px' } : {}) }}>{t('nav.help')}</button>
          <button className="lp-nav-link" onClick={() => setModalMode('role')} style={{ ...modernStyles.loginLink, ...(isMobile ? { fontSize: '13px', padding: '6px 10px' } : {}) }}>{t('nav.login')}</button>
          <button className="lp-signup-btn" onClick={() => setModalMode('signup')} style={{ ...modernStyles.signupBtn, ...(isMobile ? modernStyles.signupBtnMobile : {}) }}>{t('nav.signup')}</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section style={{ ...modernStyles.heroSection, ...(isMobile ? modernStyles.heroSectionMobile : {}) }}>
        <div style={modernStyles.heroContent}>
          <div style={modernStyles.tagBadge}>
            <Star size={14} fill="#4CAF50" color="#4CAF50" />
            {t('hero.tag')}
          </div>
          <h1 style={{ ...modernStyles.heroTitle, ...(isMobile ? modernStyles.heroTitleMobile : {}) }}>
            {t('hero.title.line1')} <br />
            <span style={modernStyles.gradientText}>{t('hero.title.gradient')}</span>
          </h1>
          <p style={{ ...modernStyles.heroSubText, ...(isMobile ? modernStyles.heroSubTextMobile : {}) }}>{t('hero.subtext')}</p>
          <div style={modernStyles.heroBtnGroup}>
            <MotionButton className="lp-cta" onClick={() => setModalMode('signup')} style={modernStyles.mainCta}>
              {t('cta.create_class')} <ArrowRight size={18} />
            </MotionButton>
          </div>
        </div>

        {/* --- LIVE APP SIMULATOR --- */}
        <div style={{ ...modernStyles.mockupWrapper, ...(isMobile ? modernStyles.mockupWrapperMobile : {}) }}>
          <div style={modernStyles.appWindow}>
            <div style={modernStyles.appSidebar}>
              <div style={modernStyles.sidebarIconActive}><Layout size={20} /></div>
              <div style={modernStyles.sidebarIcon}><Trophy size={20} /></div>
              <div style={modernStyles.sidebarIcon}><Settings size={20} /></div>
            </div>
            <div style={modernStyles.appContent}>
              <div style={modernStyles.appHeader}>
                <span style={{ fontWeight: 800 }}>Class 4-B</span>
                <div style={modernStyles.eggRoadBar}>
                  <div style={modernStyles.eggFill}></div>
                  <span style={modernStyles.eggText}>🥚 Progess 85%</span>
                </div>
              </div>
              <div style={{ ...modernStyles.appGrid, ...(isMobile ? modernStyles.appGridMobile : {}) }}>
                {['Pablo', 'Marie', 'Albert', 'Frida', 'Leo', 'Ada'].map((name, i) => (
                  <MotionCard key={i} className="lp-app-card" style={modernStyles.appCard}>
                    <div style={modernStyles.appAvatar}>{name[0]}</div>
                    <div style={modernStyles.appName}>{name}</div>
                    <div style={modernStyles.appScore}>+{(i + 2) * 3}</div>
                  </MotionCard>
                ))}
              </div>
              <div style={modernStyles.appFab}><Dices size={20} /></div>
            </div>
          </div>
          <div style={modernStyles.blob1}></div>
          <div style={modernStyles.blob2}></div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <div style={{ ...modernStyles.bentoGrid, ...(isMobile ? modernStyles.bentoGridMobile : {}) }}>
        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, background: 'linear-gradient(135deg, #F0FDF4 0%, #fff 100%)' }}>
          <div style={modernStyles.iconBoxGreen}><GaugeCircle size={28} color="#16A34A" /></div>
          <h3>{t('features.meter.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.meter.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxOrange}><Dices size={28} color="#EA580C" /></div>
          <h3>{t('features.lucky.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.lucky.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxBlue}><BarChart3 size={28} color="#2563EB" /></div>
          <h3>{t('features.reports.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.reports.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxPurple}><Ghost size={28} color="#7C3AED" /></div>
          <h3>{t('features.avatars.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.avatars.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxBlue}><ClipboardList size={28} color="#F59E42" /></div>
          <h3>{t('features.studio.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.studio.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxGreen}><QrCode size={28} color="#0EA5E9" /></div>
          <h3>{t('features.codes.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.codes.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxOrange}><Timer size={28} color="#16A34A" /></div>
          <h3>{t('features.timer.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.timer.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxBlue}><Bell size={28} color="#F59E42" /></div>
          <h3>{t('features.buzzer.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.buzzer.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxPurple}><Layout size={28} color="#7C3AED" /></div>
          <h3>{t('features.whiteboard.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.whiteboard.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxGreen}><MessageSquare size={28} color="#16A34A" /></div>
          <h3>{t('features.grading.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.grading.desc')}</p>
        </MotionCard>

        <div style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxOrange}><Users size={28} color="#EA580C" /></div>
          <h3>{t('features.mgmt.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.mgmt.desc')}</p>
        </div>

        <div style={modernStyles.bentoCard}>
          <div style={modernStyles.iconBoxBlue}><Settings size={28} color="#2563EB" /></div>
          <h3>{t('features.settings.title')}</h3>
          <p style={modernStyles.bentoText}>{t('features.settings.desc')}</p>
        </div>
      </div>

      {/* --- FOOTER CTA --- */}
      <section style={modernStyles.ctaSection}>
        <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>{t('cta.ready')}</h2>
        <MotionButton className="lp-cta" onClick={() => setModalMode('signup')} style={modernStyles.mainCta}>
          {t('cta.join_today')}
        </MotionButton>
      </section>

      {/* --- MODAL SYSTEM --- */}
      {modalMode && (
        <div style={modernStyles.overlay}>
          <div style={{ ...modernStyles.modernModal, ...(isMobile ? modernStyles.modernModalMobile : {}) }}>
            <div style={modernStyles.modalHeader}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>
                  {modalMode === 'role' ? t('modal.who') :
                    modalMode === 'student-login' ? t('role.student') :
                      modalMode === 'signup' ? t('auth.create_btn') : t('auth.login_btn')}
                </h2>
              </div>
              <div onClick={() => setModalMode(null)} style={modernStyles.closeBtn}><X size={20} /></div>
            </div>

            {/* 1. ROLE SELECTION */}
            {modalMode === 'role' && (
                <div style={modernStyles.roleGrid}>
                <div onClick={() => setModalMode('login')} className="lp-role-option" style={modernStyles.roleOption}>
                  <div style={{ ...modernStyles.roleIcon, background: '#E8F5E9' }}><GraduationCap color="#4CAF50" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.teacher')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.teacher.desc')}</p>
                  </div>
                </div>
                <div onClick={() => setPortalView('parent')} className="lp-role-option" style={modernStyles.roleOption}>
                  <div style={{ ...modernStyles.roleIcon, background: '#FFF1F2' }}><Heart color="#FF5252" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.parent')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.parent.desc')}</p>
                  </div>
                </div>
                <div onClick={() => setModalMode('student-login')} className="lp-role-option" style={modernStyles.roleOption}>
                  <div style={{ ...modernStyles.roleIcon, background: '#E0F2F1' }}><BookOpen color="#009688" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.student')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.student.desc')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. STUDENT LOGIN FORM */}
            {modalMode === 'student-login' && (
              <form onSubmit={handleStudentLogin} style={modernStyles.authForm}>
                {error && <div style={modernStyles.errorBanner}>{error}</div>}
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '10px' }}>{t('student.instructions')}</p>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="0 0 0 0 0"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  style={{
                    ...modernStyles.modernInput,
                    ...(isMobile ? modernStyles.modernInputMobile : {}),
                    textAlign: 'center',
                    fontSize: isMobile ? '20px' : '24px',
                    letterSpacing: isMobile ? '3px' : '5px',
                    fontWeight: 'bold'
                  }}
                  autoFocus
                />
                <MotionButton className="lp-cta" type="submit" disabled={loading} style={{ ...modernStyles.mainCta, ...(isMobile ? modernStyles.mainCtaMobile : {}) }}>
                  {loading ? t('student.verifying') : t('student.enter')}
                </MotionButton>
                <p onClick={() => setModalMode('role')} style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', cursor: 'pointer' }}>{t('nav.back')}</p>
              </form>
            )}

            {/* 3. TEACHER AUTH FORMS */}
            {(modalMode === 'signup' || modalMode === 'login') && (
              <form onSubmit={modalMode === 'signup' ? handleSignup : handleTeacherLogin} style={modernStyles.authForm}>
                {error && <div style={modernStyles.errorBanner}>{error}</div>}
                {modalMode === 'signup' && <input placeholder={t('auth.fullname')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}) }} onChange={e => setName(e.target.value)} required />}
                <input type="email" placeholder={t('auth.email')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}) }} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder={t('auth.password')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}) }} onChange={e => setPassword(e.target.value)} required />
                {modalMode === 'signup' && <input type="password" placeholder={t('auth.confirm')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}) }} onChange={e => setConfirmPassword(e.target.value)} required />}

                <MotionButton className="lp-cta" type="submit" style={{ ...modernStyles.mainCta, ...(isMobile ? modernStyles.mainCtaMobile : {}), width: '100%', justifyContent: 'center' }}>
                  {modalMode === 'signup' ? t('auth.create_btn') : t('auth.login_btn')}
                </MotionButton>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', marginTop: '15px' }}>
                  {modalMode === 'signup' ? t('auth.already') : t('auth.newhere')}
                  {' '}
                  <span onClick={() => setModalMode(modalMode === 'signup' ? 'login' : 'signup')} style={{ color: '#16A34A', cursor: 'pointer', fontWeight: 800, marginLeft: '5px' }}>
                    {modalMode === 'signup' ? t('auth.login') : t('auth.create_account')}
                  </span>
                </p>
              </form>
            )}

            {modalMode === 'verify-email-info' && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <h2 style={{ color: '#4CAF50', marginBottom: 16 }}>{t('auth.account_created') || 'Account Created!'}</h2>
                <p style={{ fontSize: 16, marginBottom: 16 }}>
                  {t('auth.verify_msg') || 'Please check your email and click the verification link to activate your account.'}<br />
                  {t('auth.verify_block') || 'You will not be able to log in until your email is verified.'}
                </p>
                <button onClick={() => setModalMode('login')} style={{ ...modernStyles.mainCta, marginTop: 16 }}>{t('auth.goto_login') || 'Go to Login'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- MODERN 2026 STYLES ---
const modernStyles = {
  container: { background: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1A1A1A', overflowX: 'hidden' },
  meshBackground: { position: 'fixed', inset: 0, background: 'radial-gradient(at 0% 0%, rgba(76, 175, 80, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.08) 0, transparent 50%)', zIndex: -1 },
  nav: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(252, 252, 252, 0.68)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.04)' },
  // logo: { fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  // logoTag: { background: '#1A1A1A', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '8px', marginLeft: '8px', fontWeight: 700 },
  navActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' },
  loginLink: { background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px', padding: '8px 12px', borderRadius: '8px' },
  signupBtn: { background: '#1A1A1A', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
  heroSection: { display: 'flex', alignItems: 'center', gap: '60px', padding: '38px 60px', maxWidth: '1400px', margin: '0 auto', minHeight: '520px' },
  heroContent: { flex: 1 },
  tagBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', color: '#15803D', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 700, marginBottom: '25px', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.1)' },
  heroTitle: { fontSize: '72px', fontWeight: 950, lineHeight: 1, letterSpacing: '-2px', margin: 0, color: '#09090bff' },
  gradientText: { background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubText: { fontSize: '18px', color: '#64748B', maxWidth: '520px', margin: '30px 0', lineHeight: 1.6 },
  heroBtnGroup: { display: 'flex', gap: '15px' },
  mockupWrapper: { flex: 1.2, position: 'relative', display: 'flex', justifyContent: 'center' },
  appWindow: { width: '100%', maxWidth: '650px', height: '400px', background: '#fff', borderRadius: '24px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 },
  appSidebar: { width: '70px', background: '#F8FAFC', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '20px' },
  sidebarIconActive: { color: '#16A34A', background: '#DCFCE7', padding: '10px', borderRadius: '12px' },
  sidebarIcon: { color: '#94A3B8', padding: '10px' },
  appContent: { flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' },
  appHeader: { padding: '15px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  eggRoadBar: { background: '#F0FDF4', padding: '6px 15px', borderRadius: '20px', width: '200px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' },
  eggFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '85%', background: '#4CAF50', opacity: 0.2 },
  eggText: { fontSize: '11px', fontWeight: 800, color: '#15803D', zIndex: 1, width: '100%', textAlign: 'center' },
  appGrid: { padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', overflow: 'hidden' },
  appCard: { border: '1px solid #E2E8F0', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  appAvatar: { width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' },
  appName: { fontSize: '12px', fontWeight: 700 },
  appScore: { background: '#DCFCE7', color: '#15803D', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' },
  appFab: { position: 'absolute', bottom: '20px', right: '20px', width: '50px', height: '50px', background: '#1A1A1A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
  blob1: { position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, #BBF7D0 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, opacity: 0.6 },
  blob2: { position: 'absolute', bottom: '-50px', left: '0px', width: '250px', height: '250px', background: 'radial-gradient(circle, #BFDBFE 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, opacity: 0.6 },
  section: { padding: '100px 60px', maxWidth: '1300px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: '60px' },
  sectionTitle: { fontSize: '42px', fontWeight: 900, marginBottom: '15px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' },
  bentoCard: { background: '#fff', border: '1px solid #E2E8F0', padding: '40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', cursor: 'default' },
  iconBoxGreen: { width: '60px', height: '60px', background: '#DCFCE7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxOrange: { width: '60px', height: '60px', background: '#FFEDD5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxBlue: { width: '60px', height: '60px', background: '#DBEAFE', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxPurple: { width: '60px', height: '60px', background: '#F3E8FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  bentoText: { fontSize: '15px', fontWeight: 600, color: '#64748B', lineHeight: 1.6, marginTop: '10px' },
  ctaSection: { textAlign: 'center', padding: '0 20px 100px' },
  mainCta: { width: '100%', background: '#1A1A1A', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '16px', fontSize: '20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',justifyContent: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modernModal: { width: '480px', background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  closeBtn: { padding: '8px', background: '#F1F5F9', borderRadius: '50%', cursor: 'pointer' },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  roleOption: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderRadius: '20px', background: '#fff', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
  roleIcon: { width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  modernInput: { padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '15px', outline: 'none' },
  modernInputMobile: { padding: '12px', borderRadius: '12px', fontSize: '14px' },
  errorBanner: { background: '#FEF2F2', color: '#EF4444', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textAlign: 'center' },
  logo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    maxWidth: '420px',
    width: 'auto'
  },
  logoMobile: { maxWidth: '240px' },
  // Mobile specific variants
  navMobile: { padding: '12px 16px', flexWrap: 'wrap' },
  signupBtnMobile: { padding: '8px 12px', borderRadius: '8px', fontSize: '13px' },
  heroSectionMobile: { flexDirection: 'column', padding: '25px 20px', minHeight: 'auto' },
  heroTitleMobile: { fontSize: '34px', lineHeight: 1.05 },
  heroSubTextMobile: { fontSize: '15px', maxWidth: '100%', margin: '12px 0' },
  mockupWrapperMobile: { display: 'none' },
  appGridMobile: { gridTemplateColumns: 'repeat(2, 1fr)' },
  bentoGridMobile: { gridTemplateColumns: 'repeat(1, 1fr)' },
  bentoCardMobile: { padding: '20px', borderRadius: '18px' },
  modernModalMobile: { width: 'calc(100% - 40px)', padding: '18px' },
  mainCtaMobile: { padding: '12px 18px', fontSize: '14px' },
};