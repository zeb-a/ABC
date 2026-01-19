import React, { useState } from 'react';
import {
  X, ArrowRight, Trophy, Heart, BookOpen, Star, Layout, ClipboardList, Dices, BarChart3, Ghost, GraduationCap, Timer, KeyRound
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../i18n';
import api from '../services/api';
import ParentPortal from './ParentPortal';
import StudentPortal from './StudentPortal';

// --- VISUAL THUMBNAIL PLACEHOLDER ---
const FeatureThumb = ({ label, icon, desc, style }) => (
  <div style={{
    background: '#F8FAFC', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.07)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140, minHeight: 140, flex: 1, ...style
  }}>
    <div style={{ marginBottom: 12 }}>{icon}</div>
    <div style={{ fontWeight: 800, fontSize: 15, color: '#1A1A1A', textAlign: 'center', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center', minHeight: 36 }}>{desc}</div>
    <div style={{ marginTop: 14, width: '100%', height: 60, background: 'repeating-linear-gradient(135deg,#E0E7EF 0 8px, #F8FAFC 8px 16px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: 12 }}>
      <span>Screenshot<br />Coming Soon</span>
    </div>
  </div>
);

export default function Index({ onLoginSuccess, classes, setClasses, refreshClasses, showSearchGuide, openModal }) {
  const [modalMode, setModalMode] = useState(null);
  const [portalView, setPortalView] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useTranslation();

  React.useEffect(() => {
    if (openModal === 'signup') setModalMode('signup');
    if (openModal === 'login') setModalMode('login');
  }, [openModal]);

  // --- AUTH HANDLERS (same as LandingPage) ---
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
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    const cleanCode = accessCode.replace(/[^0-9]/g, '');
    if (cleanCode.length < 5) return setError('Enter 5-digit code.');
    setLoading(true);
    try {
      let foundStudent = null;
      let foundClass = null;
      if (classes && classes.length > 0) {
        for (const c of classes) {
          const s = c.students?.find(stud => String(stud.accessCode) === cleanCode);
          if (s) { foundStudent = s; foundClass = c; break; }
        }
      }
      if (!foundStudent) {
        const remoteData = await api.getStudentByCode(cleanCode, 'student');
        if (remoteData) {
          foundStudent = { id: remoteData.studentId, name: remoteData.studentName, accessCode: cleanCode };
          if (remoteData.classData) {
            foundClass = remoteData.classData;
            if (setClasses) setClasses([remoteData.classData]);
          }
        }
      }
      if (foundStudent && foundClass) {
        const sessionData = { studentId: String(foundStudent.id), studentName: foundStudent.name, accessCode: cleanCode, classId: String(foundClass.id) };
        localStorage.setItem('class123_student_portal', JSON.stringify(sessionData));
        setLoading(false); setModalMode(null); setPortalView('student');
      } else {
        setError('Invalid student code or class not found.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally { setLoading(false); }
  };

  if (portalView === 'parent') return <ParentPortal onBack={() => setPortalView(null)} />;
  if (portalView === 'student') return <StudentPortal onBack={() => setPortalView(null)} classes={classes} setClasses={setClasses} refreshClasses={refreshClasses} />;

  return (
    <div style={styles.container}>
      <div style={styles.meshBackground}></div>
      {/* --- NAVBAR --- */}
      <nav style={styles.nav}>
        <div style={styles.logo}>ClassABC <span style={styles.logoTag}>2030</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSelector />
          <div style={styles.navActions}>
            <button onClick={showSearchGuide} style={{ ...styles.loginLink, marginRight: 8 }}>Help</button>
            <button onClick={() => setModalMode('role')} style={styles.loginLink}>Login</button>
            <button onClick={() => setModalMode('signup')} style={styles.signupBtn}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.tagBadge}><Star size={14} fill="#4CAF50" color="#4CAF50" />
            The Future of Classrooms
          </div>
          <h1 style={styles.heroTitle}>
            Effortless Engagement.<br />
            <span style={styles.gradientText}>Real Results.</span>
          </h1>
          <p style={styles.heroSubText}>
            Welcome to the all-in-one platform that makes teaching, learning, and classroom management a joy. Instantly reward, track, and inspire every student—no training required.
          </p>
          <div style={styles.heroBtnGroup}>
            <button onClick={() => setModalMode('signup')} style={styles.mainCta}>
              Get Started Free <ArrowRight size={18} />
            </button>
          </div>
        </div>
        {/* --- FEATURE THUMBNAILS --- */}
        <div style={styles.featureThumbsRow}>
          <FeatureThumb label="Live Class Dashboard" icon={<Layout size={34} color="#4F46E5" />} desc="See every student at a glance. Award points, track attendance, and manage your class in real time." />
          <FeatureThumb label="Instant Reports" icon={<BarChart3 size={34} color="#2563EB" />} desc="Visualize progress, participation, and growth. Export beautiful reports for parents and admins." />
          <FeatureThumb label="Lucky Draw & Egg Road" icon={<Dices size={34} color="#EA580C" />} desc="Gamify your classroom! Random rewards and class-wide goals keep students excited every day." />
        </div>
        <div style={{ ...styles.featureThumbsRow, marginTop: 18 }}>
          <FeatureThumb label="Access Codes" icon={<KeyRound size={34} color="#0EA5E9" />} desc="Secure, simple logins for every student and parent. No more forgotten passwords!" />
          <FeatureThumb label="Focus Timer" icon={<Timer size={34} color="#16A34A" />} desc="Boost productivity with built-in timers for activities, tests, and breaks." />
          <FeatureThumb label="Assignment Studio" icon={<ClipboardList size={34} color="#F59E42" />} desc="Create, assign, and grade digital worksheets in seconds. Instant feedback for every student." />
        </div>
      </section>

      {/* --- FEATURE SHOWCASE --- */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Everything You Need, All in One Place</h2>
        </div>
        <div style={styles.bentoGrid}>
          <div style={styles.bentoCard}>
            <div style={styles.iconBoxGreen}><Trophy size={28} color="#16A34A" /></div>
            <h3>Instant Motivation</h3>
            <p style={styles.bentoText}>Award points, badges, and rewards in real time. Watch engagement soar as students compete and collaborate.</p>
          </div>
          <div style={styles.bentoCard}>
            <div style={styles.iconBoxOrange}><Dices size={28} color="#EA580C" /></div>
            <h3>Gamified Learning</h3>
            <p style={styles.bentoText}>Lucky Draw, Egg Road, and class-wide goals keep every lesson exciting. Celebrate effort, not just results.</p>
          </div>
          <div style={styles.bentoCard}>
            <div style={styles.iconBoxBlue}><BarChart3 size={28} color="#2563EB" /></div>
            <h3>Real-Time Insights</h3>
            <p style={styles.bentoText}>Visualize growth, attendance, and participation at a glance. Export beautiful reports for parents and admins.</p>
          </div>
          <div style={styles.bentoCard}>
            <div style={styles.iconBoxPurple}><Ghost size={28} color="#7C3AED" /></div>
            <h3>Personalized Avatars</h3>
            <p style={styles.bentoText}>Custom avatars and flexible settings for every teaching style and age group. Make every student feel seen.</p>
          </div>
          <div style={styles.bentoCard}>
            <div style={styles.iconBoxBlue}><ClipboardList size={28} color="#F59E42" /></div>
            <h3>Assignment Studio</h3>
            <p style={styles.bentoText}>Create, assign, and grade digital worksheets in seconds. Instant feedback for every student.</p>
          </div>
          <div style={styles.bentoCard}>
            <div style={styles.iconBoxGreen}><KeyRound size={28} color="#0EA5E9" /></div>
            <h3>Secure Access Codes</h3>
            <p style={styles.bentoText}>No more forgotten passwords! Secure, simple logins for every student and parent.</p>
          </div>
          <div style={styles.bentoCard}>
            <div style={styles.iconBoxOrange}><Timer size={28} color="#16A34A" /></div>
            <h3>Focus Timer</h3>
            <p style={styles.bentoText}>Boost productivity with built-in timers for activities, tests, and breaks.</p>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>What Educators Are Saying</h2>
        </div>
        <div style={styles.testimonialRow}>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>
              “ClassABC is the first app my whole staff actually loves. It’s so easy, even my least techy teachers use it every day.”
            </p>
            <div style={styles.testimonialAuthor}>— Ms. Chen, Principal</div>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>
              “My students beg to see their points and spin the Lucky Draw. I’ve never seen them so motivated!”
            </p>
            <div style={styles.testimonialAuthor}>— Mr. Smith, Grade 4</div>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialText}>
              “Setup took 2 minutes. Now I can focus on teaching, not admin.”
            </p>
            <div style={styles.testimonialAuthor}>— Ms. Patel, Math Teacher</div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section style={styles.ctaSection}>
        <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>Ready to transform your classroom?</h2>
        <button onClick={() => setModalMode('signup')} style={styles.mainCta}>
          Join ClassABC Free
        </button>
      </section>

      {/* --- MODAL SYSTEM --- */}
      {modalMode && (
        <div style={styles.overlay}>
          <div style={styles.modernModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>
                  {modalMode === 'role' ? 'Who are you?' :
                    modalMode === 'student-login' ? 'Student Login' :
                      modalMode === 'signup' ? 'Create Account' : 'Login'}
                </h2>
              </div>
              <div onClick={() => setModalMode(null)} style={styles.closeBtn}><X size={20} /></div>
            </div>
            {/* 1. ROLE SELECTION */}
            {modalMode === 'role' && (
              <div style={styles.roleGrid}>
                <div onClick={() => setModalMode('login')} style={styles.roleOption}>
                  <div style={{ ...styles.roleIcon, background: '#E8F5E9' }}><GraduationCap color="#4CAF50" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>Teacher</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Manage your class, assignments, and rewards.</p>
                  </div>
                </div>
                <div onClick={() => setPortalView('parent')} style={styles.roleOption}>
                  <div style={{ ...styles.roleIcon, background: '#FFF1F2' }}><Heart color="#FF5252" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>Parent</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>See your child’s progress and celebrate wins.</p>
                  </div>
                </div>
                <div onClick={() => setModalMode('student-login')} style={styles.roleOption}>
                  <div style={{ ...styles.roleIcon, background: '#E0F2F1' }}><BookOpen color="#009688" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>Student</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Check your points, assignments, and rewards.</p>
                  </div>
                </div>
              </div>
            )}
            {/* 2. STUDENT LOGIN FORM */}
            {modalMode === 'student-login' && (
              <form onSubmit={handleStudentLogin} style={styles.authForm}>
                {error && <div style={styles.errorBanner}>{error}</div>}
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '10px' }}>Enter your 5-digit access code:</p>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="0 0 0 0 0"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  style={{ ...styles.modernInput, textAlign: 'center', fontSize: '24px', letterSpacing: '5px', fontWeight: 'bold' }}
                  autoFocus
                />
                <button type="submit" disabled={loading} style={styles.mainCta}>
                  {loading ? 'Verifying...' : 'Enter'}
                </button>
                <p onClick={() => setModalMode('role')} style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', cursor: 'pointer' }}>Back</p>
              </form>
            )}
            {/* 3. TEACHER AUTH FORMS */}
            {(modalMode === 'signup' || modalMode === 'login') && (
              <form onSubmit={modalMode === 'signup' ? handleSignup : handleTeacherLogin} style={styles.authForm}>
                {error && <div style={styles.errorBanner}>{error}</div>}
                {modalMode === 'signup' && <input placeholder="Full Name" style={styles.modernInput} onChange={e => setName(e.target.value)} required />}
                <input type="email" placeholder="Email" style={styles.modernInput} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" style={styles.modernInput} onChange={e => setPassword(e.target.value)} required />
                {modalMode === 'signup' && <input type="password" placeholder="Confirm Password" style={styles.modernInput} onChange={e => setConfirmPassword(e.target.value)} required />}
                <button type="submit" style={{ ...styles.mainCta, width: '100%', justifyContent: 'center' }}>
                  {modalMode === 'signup' ? 'Create Account' : 'Login'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', marginTop: '15px' }}>
                  {modalMode === 'signup' ? 'Already have an account?' : 'New here?'}
                  {' '}
                  <span onClick={() => setModalMode(modalMode === 'signup' ? 'login' : 'signup')} style={{ color: '#16A34A', cursor: 'pointer', fontWeight: 800, marginLeft: '5px' }}>
                    {modalMode === 'signup' ? 'Login' : 'Create Account'}
                  </span>
                </p>
              </form>
            )}

            {modalMode === 'verify-email-info' && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <h2 style={{ color: '#4CAF50', marginBottom: 16 }}>Account Created!</h2>
                <p style={{ fontSize: 16, marginBottom: 16 }}>
                  Please check your email and click the verification link to activate your account.<br />
                  You will not be able to log in until your email is verified.
                </p>
                <button onClick={() => setModalMode('login')} style={{ ...styles.mainCta, marginTop: 16 }}>Go to Login</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- MODERN 2030+ STYLES ---
const styles = {
  container: { background: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1A1A1A', overflowX: 'hidden' },
  meshBackground: { position: 'fixed', inset: 0, background: 'radial-gradient(at 0% 0%, rgba(76, 175, 80, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.08) 0, transparent 50%)', zIndex: -1 },
  nav: { padding: '20px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.04)' },
  logo: { fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' },
  logoTag: { background: '#1A1A1A', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '8px', marginLeft: '8px', fontWeight: 700 },
  navActions: { display: 'flex', gap: '20px', alignItems: 'center' },
  loginLink: { background: 'none', border: 'none', fontWeight: 700, color: '#4B5563', cursor: 'pointer', fontSize: '15px' },
  signupBtn: { background: '#1A1A1A', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', transition: 'transform 0.2s' },
  heroSection: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px', padding: '60px 5vw', maxWidth: '1400px', margin: '0 auto', minHeight: '500px' },
  heroContent: { flex: 1, minWidth: 280 },
  tagBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', color: '#15803D', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 700, marginBottom: '25px', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.1)' },
  heroTitle: { fontSize: 'clamp(2.2rem,6vw,4.5rem)', fontWeight: 950, lineHeight: 1, letterSpacing: '-2px', margin: 0, color: '#0F172A' },
  gradientText: { background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubText: { fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#64748B', maxWidth: '520px', margin: '30px 0', lineHeight: 1.6 },
  heroBtnGroup: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  featureThumbsRow: { display: 'flex', flexWrap: 'wrap', gap: '18px', marginLeft: 0, justifyContent: 'center' },
  section: { padding: '60px 5vw', maxWidth: '1300px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: '40px' },
  sectionTitle: { fontSize: 'clamp(1.5rem,4vw,2.6rem)', fontWeight: 900, marginBottom: '15px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '22px' },
  bentoCard: { background: '#fff', border: '1px solid #E2E8F0', padding: '32px', borderRadius: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'default', minWidth: 0 },
  iconBoxGreen: { width: '54px', height: '54px', background: '#DCFCE7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
  iconBoxOrange: { width: '54px', height: '54px', background: '#FFEDD5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
  iconBoxBlue: { width: '54px', height: '54px', background: '#DBEAFE', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
  iconBoxPurple: { width: '54px', height: '54px', background: '#F3E8FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
  bentoText: { fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginTop: '10px' },
  testimonialRow: { display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', marginTop: 30 },
  testimonialCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '28px', maxWidth: 340, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' },
  testimonialText: { fontSize: '16px', color: '#334155', fontStyle: 'italic', marginBottom: 14 },
  testimonialAuthor: { fontWeight: 800, color: '#4F46E5', fontSize: 14 },
  ctaSection: { textAlign: 'center', padding: '0 20px 80px' },
  mainCta: { background: '#1A1A1A', color: '#fff', border: 'none', padding: '16px 30px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modernModal: { width: '95vw', maxWidth: 480, background: '#fff', borderRadius: '32px', padding: '32px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  closeBtn: { padding: '8px', background: '#F1F5F9', borderRadius: '50%', cursor: 'pointer' },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: '13px' },
  roleOption: { display: 'flex', alignItems: 'center', gap: '18px', padding: '16px', borderRadius: '18px', background: '#fff', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
  roleIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '13px' },
  modernInput: { padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '15px', outline: 'none' },
  errorBanner: { background: '#FEF2F2', color: '#EF4444', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textAlign: 'center' },
};

// --- RESPONSIVE MEDIA QUERIES ---
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 900px) {
      .heroSection, .section { padding: 32px 2vw !important; }
      .featureThumbsRow { flex-direction: column !important; gap: 14px !important; }
      .bentoGrid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 600px) {
      .heroSection { flex-direction: column !important; gap: 24px !important; }
      .heroTitle { font-size: 2.1rem !important; }
      .sectionTitle { font-size: 1.3rem !important; }
      .mainCta { width: 100% !important; justify-content: center !important; }
    }
  `;
  document.head.appendChild(style);
}
