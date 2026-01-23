/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight, Trophy, Star, BookOpen, Ghost, LogOut,
  CheckCircle, Clock, AlertCircle, Globe
} from 'lucide-react';
import InlineHelpButton from './InlineHelpButton';
import StudentWorksheetSolver from './StudentWorksheetSolver';

const translations = {
  en: {
    logout: "Logout", refresh: "Refresh", points: "Total Points",
    completed: "Completed", todo: "To Do", title: "My Assignments",
    questions: "Questions", done: "Done", open: "Open",
    hideTask: "Hide Task?", hideWarn: "This will remove the assignment from your dashboard. You won't be able to see it again.",
    cancel: "Cancel", yesHide: "Yes, Hide it", noAsn: "No assignments yet!",
    refreshPrompt: 'If your teacher just sent one, click "Refresh".',
    langToggle: "中文"
  },
  zh: {
    logout: "登出", refresh: "刷新", points: "总积分",
    completed: "已完成", todo: "待办", title: "我的作业项目",
    questions: "个问题", done: "完成", open: "开启",
    hideTask: "隐藏任务？", hideWarn: "这将从您的仪表板中删除该作业。您将无法再次看到它。",
    cancel: "取消", yesHide: "是的，隐藏它", noAsn: "暂无作业！",
    refreshPrompt: "如果老师刚发送了作业，请点击“刷新”。",
    langToggle: "English"
  }
};

