import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';

const StudentWorksheetSolver = ({ worksheet, onClose, studentName, studentId, classId, onCompletion }) => {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
// 2. Add isMobile detection logic
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleAnswerChange = (questionId, value, questionType) => {
    if (questionType === 'blank') {
      const blanks = worksheet.questions.find(q => q.id === questionId)?.question.match(/\[blank\]/gi);
      if (blanks) {
        const currentAnswers = Array.isArray(answers[questionId]) ? [...answers[questionId]] : [];
        currentAnswers[value.index] = value.answer;
        setAnswers(prev => ({ ...prev, [questionId]: currentAnswers }));
      }
    } else if (questionType === 'match') {
      const currentMatches = answers[questionId] || {};
      setAnswers(prev => ({ ...prev, [questionId]: { ...currentMatches, [value.key]: value.value } }));
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!classId) {
      alert("Error: Class ID is missing. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);
    
    const submissionData = {
      class_id: String(classId),
      assignment_id: String(worksheet.id),
      student_id: String(studentId),
      student_name: studentName,
      answers: answers,
      status: 'submitted',
      grade_data: {},
      grade: 0
    };

    try {
      await api.pbRequest('/collections/submissions/records', {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });

      if (onCompletion) {
        onCompletion(worksheet.id);
      }
      
      // We stop loading and trigger the success UI state
      setIsSubmitting(false);
      setShowSuccess(true); 
    } catch (error) {
      console.error('Submission Error:', error);
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // --- 1. THE SUCCESS VIEW (MOVED OUTSIDE HANDLESUBMIT) ---
  if (showSuccess) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', textAlign: 'center', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '50px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
          <div style={{ background: '#DCFCE7', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
            <CheckCircle2 size={50} color="#16A34A" />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px', color: '#1E293B' }}>Great Job!</h2>
          <p style={{ color: '#64748B', fontSize: '18px', marginBottom: '40px', lineHeight: 1.5 }}>
            Your worksheet "<strong>{worksheet.title}</strong>" has been submitted to your teacher.
          </p>
          <button 
            onClick={onClose}
            style={{ width: '100%', background: '#1A1A1A', color: '#fff', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            Back to Dashboard <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'choice':
        return (
          <div style={{ display: 'grid', gap: '10px' }}>
            {question.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleAnswerChange(question.id, opt, question.type)}
                style={{
                  padding: '15px', borderRadius: '12px', textAlign: 'left', border: '2px solid',
                  borderColor: answers[question.id] === opt ? '#6366F1' : '#E2E8F0',
                  background: answers[question.id] === opt ? '#EEF2FF' : '#fff',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      
      case 'blank':
        { const parts = question.question.split('[blank]');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {parts.map((part, index) => (
                <React.Fragment key={index}>
                  <span style={{ marginRight: '5px' }}>{part}</span>
                  {index < parts.length - 1 && (
                    <input
                      style={{ width: '80px', padding: '8px', margin: '0 5px', borderRadius: '8px', border: '2px solid #E2E8F0', fontSize: '16px' }}
                      placeholder="Answer"
                      onChange={(e) => handleAnswerChange(question.id, { index, answer: e.target.value }, question.type)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ); }

      case 'match':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {question.pairs.map((pair, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, padding: '10px', background: '#F1F5F9', borderRadius: '8px' }}>
                  {pair.left}
                </div>
                <div style={{ width: '30px', textAlign: 'center' }}>→</div>
                <input
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #E2E8F0', fontSize: '16px' }}
                  placeholder={`Match for "${pair.left}"`}
                  onChange={(e) => handleAnswerChange(question.id, { key: pair.left, value: e.target.value }, question.type)}
                />
              </div>
            ))}
          </div>
        );

      case 'comprehension':
        return (
          <textarea
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '16px', minHeight: '120px', resize: 'vertical' }}
            placeholder="Type your answer here..."
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );

      default: 
        return (
          <input
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '16px' }}
            placeholder="Type your answer here..."
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );
    }
  };

  // --- 2. THE MAIN WORKSHEET VIEW ---
  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
  // Reduced padding for mobile to push buttons to the edges
  padding: isMobile ? '12px 16px' : '20px 40px', 
  borderBottom: '1px solid #E2E8F0', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  background: '#fff',
  position: 'sticky',
  top: 0,
  zIndex: 10
}}>
  {/* QUIT BUTTON: Icon only on mobile */}
  <button 
    onClick={onClose} 
    style={{ 
      border: 'none', 
      background: isMobile ? '#F1F5F9' : 'none', // Added light background on mobile for "clarity"
      borderRadius: isMobile ? '12px' : '0',
      padding: isMobile ? '8px' : '0',
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      fontWeight: 700 
    }}
  >
    <ChevronLeft size={isMobile ? 24 : 20} /> 
    {!isMobile && 'Quit'}
  </button>

  {/* TITLE: Centered and truncated if too long */}
  <h2 style={{ 
    margin: 0, 
    fontSize: isMobile ? '16px' : '18px', 
    fontWeight: 900,
    flex: 1,
    textAlign: 'center',
    padding: '0 10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }}>
    {worksheet.title}
  </h2>

  {/* SUBMIT BUTTON: Simplified text on mobile */}
  <button 
    onClick={handleSubmit} 
    disabled={isSubmitting}
    style={{ 
      background: isSubmitting ? '#94A3B8' : '#4F46E5', 
      color: '#fff', 
      border: 'none', 
      padding: isMobile ? '10px 18px' : '10px 25px', 
      borderRadius: '12px', 
      fontWeight: 700, 
      cursor: isSubmitting ? 'wait' : 'pointer',
      whiteSpace: 'nowrap'
    }}
  >
    {isSubmitting 
      ? (isMobile ? '...' : 'Submitting...') 
      : (isMobile ? 'Submit' : 'Finish & Submit')
    }
  </button>
</header>
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {worksheet.questions.map((q, idx) => (
            <div key={q.id} style={{ background: '#fff', borderRadius: '24px', padding: '30px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#6366F1', textTransform: 'uppercase' }}>Question {idx + 1}</span>
              {q.paragraph && (
                <div style={{ background: '#F1F5F9', padding: '20px', borderRadius: '16px', margin: '15px 0', lineHeight: '1.6', fontSize: '16px' }}>
                  {q.paragraph}
                </div>
              )}
              <h3 style={{ fontSize: '20px', margin: '15px 0' }}>{q.question}</h3>
              {q.image && <img src={q.image} style={{ width: '100%', borderRadius: '16px', marginBottom: '20px' }} alt="question" />}
              {renderQuestionInput(q)}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentWorksheetSolver;