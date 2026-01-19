import React, { useState } from 'react';
import { ChevronLeft, CheckCircle, X, Award, MessageSquare } from 'lucide-react';
import InlineHelpButton from './InlineHelpButton';

const InboxPage = ({ submissions, onGradeSubmit, onBack }) => {
  const [selectedSub, setSelectedSub] = useState(null);
  const [grade, setGrade] = useState('');

  const pending = submissions.filter(s => s.status === 'submitted');
  const graded = submissions.filter(s => s.status === 'graded');

  const handleSelect = (sub) => {
    setSelectedSub(sub);
    setGrade(sub.grade || '');
  };

  const submit = async () => {
    await onGradeSubmit(selectedSub.id, grade);
    setSelectedSub(null);
  };

  return (
    
    <div style={pageStyles.container}>
      
      {/* MAIN GRADING AREA */}
      <div style={pageStyles.main}>
        {selectedSub ? (
          <div style={pageStyles.workstation}>
            <header style={pageStyles.workHeader}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{selectedSub.student_name}</h1>
                <p style={{ color: '#666' }}>{selectedSub.assignment_title}</p>
              </div>

              <div style={pageStyles.badge}>{selectedSub.status}</div>
            </header>

            <div style={pageStyles.contentBody}>
              <h3 style={pageStyles.sectionTitle}>Student Responses</h3>
              {Object.entries(selectedSub.answers || {}).map(([, a], i) => (
                <div key={i} style={pageStyles.answerBox}>
                  <div style={pageStyles.qNum}>Question {i + 1}</div>
                  <div style={{ fontSize: '16px', lineHeight: '1.6' }}>{a}</div>
                </div>
              ))}
            </div>

            <footer style={pageStyles.gradingBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Award color="#4CAF50" />
                <input
                  type="text"
                  placeholder="Points (e.g. 95/100)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={pageStyles.gradeInput}
                />
              </div>
              <button onClick={submit} style={pageStyles.submitBtn}>Save Grade & Send</button>
            </footer>
          </div>
        ) : (
          <div style={pageStyles.emptyState}>
            <MessageSquare size={48} color="#DDD" />
            <p>Select a submission to start grading</p>
          </div>
        )}
      </div>
      
     <div style={pageStyles.sidebar}>
      
      <div style={pageStyles.sidebarHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Inbox</h2>
          <InlineHelpButton pageId="inbox" />
        </div>
        <div style={pageStyles.closeBtn}>
          <button onClick={onBack} style={pageStyles.closeBtn}>
            <X size={20} />
          </button>
        </div>
      </div>

        <div style={pageStyles.scrollArea}>
          <SectionLabel label="Waiting for Review" count={pending.length} color="#FF4757" />
          {pending.map(sub => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              active={selectedSub?.id === sub.id}
              onClick={() => handleSelect(sub)}
            />
          ))}

          <div style={{ marginTop: '30px' }} />
          <SectionLabel label="Recently Graded" count={graded.length} color="#4CAF50" />
          {graded.map(sub => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              active={selectedSub?.id === sub.id}
              onClick={() => handleSelect(sub)}
              isGraded
            />
          ))}
        </div>
      </div>

    </div>
  );
};

// Helper Components
const SectionLabel = ({ label, count, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginBottom: '10px' }}>
    <span style={{ fontSize: '12px', fontWeight: 700, color: '#999', textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontSize: '12px', fontWeight: 700, color }}>{count}</span>
  </div>
);

const SubmissionCard = ({ sub, active, onClick, isGraded }) => (
  <div
    onClick={onClick}
    style={{
      ...pageStyles.card,
      borderLeft: active ? '4px solid #4A90E2' : '4px solid transparent',
      background: active ? '#F0F7FF' : 'white',
      opacity: isGraded ? 0.7 : 1
    }}
  >
    <div style={{ fontWeight: 700 }}>{sub.student_name}</div>
    <div style={{ fontSize: '12px', color: '#666' }}>{sub.assignment_title}</div>
    {isGraded && <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '5px' }}>Grade: {sub.grade}</div>}
  </div>
);

const pageStyles = {
  container: { display: 'flex', height: '100%', width: '100%', background: '#F8F9FA', position: 'relative', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, flexDirection: 'row' },
  sidebar: { width: '200px', background: '#FFF', borderRight: '1px solid #EEE', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { 
    padding: '20px', 
    borderBottom: '1px solid #EEE',
    display: 'flex',
    justifyContent: 'space-between', // Pushes Inbox title left, X button right
    alignItems: 'center'
  },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '20px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: '#F8F9FA' },
  closeBtn: {
    background: '#F1F5F9',
    color: '#64748B',
    border: 'none',
    padding: '8px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  }, card: { padding: '15px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' },
  workstation: { display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%', padding: '40px' },
  workHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  badge: { padding: '4px 12px', borderRadius: '20px', background: '#E3F2FD', color: '#1976D2', fontSize: '12px', fontWeight: 'bold' },
  contentBody: { flex: 1, overflowY: 'auto', paddingRight: '10px' },
  answerBox: { background: '#FFF', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #EEE' },
  qNum: { fontSize: '12px', fontWeight: 800, color: '#4A90E2', marginBottom: '10px', textTransform: 'uppercase' },
  gradingBar: { background: '#FFF', padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -10px 30px rgba(0,0,0,0.05)', marginTop: '20px' },
  gradeInput: { border: 'none', fontSize: '18px', fontWeight: 700, width: '150px', outline: 'none' },
  submitBtn: { background: '#000', color: '#FFF', padding: '12px 24px', borderRadius: '14px', border: 'none', fontWeight: 700, cursor: 'pointer' },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }
};

export default InboxPage;