const StudentPortal = ({ onBack, classes = [], refreshClasses }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeWorksheet, setActiveWorksheet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // For the modern modal
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  // 1. SESSION & STORAGE
  const session = useMemo(() => {
    try {
      const saved = localStorage.getItem('classABC_student_portal');
      return saved ? JSON.parse(saved) : null;
    // eslint-disable-next-line no-unused-vars
    } catch (e) { return null; }
  }, []);

  const [completedAssignments, setCompletedAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('classABC_completed_assignments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [hiddenAssignments, setHiddenAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('classABC_hidden_assignments');
      return saved ? JSON.parse(saved) : [];
    // eslint-disable-next-line no-unused-vars
    } catch (e) { return []; }
  });

  // 2. DATA SCANNER (With Sorting & Hiding Logic)
  const { liveClass, studentAssignments, currentStudent } = useMemo(() => {
    if (!session || !classes.length) return { liveClass: null, studentAssignments: [], currentStudent: null };

    const sId = String(session.studentId);
    let foundClass = classes.find(c => c.students?.some(stud => String(stud.id) === sId));
    if (!foundClass) return { liveClass: null, studentAssignments: [], currentStudent: null };

    const assignments = (foundClass.assignments || [])
      .filter(asm => {
        if (!asm || hiddenAssignments.includes(asm.id)) return false; // REMOVE HIDDEN ITEMS
        const isGlobal = asm.assignedToAll === true || asm.assignedTo === 'all' || !asm.assignedTo;
        const isSpecific = Array.isArray(asm.assignedTo) && asm.assignedTo.some(id => String(id) === sId);
        return isGlobal || isSpecific;
      })
      .sort((a, b) => {
        // SORTING: Newest on top
        const dateA = new Date(b.created || b.id).getTime();
        const dateB = new Date(a.created || a.id).getTime();
        return dateA - dateB;
      });

    return { 
      liveClass: foundClass, 
      studentAssignments: assignments, 
      currentStudent: foundClass.students?.find(s => String(s.id) === sId) 
    };
  }, [classes, session, hiddenAssignments]);

  // 3. CORRECT TO-DO CALCULATION (Prevents negative numbers)
  const todoCount = studentAssignments.filter(asm => !completedAssignments.includes(asm.id)).length;
  const completedCount = studentAssignments.filter(asm => completedAssignments.includes(asm.id)).length;

  const handleHideAssignment = () => {
    if (!deleteTarget) return;
    const newHidden = [...hiddenAssignments, deleteTarget];
    setHiddenAssignments(newHidden);
    localStorage.setItem('classABC_hidden_assignments', JSON.stringify(newHidden));
    setDeleteTarget(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('classABC_student_portal');
    onBack();
  };

  if (activeWorksheet) {
    return (
      <StudentWorksheetSolver
        lang={lang}
        worksheet={activeWorksheet}
        onClose={() => setActiveWorksheet(null)}
        studentName={currentStudent?.name || session.studentName}
        studentId={currentStudent?.id || session.studentId}
        classId={liveClass?.id}
        onCompletion={(id) => {
          const newList = [...completedAssignments, id];
          setCompletedAssignments(newList);
          localStorage.setItem('classABC_completed_assignments', JSON.stringify(newList));
        }}
      />
    );
  }

  return (
    <div className="student-portal" style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .student-portal .topBar { padding: 12px 16px !important; }
        .student-portal h2 { font-size: 18px !important; }
        .student-portal .StatCard { padding: 12px !important; }
        @media (max-width: 768px) {
          .student-portal { padding-bottom: 80px; }
          .student-portal .topBar { flex-direction: column; gap: 8px; align-items: flex-start; }
          .student-portal .scrollArea { padding: 12px !important; }
          .student-portal .workstation { padding: 12px !important; }
        }
      `}</style>
      
      {/* --- MODERN HIDE MODAL --- */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#FEF2F2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
              <AlertCircle size={40} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>{t.hideTask}</h2>
            <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '30px' }}>{t.hideWarn}</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '15px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {t.cancel}
              </button>
              <button onClick={handleHideAssignment} style={{ flex: 1, padding: '15px', borderRadius: '16px', border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {t.yesHide}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>{currentStudent?.name || session.studentName}</h2>
            <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>{liveClass?.name || 'Classroom'}</span>
          </div>
          <InlineHelpButton pageId="student-portal" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} style={{ background: '#F1F5F9', border: 'none', padding: '12px 20px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} /> {t.langToggle}
          </button>
          {/* Refresh button removed on mobile/student portal per Phase 1 UX decision */}
          <button onClick={handleLogout} style={{minWidth: isMobile ? '48px' : 'auto', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: isMobile ? '0' : '8px', padding: isMobile ? '12px' : '12px 24px', }}>
            <LogOut size={isMobile ? 22 : 18} /> {!isMobile && t.logout}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* STATS */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <StatCard icon={<Star color="#F59E0B" fill="#F59E0B" size={32} />} val={currentStudent?.score || 0} label={t.points} />
          <StatCard icon={<Trophy color="#10B981" fill="#10B981" size={32} />} val={completedCount} label={t.completed} />
          <StatCard icon={<BookOpen color="#6366F1" size={32} />} val={todoCount} label={t.todo} />
        </div>

        <h3 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen size={28} color="#6366F1" /> {t.title}
        </h3>

        {/* ASSIGNMENTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' }}>
          {studentAssignments.map((asm) => {
            const isCompleted = completedAssignments.includes(asm.id);
            return (
              <div 
                key={asm.id} 
                onClick={() => !isCompleted && setActiveWorksheet(asm)} 
                style={{ 
                  background: '#fff', padding: '28px', borderRadius: '28px', border: '1px solid #E2E8F0', 
                  cursor: isCompleted ? 'default' : 'pointer', position: 'relative', transition: 'transform 0.2s' 
                }}
              >
                {isCompleted && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(asm.id); }} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: '#F8FAFC', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: '#94A3B8' }}
                  >
                    <Ghost size={18} />
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '65px', height: '65px', background: isCompleted ? '#DCFCE7' : '#EEF2FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isCompleted ? <CheckCircle size={32} color="#10B981" /> : <BookOpen size={32} color="#4F46E5" />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 900 }}>{asm.title}</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>{asm.questions?.length || 0} {t.questions}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px', background: isCompleted ? '#DCFCE7' : '#EEF2FF', color: isCompleted ? '#16A34A' : '#4F46E5' }}>
                        {isCompleted ? t.done : t.open}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {studentAssignments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '32px', border: '2px dashed #E2E8F0' }}>
            <Ghost size={60} color="#CBD5E1" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', color: '#1E293B' }}>{t.noAsn}</h3>
            <p style={{ color: '#64748B' }}>{t.refreshPrompt}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, val, label }) => (
  <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '20px', flex: '1', minWidth: '250px' }}>
    {icon}
    <div>
      <div style={{ fontSize: '32px', fontWeight: 900 }}>{val}</div>
      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  </div>
);

export default StudentPortal;