/* eslint-disable no-unused-vars */
/* eslint-disable no-dupe-keys */
import React, { useEffect, useState, useRef } from 'react';
import {
  Dices, Trophy, Settings, Home, UserPlus, Camera, SmilePlus,
  ChevronLeft, ChevronRight, Sliders, ChevronDown, ArrowUpDown,
  CheckSquare, BarChart2, QrCode, ClipboardList, Maximize, Minimize, MessageSquare, Clock, CheckCircle, Siren, Zap
} from 'lucide-react';
import ReportsPage from './ReportsPage';
import StudentCard from './StudentCard';
import BehaviorModal from './BehaviorModal';
import LuckyDrawModal from './LuckyDrawModal';
import AddStudentModal from './AddStudentModal';
import SafeAvatar from './SafeAvatar';
import { PointAnimation } from './PointAnimation';
import { boringAvatar, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';
import api from '../services/api';
import InboxPage from './InboxPage'; // ⚡ NEW IMPORT: Ensure this file exists
import KidTimer from './KidTimer';
import Whiteboard from './Whiteboard'; // Import the new component
import { Presentation } from 'lucide-react'; // Wide board icon
import AssignmentsPage from './AssignmentsPage'; // Add this line at the top
import AccessCodesPage from './AccessCodesPage'; // Add this line
import SettingsPage from './SettingsPage';
import InlineHelpButton from './InlineHelpButton';

// Helper component for Sidebar Icons
const SidebarIcon = ({ icon: Icon, label, onClick, isActive, badge, style }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        onClick={onClick}
        style={{ ...style, color: isActive ? '#4CAF50' : style?.color || '#636E72' }}
      />
      {badge}
      {hovered && (
        <div style={{
          position: 'absolute',
          left: '60px', // Pushes it to the right of the sidebar
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#2D3436',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '8px',
          zIndex: 2000,
          whiteSpace: 'nowrap',
          fontSize: '14px',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 2000,
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

export default function ClassDashboard({
  activeClass,
  behaviors,
  onBack,
  onOpenEggRoad,
  onOpenSettings,
  updateClasses,
  onOpenAssignments
}) {
  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentAvatar, setEditStudentAvatar] = useState(null);
  const [editSelectedSeed, setEditSelectedSeed] = useState(null);
  const [showEditAvatarPicker, setShowEditAvatarPicker] = useState(false);
  const [hoveredEditChar, setHoveredEditChar] = useState(null);
  const [deleteConfirmStudentId, setDeleteConfirmStudentId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [displaySize, setDisplaySize] = useState('big');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showClassBehaviorModal, setShowClassBehaviorModal] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showPoint, setShowPoint] = useState({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' });
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [absentStudents, setAbsentStudents] = useState(new Set());
  
  const [showCodesPage, setShowCodesPage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  // Toggle Function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  // ... existing states ...
  const [showSortMenu, setShowSortMenu] = useState(false); // ⚡ NEW: Toggle for sort menu
  const [sortBy, setSortBy] = useState('name'); // ⚡ NEW: 'name' or 'score'

  // ⚡ NEW: Helper to get students in the correct order
  const getSortedStudents = () => {
    if (!activeClass || !activeClass.students) return [];
    const students = [...activeClass.students]; // Create a copy to sort safely

    if (sortBy === 'name') {
      return students.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'score') {
      // Sort by score (Highest first), fallback to 0 if undefined
      return students.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    return students;
  };
  // Sync state if user presses 'Esc' key
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);
  // --- BUZZER STATE ---
  const [buzzerState, setBuzzerState] = useState('idle'); // 'idle', 'counting', 'buzzing'
  const [buzzerCount, setBuzzerCount] = useState(5);
  const audioCtxRef = useRef(null);
  const mainOscRef = useRef(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const startBuzzerSequence = () => {
    initAudio();
    setBuzzerState('counting');
    setBuzzerCount(5);
  };

  const stopBuzzer = () => {
    if (mainOscRef.current) {
      mainOscRef.current.stop();
      mainOscRef.current = null;
    }
    setBuzzerState('idle');
  };
  // --- SUBMISSIONS & MESSAGES STATE ---
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'messages'
  const [submissions, setSubmissions] = useState([]);
  const [, setLoadingSubmissions] = useState(false);

  // 1. Fetch fresh data from PocketBase
  const fetchFreshSubmissions = async () => {
    if (!activeClass || !activeClass.id) return;
    setLoadingSubmissions(true);
    try {
      const data = await api.pbRequest(
        `/collections/submissions/records?filter=(class_id='${activeClass.id}')&sort=-created`
      );
      setSubmissions(data.items || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // 2. Handle Grading (Passed to InboxPage)
  const handleGradeSubmit = async (submissionId, gradeValue) => {
    try {
      await api.pbRequest(`/collections/submissions/records/${submissionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ grade: gradeValue, status: 'graded' })
      });
      // Refresh local data so the UI updates instantly
      await fetchFreshSubmissions();
    } catch (err) {
      console.error("Grade submit failed", err);
      alert("Failed to save grade. Check console.");
    }
  };

  const generate5DigitCode = () => Math.floor(10000 + Math.random() * 90000).toString();

  useEffect(() => {
    if (!showGridMenu) return;
    const t = setTimeout(() => setShowGridMenu(false), 2000);
    return () => clearTimeout(t);
  }, [showGridMenu]);
  // Handle Countdown Logic
  useEffect(() => {
    let timer;
    if (buzzerState === 'counting') {
      if (buzzerCount > 0) {
        // --- LOUDER COUNTDOWN "BEEP" ---
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'square'; // Harsher, more audible wave
        osc.frequency.value = 1200; // Piercing high pitch
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime); // Louder volume
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.2);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.2);
        timer = setTimeout(() => setBuzzerCount(buzzerCount - 1), 1000);
      } else {
        // --- EXTREME CONTINUOUS ALARM ---
        setBuzzerState('buzzing');

        // Dual oscillators create a "beating" effect that is physically harder to ignore
        const osc1 = audioCtxRef.current.createOscillator();
        const osc2 = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = 180; // Low buzz
        osc2.frequency.value = 184; // Slight offset creates jarring vibration

        const lfo = audioCtxRef.current.createOscillator();
        const lfoGain = audioCtxRef.current.createGain();
        lfo.frequency.value = 8; // Faster "wah-wah" modulation
        lfoGain.gain.value = 40;
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        gain.gain.value = 0.4; // Significantly Louder

        osc1.start();
        osc2.start();
        lfo.start();
        mainOscRef.current = { stop: () => { osc1.stop(); osc2.stop(); lfo.stop(); } };
      }
    }
    return () => clearTimeout(timer);
  }, [buzzerState, buzzerCount]);
  const ensureCodesAndOpen = () => {
    const currentAccessCodes = typeof activeClass.Access_Codes === 'object' && activeClass.Access_Codes !== null
      ? activeClass.Access_Codes
      : {};

    let needsUpdate = false;
    const updatedCodesObject = { ...currentAccessCodes };

    activeClass.students.forEach(s => {
      if (!updatedCodesObject[s.id]) {
        needsUpdate = true;
        updatedCodesObject[s.id] = {
          parentCode: generate5DigitCode(),
          studentCode: generate5DigitCode()
        };
      }
    });

    if (needsUpdate) {
      updateClasses(prev => prev.map(c =>
        c.id === activeClass.id ? { ...c, Access_Codes: updatedCodesObject } : c
      ));
    }
    setShowCodesPage(true);
  };

  // --- STUDENT MANAGEMENT HANDLERS ---
  const handleEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name || '');
    setEditStudentAvatar(student.avatar || null);
    setEditSelectedSeed(null);
  };

  const handleSaveStudentEdit = () => {
    if (!editStudentName.trim()) return;
    const finalAvatar =
      editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : undefined);

    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) =>
              s.id === editingStudentId ? { ...s, name: editStudentName, avatar: finalAvatar } : s
            )
          }
          : c
      )
    );

    setEditingStudentId(null);
    setEditStudentName('');
    setEditStudentAvatar(null);
    setEditSelectedSeed(null);
  };

  const handleDeleteStudent = (student) => {
    updateClasses((prev) =>
      prev.map((c) => {
        if (c.id === activeClass.id) {
          const updatedCodes = { ...(c.Access_Codes || {}) };
          delete updatedCodes[student.id];
          return {
            ...c,
            students: c.students.filter((s) => s.id !== student.id),
            Access_Codes: updatedCodes
          };
        }
        return c;
      })
    );
    setDeleteConfirmStudentId(null);
  };

  const handleGivePoint = (behavior) => {
    if (!selectedStudent) return;
    const today = new Date().toISOString().split('T')[0];
    if (selectedStudent.attendance === 'absent' && selectedStudent.attendanceDate === today) {
      return;
    }
    setShowPoint({ visible: true, student: selectedStudent, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    setTimeout(() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' }), 2000);
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) => {
              if (s.id === selectedStudent.id) {
                const newLog = {
                  label: behavior.label,
                  pts: behavior.pts,
                  type: behavior.type,
                  timestamp: new Date().toISOString()
                };
                return {
                  ...s,
                  score: s.score + behavior.pts,
                  history: [...(s.history || []), newLog]
                };
              }
              return s;
            })
          }
          : c
      )
    );
    setSelectedStudent(null);
  };

  const handleGivePointsToClass = (behavior) => {
    setShowPoint({ visible: true, student: { name: 'Whole Class', students: activeClass.students }, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    setTimeout(() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' }), 2000);
    updateClasses((prev) =>
      prev.map((c) => (c.id === activeClass.id ? { ...c, students: c.students.map((s) => ({ ...s, score: s.score + behavior.pts })) } : c))
    );
    setShowClassBehaviorModal(false);
  };
  // --- SURGICAL ADDITION FOR LUCKY DRAW MULTI-WINNERS ---
  const handleGivePointsToMultiple = (studentsArray, points = 1) => {

    // 1. Trigger the animation for the whole group
    setShowPoint({
      visible: true,
      student: { name: `${studentsArray.length} Winners`, students: studentsArray },
      points: points,
      behaviorEmoji: '🎉'
    });

    setTimeout(() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' }), 2000);

    // 2. Update all selected students in the database/state at once
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) => {
              // Check if this student is in our winners array
              const isWinner = studentsArray.find(w => w.id === s.id);
              if (isWinner) {
                return {
                  ...s,
                  score: s.score + points,
                  history: [...(s.history || []), {
                    label: 'Lucky Draw Winner',
                    pts: points,
                    type: 'wow',
                    timestamp: new Date().toISOString()
                  }]
                };
              }
              return s;
            })
          }
          : c
      )
    );
  };
  if (!activeClass) return <div style={styles.layout}>No class selected</div>;
  // Sum up all points from all students safely
  const totalClassPoints = activeClass?.students?.reduce((acc, s) => acc + (Number(s.score) || 0), 0) || 0;
  // --- CONDITIONAL RENDERS FOR SUB-PAGES ---

  return (
    <>
      <div style={styles.layout}>
        {/* --- SIDEBAR --- */}
        <nav
          style={{
            ...styles.sidebar,
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            zIndex: 1000,
            transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            boxShadow: sidebarVisible ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {/* User Initial Circle */}


          <SidebarIcon
            icon={Home}
            label="Back to Dashboard"
            onClick={() => { onBack(); setViewMode('dashboard'); }}
            style={styles.icon}
          />

          <SidebarIcon
            icon={ClipboardList}
            label="Assignments"
            onClick={() => setViewMode('assignments')} // Change this
            isActive={viewMode === 'assignments'}      // Change this
          />

          <SidebarIcon
            icon={MessageSquare}
            label="Messages & Grading"
            onClick={() => {
              setViewMode('messages');      // 1. Switch the view mode
              fetchFreshSubmissions();     // 2. Refresh data from PocketBase
            }}
            isActive={viewMode === 'messages'}
            style={styles.icon}
            badge={(
              <>
                {submissions.filter(s => s.status === 'submitted').length > 0 && (
                  <span style={styles.badge}>
                    {submissions.filter(s => s.status === 'submitted').length}
                  </span>
                )}
              </>
            )}
          />

          <SidebarIcon
            icon={Dices}
            label="Lucky Draw"
            onClick={() => setIsLuckyDrawOpen(true)}
            style={styles.icon}
          />

          <SidebarIcon
            icon={Trophy}
            label="Progess Road"
            onClick={onOpenEggRoad}
            style={styles.icon}
          />

          <SidebarIcon
            icon={CheckSquare}
            label="Attendance"
            onClick={() => setIsAttendanceMode(!isAttendanceMode)}
            isActive={isAttendanceMode}
            style={styles.icon}
          />



          <SidebarIcon
            icon={QrCode}
            label="Access Codes"
            onClick={() => {
              ensureCodesAndOpen(); // This handles logic
              setViewMode('codes'); // This handles the view
            }}
            isActive={viewMode === 'codes'}
            style={styles.icon}
          />

          <SidebarIcon
            icon={BarChart2}
            label="Reports"
            onClick={() => {
              setViewMode('reports');
              updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, isViewingReports: true } : c));
            }}
            isActive={viewMode === 'reports'}
            style={styles.icon}
          />
          <SidebarIcon
            icon={Clock}
            label="Class Timer"
            onClick={() => setViewMode('timer')}
            isActive={viewMode === 'timer'}
            style={styles.icon}
          />
          <SidebarIcon
            icon={Siren}
            label="Attention Buzzer"
            onClick={startBuzzerSequence}
            style={{ ...styles.icon, color: buzzerState !== 'idle' ? '#FF5252' : '#636E72' }}
          />
          <SidebarIcon
            icon={Presentation}
            label="Whiteboard"
            onClick={() => setShowWhiteboard(true)}
            style={styles.icon}
          />
          <SidebarIcon
            icon={Settings}
            label="Settings"
            onClick={() => setViewMode('settings')} // Change this
            isActive={viewMode === 'settings'}     // Change this
            style={styles.icon}
          />

        </nav>

        {viewMode !== 'messages' && (
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            style={{
              position: 'fixed',
              left: sidebarVisible ? '80px' : '0',
              top: '20px',
              zIndex: 999,
              background: 'white',
              border: 'none',
              borderRadius: '0 8px 8px 0',
              width: '28px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {sidebarVisible ? <ChevronLeft size={19} /> : <ChevronRight size={16} />}
          </button>
        )}

        {/* BUZZER OVERLAY */}
        {buzzerState !== 'idle' && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999, // On top of everything
            background: buzzerState === 'buzzing' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: buzzerState === 'buzzing' ? 'pulseRed 0.5s infinite alternate' : 'none'
          }}>
            <style>{`
      @keyframes pulseRed { from { background: rgba(255, 0, 0, 0.1); } to { background: rgba(255, 0, 0, 0.3); } }
      @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `}</style>

            <div style={{
              textAlign: 'center',
              color: 'white',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              {buzzerState === 'counting' ? (
                <>
                  <div style={{ fontSize: '180px', fontWeight: '900', textShadow: '0 0 50px rgba(99, 102, 241, 0.5)' }}>
                    {buzzerCount}
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '4px', opacity: 0.8 }}>EYES ON ME</p>
                </>
              ) : (
                <>
                  <Zap size={100} color="#FFD700" style={{ marginBottom: '20px' }} />
                  <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '40px' }}>ATTENTION!</h1>
                  <button
                    onClick={stopBuzzer}
                    style={{
                      padding: '24px 60px',
                      borderRadius: '30px',
                      border: 'none',
                      background: 'white',
                      color: 'red',
                      fontSize: '24px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    I'M LISTENING
                  </button>
                </>
              )}

            </div>

          </div>
        )}
        <main style={{ ...styles.content, marginLeft: sidebarVisible ? '80px' : '0', transition: 'margin-left 0.3s ease' }}>

          {/* 1. MESSAGES VIEW */}
          {viewMode === 'messages' ? (
            <InboxPage
              activeClass={activeClass}
              submissions={submissions}
              onGradeSubmit={handleGradeSubmit} // Uses the grading logic in Dashboard
              onBack={() => setViewMode('dashboard')} // Closes the window
            />
          ) /* 2. ⚡ WIDER TIMER VIEW ⚡ */
            : viewMode === 'timer' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: '#F4F1EA',
                padding: '40px'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '800px', // Much wider container
                  background: 'white',
                  padding: '60px',
                  borderRadius: '40px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    background: '#EEF2FF',
                    padding: '12px 24px',
                    borderRadius: '20px',
                    color: '#4F46E5',
                    fontWeight: '800',
                    marginBottom: '40px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Clock size={20} /> CLASS TIMER
                  </div>

                  {/* The Updated KidTimer handles the width internally now */}
                  <KidTimer onClose={() => setViewMode('students')} // Now the 'X' will work
                    onComplete={() => ("Time is up! 🎉")} />

                </div>
              </div>
            ) :  /* 3. REPORTS VIEW */
              viewMode === 'reports' ? (
                <ReportsPage
                  activeClass={activeClass}
                  onBack={() => setViewMode('dashboard')}
                />
              ) : viewMode === 'assignments' ? (
                <AssignmentsPage
                  activeClass={activeClass}
                  onBack={() => setViewMode('dashboard')}
                  onPublish={(data) => {
                    // This logic replaces the "missing" onOpenAssignments
                    updateClasses(prev => prev.map(c =>
                      c.id === activeClass.id
                        ? { ...c, assignments: [...(c.assignments || []), data] }
                        : c
                    ));
                    // Go back after publishing
                    setViewMode('dashboard');
                  }}
                />
              ) : viewMode === 'codes' ? ( // Add this block
                <AccessCodesPage
                  activeClass={activeClass}
                  onBack={() => setViewMode('dashboard')}
                />
              ) : viewMode === 'settings' ? (
                <SettingsPage
                  activeClass={activeClass}

                  behaviors={activeClass.behaviors || behaviors}
                  onBack={() => setViewMode('dashboard')}
                  onUpdateBehaviors={(newBehaviorsList) => {
                    // ⚡ FIX: Safely update the class with the new array of cards
                    updateClasses(prevClasses => prevClasses.map(c =>
                      c.id === activeClass.id
                        ? { ...c, behaviors: newBehaviorsList }
                        : c
                    ));
                  }}
                />) : (
                /* 3. STANDARD DASHBOARD VIEW (Default) */

                <>
                  <header style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          {activeClass.name}
                        </h2>
                        <InlineHelpButton pageId="class-dashboard" />
                      </div>
                      {isAttendanceMode && (
                        <span style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>
                          ATTENDANCE
                        </span>
                      )}

                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setShowSortMenu(!showSortMenu)}
                          onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
                          onMouseLeave={(e) => e.target.style.background = '#fff'}
                          style={{
                            ...styles.actionBtn, // Re-uses your existing button shape
                            background: '#fff',
                            color: '#475569',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          <ArrowUpDown size={18} /> Sort
                        </button>

                        {showSortMenu && (
                          <div style={styles.gridMenu}> {/* Re-uses your existing menu style */}
                            <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Sort By</div>

                            <button
                              onClick={() => { setSortBy('name'); setShowSortMenu(false); }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                              onMouseLeave={(e) => e.currentTarget.style.background = sortBy === 'name' ? '#EEF2FF' : 'transparent'}
                              style={{
                                ...styles.gridOption,
                                background: sortBy === 'name' ? '#EEF2FF' : 'transparent',
                                color: sortBy === 'name' ? '#6366F1' : '#475569'
                              }}
                            >
                              Name (A-Z)
                              {sortBy === 'name' && <CheckCircle size={16} />}
                            </button>

                            <button
                              onClick={() => { setSortBy('score'); setShowSortMenu(false); }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                              onMouseLeave={(e) => e.currentTarget.style.background = sortBy === 'score' ? '#EEF2FF' : 'transparent'}
                              style={{
                                ...styles.gridOption,
                                background: sortBy === 'score' ? '#EEF2FF' : 'transparent',
                                color: sortBy === 'score' ? '#6366F1' : '#475569'
                              }}
                            >
                              Highest Points
                              {sortBy === 'score' && <CheckCircle size={16} />}
                            </button>
                          </div>
                        )}
                      </div>
                      {/* Layout / Grid Menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setShowGridMenu(!showGridMenu)}
                          onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
                          onMouseLeave={(e) => e.target.style.background = '#fff'}
                          style={{
                            ...styles.actionBtn,
                            background: '#fff',
                            color: '#475569',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          <Sliders size={18} /> Layout
                        </button>

                        {showGridMenu && (
                          <div style={styles.gridMenu}>
                            <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Display Size</div>
                            {['small', 'medium', 'big'].map((size) => (
                              <button
                                key={size}
                                onClick={() => { setDisplaySize(size); setShowGridMenu(false); }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F8FAFC';
                                  e.currentTarget.style.transform = 'translateX(4px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = displaySize === size ? '#EEF2FF' : 'transparent';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                }}
                                style={{
                                  ...styles.gridOption,
                                  background: displaySize === size ? '#EEF2FF' : 'transparent',
                                  color: displaySize === size ? '#6366F1' : '#475569'
                                }}
                              >
                                {size.charAt(0).toUpperCase() + size.slice(1)} View
                                {displaySize === size && <CheckCircle size={16} />}
                              </button>

                            ))}
                          </div>
                        )}
                      </div>


                      {/* FLOATING FULLSCREEN TOGGLE */}
                      <button
                        onClick={toggleFullscreen}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1) translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          bottom: 'auto',
                          right: 'auto',
                          width: '60px',
                          height: '60px',
                          borderRadius: '20px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',

                          cursor: 'pointer',
                          zIndex: 9999, // Stays above everything including the Buzzer
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          color: isFullscreen ? '#6366F1' : '#475569'
                        }}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                      >
                        {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
                      </button>
                    </div>

                  </header>

                  <div className="student-cards-container" style={{
                    display: 'grid', gap: displaySize === 'small' ? '12px' : '28px', gridTemplateColumns: displaySize === 'small'
                      ? 'repeat(auto-fill, minmax(140px, 1fr))'
                      : displaySize === 'medium'
                        ? 'repeat(auto-fill, minmax(200px, 1fr))'
                        : 'repeat(auto-fill, minmax(280px, 1fr))',
                    // ⚡ FIX: Use a fixed gap so it doesn't expand when the sidebar closes
                    gap: '20px',
                    padding: '20px',
                    width: '100%',
                    alignContent: 'start', // Keeps rows tight at the top
                    justifyContent: 'start'
                  }}>
                    <div style={{ position: 'relative', minWidth: 0, aspectRatio: '1 / 1', display: 'flex' }}>
                      <div onClick={() => setShowClassBehaviorModal(true)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(99, 102, 241, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(99, 102, 241, 0.4)';
                        }} style={styles.actionBtn}>
                        <div style={{ position: 'relative', minWidth: 0, aspectRatio: '1 / 1', display: 'flex' }}>
                          <div onClick={() => setShowClassBehaviorModal(true)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(99, 102, 241, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(99, 102, 241, 0.4)';
                            }}
                            style={styles.actionBtn}>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <SmilePlus size={60} />
                              <div style={{ marginTop: 12, fontWeight: '900', fontSize: '1.2rem' }}>Whole Class</div>

                              {/* ⚡ TOTAL CLASS POINTS DISPLAY ⚡ */}
                              <div style={{
                                marginTop: '15px',
                                padding: '4px 14px',
                                background: 'rgba(0, 0, 0, 0.2)', // Darker translucent for readability
                                borderRadius: '20px',
                                fontSize: '25px',
                                fontWeight: '800',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(12px)'
                              }}>
                                <Trophy size={18} color="#FFD700" fill="#FFD700" />
                                {totalClassPoints.toLocaleString()} Pts
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                    {getSortedStudents().map((s) => {
                      const today = new Date().toISOString().split('T')[0];
                      const isAbsentToday = absentStudents.has(s.id) || (s.attendance === 'absent' && s.attendanceDate === today);
                      return (

                        <div
                          key={s.id}
                          onClick={(event) => {
                            if (isAttendanceMode) {
                              const next = new Set(absentStudents);
                              if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                              setAbsentStudents(next);
                            } else if (event?.ctrlKey || event?.metaKey) {
                              const next = new Set(selectedStudents);
                              if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                              setSelectedStudents(next);
                            } else if (!isAbsentToday) {
                              setSelectedStudent(s);
                            }
                          }}
                          style={{
                            position: 'relative',
                            opacity: isAttendanceMode ? (isAbsentToday ? 0.4 : 1) : (isAbsentToday ? 0.4 : (selectedStudents.size > 0 && !selectedStudents.has(s.id) ? 0.5 : 1)),
                            transition: 'opacity 0.15s, filter 0.15s',
                            cursor: isAttendanceMode ? 'pointer' : isAbsentToday ? 'not-allowed' : 'default',
                            filter: isAbsentToday ? 'grayscale(1)' : 'grayscale(0)',
                            pointerEvents: 'auto'
                          }}
                        >
                          <StudentCard student={s} onClick={() => { if (isAttendanceMode) { const next = new Set(absentStudents); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); setAbsentStudents(next); } else if (!isAbsentToday) { setSelectedStudent(s); } }} onEdit={handleEditStudent} onDelete={() => setDeleteConfirmStudentId(s.id)} />
                          {selectedStudents.has(s.id) && <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', border: '3px solid #4CAF50', pointerEvents: 'none' }} />}
                          {isAbsentToday && !isAttendanceMode && <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', border: '3px solid #FF9800', background: 'rgba(255, 152, 0, 0.1)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>ABSENT TODAY</div>}
                        </div>
                      );
                    })}
                    <div style={{ position: 'relative', minWidth: 0, aspectRatio: '1 / 1', display: 'flex' }}>
                      <div onClick={() => setIsAddStudentOpen(true)} className="add-student-button" style={{ background: 'white', border: '2px dashed #ddd', borderRadius: 16, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '90%', height: '90%', transition: 'transform 0.2s' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <UserPlus size={40} />
                          <div style={{ marginTop: 8, fontWeight: '700' }}>Add Student</div>

                        </div>

                      </div>
                    </div>

                  </div>
                </>
              )}
        </main>
        {/* MODALS */}
        {selectedStudent && <BehaviorModal student={selectedStudent} behaviors={activeClass.behaviors || behaviors} onClose={() => setSelectedStudent(null)} onGivePoint={handleGivePoint} />}
        {showClassBehaviorModal && <BehaviorModal student={{ name: 'Whole Class' }} behaviors={activeClass.behaviors || behaviors} onClose={() => setShowClassBehaviorModal(false)} onGivePoint={handleGivePointsToClass} />}
        {/* {isLuckyDrawOpen && <LuckyDrawModal students={activeClass.students} onClose={() => setIsLuckyDrawOpen(false)} onWinner={(s) => { setIsLuckyDrawOpen(false); setSelectedStudent(s); }} />} */}
        {isLuckyDrawOpen && (
          <LuckyDrawModal
            students={activeClass.students}
            onClose={() => setIsLuckyDrawOpen(false)}
            onWinner={(winnerData) => {
              // If it's an array (2+ students), use our new multi-handler
              if (Array.isArray(winnerData)) {
                handleGivePointsToMultiple(winnerData, 1);
              } else {
                // If it's just one student, use your existing single handler
                setSelectedStudent(winnerData);
              }
              setIsLuckyDrawOpen(false);
            }}
          />
        )}

        {/* ⚡ OLD GRADING MODAL IS GONE - CLEANER CODE! ⚡ */}

        {isAddStudentOpen && (
          <AddStudentModal
            onClose={() => setIsAddStudentOpen(false)}
            onSave={(newStudent) => {
              const studentId = Date.now();
              const newCodes = { parentCode: generate5DigitCode(), studentCode: generate5DigitCode() };
              updateClasses((prev) => prev.map((c) => c.id === activeClass.id ? { ...c, students: [...c.students, { ...newStudent, id: studentId, score: 0 }], Access_Codes: { ...(c.Access_Codes || {}), [studentId]: newCodes } } : c));
              setIsAddStudentOpen(false);
            }}
          />
        )}

        {/* EDIT STUDENT MODAL */}
        {editingStudentId && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={{ marginBottom: 16 }}>Edit Student</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                <SafeAvatar src={editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : boringAvatar(editStudentName || 'anon', 'boy'))} name={editStudentName} alt={editStudentName} style={{ width: 100, height: 100, borderRadius: 50, objectFit: 'cover', background: '#F8FAFC' }} />
                <div style={{ marginTop: 10 }}><Camera size={14} /></div>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => { setEditStudentAvatar(reader.result); setEditSelectedSeed(null); }; reader.readAsDataURL(file); } }} style={{ marginTop: 12 }} />
                <div style={{ marginTop: 12, position: 'relative' }}>
                  <button onClick={() => setShowEditAvatarPicker(!showEditAvatarPicker)} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#475569', transition: 'all 0.2s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{editSelectedSeed ? (<><img src={avatarByCharacter(editSelectedSeed)} alt={editSelectedSeed} style={{ width: 24, height: 24, borderRadius: 4 }} /><span style={{ textTransform: 'capitalize' }}>{editSelectedSeed}</span></>) : ('Choose character...')}</span>
                    <ChevronDown size={18} style={{ transform: showEditAvatarPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {showEditAvatarPicker && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '-110%', right: '-110%', marginBottom: '8px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1001, padding: '16px', minWidth: '550px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', justifyItems: 'center', width: '100%' }}>
                        {AVATAR_OPTIONS.map((char) => (
                          <button key={char.name} onClick={() => { setEditSelectedSeed(char.name); setEditStudentAvatar(null); setShowEditAvatarPicker(false); }} onMouseEnter={() => setHoveredEditChar(char.name)} onMouseLeave={() => setHoveredEditChar(null)} style={{ background: 'white', border: editSelectedSeed === char.name ? '2px solid #4CAF50' : '2px solid #e9ecef', borderRadius: 10, padding: 8, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 9, color: '#666', fontWeight: 500, outline: 'none', width: '70px', justifySelf: 'center', ...(hoveredEditChar === char.name ? { transform: 'scale(1.15)', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' } : {}), ...(editSelectedSeed === char.name ? { boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' } : {}) }} title={char.label}>
                            <img src={avatarByCharacter(char.name)} alt={char.label} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', ...(hoveredEditChar === char.name ? { transform: 'scale(5)', position: 'absolute', bottom: 'calc(100% - 80px)', left: '50%', marginLeft: '-20px', zIndex: 20 } : {}) }} />
                            <span style={{ fontSize: 8, color: '#999', textTransform: 'capitalize' }}>{char.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <input autoFocus placeholder="Student name" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }} onKeyDown={(e) => e.key === 'Enter' && handleSaveStudentEdit()} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditingStudentId(null); setEditStudentName(''); setEditStudentAvatar(null); setEditSelectedSeed(null); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveStudentEdit} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#4CAF50', color: 'white' }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmStudentId && (
          <div style={styles.overlay}>
            <div style={{ ...styles.modal, width: 360 }}>
              <h3 style={{ marginBottom: 12 }}>Delete Student?</h3>
              <p style={{ color: '#666' }}>Are you sure you want to delete <strong>'{activeClass.students.find((s) => s.id === deleteConfirmStudentId)?.name}'</strong>?</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setDeleteConfirmStudentId(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white' }}>Cancel</button>
                <button onClick={() => handleDeleteStudent(activeClass.students.find((s) => s.id === deleteConfirmStudentId))} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#FF6B6B', color: 'white' }}>Delete</button>
              </div>
            </div>
          </div>
        )}
        {showWhiteboard && (
          <Whiteboard onClose={() => setShowWhiteboard(false)} />
        )}
        <PointAnimation isVisible={showPoint.visible} studentAvatar={showPoint.student?.avatar} studentName={showPoint.student?.name} students={showPoint.student?.students} points={showPoint.points} behaviorEmoji={showPoint.behaviorEmoji} onComplete={() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' })} />
      </div>

    </>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#F4F1EA', position: 'relative', overflow: 'hidden' },
  sidebar: { width: '80px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '30px 0', borderRight: '1px solid #ddd' },
  icon: { cursor: 'pointer', transition: 'color 0.2s', position: 'relative' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease', height: '100vh', overflowY: 'auto' },
  // header: { maxWidth: '1200px',padding: '0 20px', background: 'linear-gradient(90deg,#fff,#F8FFF8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 6px 18px rgba(16,24,40,0.06)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  addBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  // actionBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  // gridMenu: { position: 'absolute', top: '50px', right: 0, background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '220px' },
  // gridOption: { display: 'block', width: '100%', textAlign: 'left', padding: '10px', marginBottom: 6, borderRadius: 8, cursor: 'pointer', border: '1px solid #ddd' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { background: 'white', padding: '24px', borderRadius: '16px', width: '500px' },
  badge: { position: 'absolute', top: '-5px', right: '-5px', background: '#FF5252', color: 'white', width: '18px', height: '18px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  // REPLACE THESE KEYS IN YOUR styles OBJECT:
  // SURGICAL STYLE UPDATES
  header: {
    padding: '5px 20px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px', // Constrain width for symmetry
    marginLeft: '16px',
    width: '100%',
    borderRadius: '24px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxSizing: 'border-box',
    zIndex: 10 // Ensure header stays below dropdowns if needed, but above content
  },

  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '18px',
    cursor: 'pointer',
    width: '92%', height: '92%',
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '0.5px',
    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0)'
    , justifyContent: 'center',
  },

  gridMenu: {
    position: 'absolute',
    top: '70px',
    right: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
    borderRadius: '24px',
    padding: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
    zIndex: 9999, // IMPORTANT: Put this on top of everything
    minWidth: '240px',
    border: '1px solid #fff'
  },

  gridOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    textAlign: 'left',
    padding: '14px 18px',
    marginBottom: '6px',
    borderRadius: '16px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontWeight: '700',
    color: '#475569',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
}