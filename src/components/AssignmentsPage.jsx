import React, { useState, useRef, useEffect } from 'react';
import InlineHelpButton from './InlineHelpButton';
import {
  Plus, Send, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon,
  Type, List, AlignLeft, Grid, FileText, X, GripVertical,
  Users, User, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function AssignmentsPage({ activeClass, onBack, onPublish }) {
  const [title, setTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [questions, setQuestions] = useState([
    { id: 1, type: 'text', question: '', image: null, options: [''], paragraph: '', pairs: [{ left: '', right: '' }] }
  ]);
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assignMenu, setAssignMenu] = useState('all');

  // New States
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]); // Stores IDs of empty questions

  const fileInputRef = useRef(null);
  const [activePhotoId, setActivePhotoId] = useState(null);

  const addQuestion = (type) => {
    setQuestions([...questions, {
      id: Date.now(),
      type,
      question: '',
      image: null,
      options: type === 'choice' ? ['', '', ''] : [],
      paragraph: type === 'comprehension' ? '' : '',
      pairs: type === 'match' ? [{ left: '', right: '' }, { left: '', right: '' }] : []
    }]);
    // Clear validation error when a new question is added
    setValidationErrors([]);
  };

  const handlePublish = () => {
    // Check for empty questions
    const emptyQuestionIds = questions.filter(q => !q.question.trim()).map(q => q.id);

    if (emptyQuestionIds.length > 0) {
      setValidationErrors(emptyQuestionIds);
      return;
    }

    // Clear errors
    setValidationErrors([]);

    // Show the success message UI
    setShowSuccess(true);

    // Trigger the actual publish and go back after a short delay
    setTimeout(() => {
      onPublish({
        title: title || "New Worksheet",
        questions,
        date: new Date().toISOString(),
        assignedTo: assignToAll ? 'all' : selectedStudents.map(id => String(id)),
        assignedToAll: assignToAll
      });
    }, 2500); // 1.5 second delay so they can read the message
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && activePhotoId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestions(questions.map(q => q.id === activePhotoId ? { ...q, image: reader.result } : q));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
  };

  return (
    <div style={styles.container}>
      {/* Floating Help Button */}
      <div style={{
        position: 'fixed',
        bottom: 94,
        right: -4,
        zIndex: 3000,
        boxShadow: '0 4px 16px rgba(79,70,229,0.18)',
        borderRadius: '50%',
        background: '#fff',
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #E2E8F0',
        cursor: 'pointer',
      }}>
        <InlineHelpButton pageId="assignments" />
      </div>
      {showSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: '#4CAF50',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center', // Aligns icon and text horizontally
            gap: '15px',
            boxShadow: '0 10px 25px rgba(76, 175, 80, 0.3)'
          }}>
            <CheckCircle2 size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Assignment Published!
              </span>
            </div>
          </div>
        </div>
      )}
      <header style={{
        ...styles.header,
        flexDirection: isMobile ? 'row' : 'row',
        alignItems: 'center',
        gap: isMobile ? 6 : 10,
        width: '100%',
        padding: isMobile ? '10px 6px' : styles.header.padding,
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        justifyContent: isMobile ? 'space-between' : 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: isMobile ? '1 1 0%' : undefined }}>
          <input
            style={{
              ...styles.titleInput,
              width: isMobile ? '38vw' : styles.titleInput.width,
              minWidth: isMobile ? 90 : undefined,
              marginLeft: isMobile ? 0 : styles.titleInput.marginLeft,
              flex: isMobile ? '0 1 38vw' : undefined
            }}
            placeholder="Type Worksheet title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, justifyContent: 'flex-end', flex: isMobile ? '0 0 auto' : undefined }}>
          <select
            value={assignMenu}
            onChange={e => {
              const val = e.target.value;
              setAssignMenu(val);
              if (val === 'all') {
                setAssignToAll(true);
                setSelectedStudents([]);
              } else {
                setAssignToAll(false);
                setSelectedStudents([val]);
              }
            }}
            style={{
              padding: isMobile ? '8px 10px' : '8px 16px',
              borderRadius: 10,
              border: '1.5px solid #E2E8F0',
              fontWeight: 700,
              fontSize: isMobile ? 13 : 15,
              background: '#fff',
              color: '#4F46E5',
              marginLeft: isMobile ? 0 : 12,
              minWidth: isMobile ? 60 : 90,
              boxShadow: '0 2px 8px rgba(79,70,229,0.06)',
              appearance: 'none',
              outline: 'none',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <option value="all">All</option>
            {activeClass?.students?.map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
          <button onClick={handlePublish} style={{ ...styles.publishBtn, width: isMobile ? 'auto' : undefined, padding: isMobile ? '8px 10px' : styles.publishBtn.padding, marginLeft: isMobile ? 0 : undefined }} title="Publish to Class">
            <Send size={18} />{!isMobile && ' Publish to Class'}
          </button>
          <button onClick={onBack} style={{ ...styles.backBtn, padding: isMobile ? '8px' : styles.backBtn.padding, marginLeft: isMobile ? 0 : undefined }}><X size={18} /></button>
        </div>
      </header>

      <div style={styles.workspace}>
   
        <main style={styles.canvas}>
          {/* Only show student selection list if not assigning to all and no student is selected from dropdown */}
          {!assignToAll && selectedStudents.length === 0 && (
            <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px' }}>
              <div style={styles.studentList}>
                {activeClass?.students?.map(student => (
                  <div
                    key={student.id}
                    style={{ ...styles.studentItem, background: selectedStudents.includes(student.id) ? '#EEF2FF' : '#fff', borderColor: selectedStudents.includes(student.id) ? '#4F46E5' : '#E2E8F0' }}
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    {student.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.map((q, idx) => {
            const isInvalid = validationErrors.includes(q.id);
            return (
              <div key={q.id} style={{
                ...styles.qCard,
                borderColor: isInvalid ? '#E11D48' : '#E2E8F0',
                boxShadow: isInvalid ? '0 0 0 1px #E11D48' : '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={styles.qCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <GripVertical size={16} color="#CBD5E1" />
                    <span style={styles.qNumber}>Question {idx + 1}</span>
                    <span style={styles.qBadge}>{q.type.toUpperCase()}</span>
                  </div>
                  <button onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} style={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>

                {q.type === 'comprehension' && (
                  <div style={styles.specialSection}>
                    <p style={styles.inputLabel}>Reading Passage</p>
                    <textarea
                      style={styles.paragraphInput}
                      placeholder="Type the story here..."
                      value={q.paragraph}
                      onChange={e => {
                        const newQs = [...questions];
                        newQs[idx].paragraph = e.target.value;
                        setQuestions(newQs);
                      }}
                    />
                  </div>
                )}

                <div style={{
                  ...styles.questionRow,
                  alignItems: 'flex-end',
                  gap: 10,
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ ...styles.inputLabel, color: isInvalid ? '#E11D48' : '#64748B' }}>
                      Instruction / Question
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        style={{
                          ...styles.qInput,
                          borderColor: isInvalid ? '#FECACA' : '#F1F5F9',
                          background: isInvalid ? '#FFF1F2' : '#fff',
                          flex: 1,
                          marginBottom: 0
                        }}
                        placeholder={isInvalid ? "Type your question here..." : (q.type === 'blank' ? "Use [blank] for missing words..." : "What is the question?")}
                        value={q.question}
                        onChange={e => {
                          const newQs = [...questions];
                          newQs[idx].question = e.target.value;
                          setQuestions(newQs);
                          if (e.target.value.trim()) {
                            setValidationErrors(prev => prev.filter(id => id !== q.id));
                          }
                        }}
                      />
                      <button onClick={() => { setActivePhotoId(q.id); fileInputRef.current.click(); }} style={{ ...styles.imageIconBtn, marginTop: 0, marginBottom: 0, position: 'static' }}>
                        {q.image ? <img src={q.image} style={styles.thumb} alt="" /> : <ImageIcon size={22} />}
                      </button>
                    </div>
                    {isInvalid && (
                      <div style={styles.errorText}>
                        <AlertCircle size={14} /> This question cannot be empty
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Type Specific Content (Choice/Match) remains same as original */}
                {q.type === 'choice' && (
                  <div style={styles.optionsGrid}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={styles.optionRow}>
                        <div style={styles.radioPlaceholder} />
                        <input
                          style={styles.optionInput}
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={e => {
                            const newQs = [...questions];
                            newQs[idx].options[oIdx] = e.target.value;
                            setQuestions(newQs);
                          }}
                        />
                      </div>
                    ))}
                    <button onClick={() => {
                      const newQs = [...questions];
                      newQs[idx].options.push('');
                      setQuestions(newQs);
                    }} style={styles.addSmallBtn}>+ Add Option</button>
                  </div>
                )}

                {q.type === 'match' && (
                  <div style={styles.pairsContainer}>
                    {q.pairs.map((pair, pIdx) => (
                      <div key={pIdx} style={styles.pairRow}>
                        <input placeholder="Item A" style={styles.pairInput} value={pair.left} onChange={e => { const newQs = [...questions]; newQs[idx].pairs[pIdx].left = e.target.value; setQuestions(newQs); }} />
                        <div style={styles.matchLine} />
                        <input placeholder="Match B" style={styles.pairInput} value={pair.right} onChange={e => { const newQs = [...questions]; newQs[idx].pairs[pIdx].right = e.target.value; setQuestions(newQs); }} />
                      </div>
                    ))}
                    <button onClick={() => { const newQs = [...questions]; newQs[idx].pairs.push({ left: '', right: '' }); setQuestions(newQs); }} style={styles.addSmallBtn}>+ Add Pair</button>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ height: '100px' }} />
        </main>
             {/* RETRACTABLE SIDEBAR */}
        <aside style={{
          ...styles.sidebar,
          // DESKTOP: Retractable width | MOBILE: Fixed bottom height
          width: isMobile ? '100%' : (sidebarVisible ? '200px' : '0px'),
          height: isMobile ? 'auto' : '100%',
          padding: isMobile ? '10px' : (sidebarVisible ? '24px' : '0px'),
          opacity: isMobile ? 1 : (sidebarVisible ? 1 : 0),

          // Layout change
          flexDirection: isMobile ? 'row' : 'column',
          justifyContent: isMobile ? 'space-around' : 'flex-start',

          // Positioning
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          left: 0,
          zIndex: 1000,
          borderTop: isMobile ? '1px solid #E2E8F0' : 'none',
          borderRight: isMobile ? 'none' : '1px solid #E2E8F0'
        }}>
          {/* If mobile, we show icons always. If desktop, we respect sidebarVisible */}
          {(sidebarVisible || isMobile) && (
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              width: '100%',
              justifyContent: 'space-around',
              gap: '8px'
            }}>
              {!isMobile && <p style={styles.sidebarLabel}>QUESTION TYPES</p>}

              <button onClick={() => addQuestion('text')} style={styles.typeBtn}>
                <Type size={isMobile ? 24 : 18} />
                <span style={{ fontSize: isMobile ? '10px' : 'inherit' }}>{isMobile ? 'Text' : 'Short Answer'}</span>
              </button>

              <button onClick={() => addQuestion('choice')} style={styles.typeBtn}>
                <List size={isMobile ? 24 : 18} />
                <span style={{ fontSize: isMobile ? '10px' : 'inherit' }}>{isMobile ? 'Choice' : 'Multiple Choice'}</span>
              </button>

              <button onClick={() => addQuestion('blank')} style={styles.typeBtn}>
                <AlignLeft size={isMobile ? 24 : 18} />
                <span style={{ fontSize: isMobile ? '10px' : 'inherit' }}>{isMobile ? 'Blank' : 'Fill Blanks'}</span>
              </button>

              <button onClick={() => addQuestion('match')} style={styles.typeBtn}>
                <Grid size={isMobile ? 24 : 18} />
                <span style={{ fontSize: isMobile ? '10px' : 'inherit' }}>{isMobile ? 'Match' : 'Matching'}</span>
              </button>

              <button onClick={() => addQuestion('comprehension')} style={styles.typeBtn}>
                <FileText size={isMobile ? 24 : 18} />
                <span style={{ fontSize: isMobile ? '10px' : 'inherit' }}>{isMobile ? 'Story' : 'Story'}</span>
              </button>
            </div>
          )}
        </aside>
        {/* 1. Only show this if NOT mobile (Desktop/Tablet) */}
        {!isMobile && (
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            style={{
              ...styles.retractBtn,
              // 2. Position it relative to the sidebar width
              right: sidebarVisible ? '185px' : '0px',
              // 3. Ensure it's high enough to see
              top: '80px',
              position: 'fixed', // Use fixed so it stays relative to the screen edge
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {sidebarVisible ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

      </div>
      <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} accept="image/*" />
    </div>
  );
}

const styles = {
  // Inside your styles object:
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#F1F5F9',
    fontFamily: 'Inter, sans-serif',
    overflowX: 'overflow', // Prevents horizontal scrolling on mobile
    
  },
  canvas: {
    flex: 1,
    padding: window.innerWidth < 768 ? '15px' : '40px', // Smaller padding for mobile
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100vw'
  },
  header: {
    padding: '16px 16px',
    background: '#fff',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    flexWrap: 'wrap', // ⚡ ALLOWS BUTTONS TO MOVE TO NEXT LINE
    gap: '10px',      // ⚡ ADDS SPACE BETWEEN WRAPPED ITEMS
    height: 'auto',    // ⚡ ENSURES HEADER GROWS IF ITEMS WRAP
    width: '98%'
  }, 
  titleInput: { fontSize: '20px', fontWeight: '800', border: 'none', outline: 'none', marginLeft:'48px', width: '400px', color: '#1E293B' },
  backBtn: { background: '#F8FAFC', border: '2px solid #e2656dff', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
  publishBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#4F46E5', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' },
  workspace: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    // DO NOT use isMobile here, use window.innerWidth
    flexDirection: window.innerWidth < 768 ? 'column-reverse' : 'row',
  },
  sidebar: {
    background: '#F8FAFC',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    // CHANGE THIS: Ensure it defaults to column for desktop
    flexDirection: 'column'
  }, sidebarLabel: { fontSize: '11px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '16px' },
  typeBtn: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid transparent', background: '#fff', marginBottom: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569', fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  retractBtn: { position: 'absolute', top: '20px', zIndex: 10, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0 8px 8px 0', width: '24px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 0 5px rgba(0,0,0,0.05)', transition: 'left 0.3s ease' },
  // canvas: { flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  qCard: { background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '800px', marginBottom: '24px', transition: 'all 0.2s', border: '1px solid #E2E8F0' },
  qCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  qNumber: { fontWeight: '800', color: '#64748B', fontSize: '14px' },
  qBadge: { background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', marginLeft: '10px' },
  deleteBtn: { background: '#FFF1F2', color: '#E11D48', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  inputLabel: { fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px' },
  qInput: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #F1F5F9', fontSize: '16px', outline: 'none', transition: 'all 0.2s' },
  errorText: { color: '#E11D48', fontSize: '12px', fontWeight: '600', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' },
  imageIconBtn: { width: '50px', height: '50px', borderRadius: '12px', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F8FAFC', color: '#64748B', overflow: 'hidden', marginTop: '22px' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  paragraphInput: { width: '100%', height: '120px', padding: '16px', borderRadius: '12px', border: '2px solid #F1F5F9', marginBottom: '16px', fontFamily: 'inherit', resize: 'vertical' },
  optionsGrid: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  optionRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  radioPlaceholder: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #CBD5E1' },
  optionInput: { flex: 1, padding: '10px', border: 'none', borderBottom: '2px solid #F1F5F9', outline: 'none' },
  addSmallBtn: { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#4F46E5', fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginTop: '10px' },
  pairRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' },
  pairInput: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' },
  matchLine: { width: '30px', height: '2px', background: '#CBD5E1' },
  questionRow: { display: 'flex', gap: '20px' },
  distributionSelector: { display: 'flex', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  toggleButton: { padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' },
  studentList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  studentItem: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '2px solid #E2E8F0', transition: 'all 0.2s' }
};