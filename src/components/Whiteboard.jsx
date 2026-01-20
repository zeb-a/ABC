import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Pencil, Eraser, Type, Trash2, Download, X, Highlighter, 
  ChevronUp, Check, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InlineHelpButton from './InlineHelpButton';

export default function Whiteboard({ onClose }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [tool, setTool] = useState('pencil');
  const [lineWidth, setLineWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(40);
  const [showSizeList, setShowSizeList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });
  const inputRef = useRef(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      // subtract header height so canvas fits below the top nav
      const headerHeight = document.querySelector('.topNav')?.getBoundingClientRect().height || 80;
      const availH = Math.max(200, window.innerHeight - headerHeight);
      canvas.width = window.innerWidth * dpr;
      canvas.height = availH * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${availH}px`;

      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, window.innerWidth, availH);
      contextRef.current = ctx;
    };

    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
  }, []);

  // Inject compact mobile styles for the whiteboard container
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'wb-mobile-styles';
    style.innerHTML = `@media (max-width:768px){ .whiteboard-root { padding: 12px !important; } .whiteboard-root .topNav { height: 64px !important; padding: 8px 12px !important; } .whiteboard-root .sidebar { display:none !important; } }`;
    document.head.appendChild(style);
    return () => { const el = document.getElementById('wb-mobile-styles'); if (el) el.remove(); };
  }, []);

  // TEXT BAKING LOGIC
  const finalizeText = useCallback(() => {
    if (!textInput.visible || !textInput.value.trim()) {
      setTextInput({ visible: false, x: 0, y: 0, value: '' });
      return;
    }

    const ctx = contextRef.current;
    ctx.font = `bold 32px "Inter", sans-serif`;
    ctx.fillStyle = color; // Uses the state color
    ctx.globalAlpha = 1.0;
    // Align text to input position
    ctx.fillText(textInput.value, textInput.x, textInput.y + 28);
    
    setTextInput({ visible: false, x: 0, y: 0, value: '' });
  }, [textInput, color]);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (textInput.visible) finalizeText();

    if (tool === 'text') {
      setTextInput({ visible: true, x, y, value: '' });
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // ⚡ THE COLOR FIX: Set it explicitly at the moment of contact
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = tool === 'eraser' ? eraserWidth : (tool === 'highlighter' ? 25 : lineWidth);
    ctx.globalAlpha = tool === 'highlighter' ? 0.3 : 1.0;
    
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };

  const saveImage = () => {
    finalizeText(); // Save any pending text first
    setIsSaving(true);
    const dataURL = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
  };

  return (
    <div className="whiteboard-root" style={styles.container}>
      {/* 2026 HEADER */}
      <div className="topNav" style={styles.topNav}>
        <div style={styles.logoGroup}>
          <div style={styles.iconCircle}><Palette size={20} color="white" /></div>
          <span style={styles.boardTitle}>Classroom Creative Board</span>
        </div>
        <div style={styles.topActions}>
          <InlineHelpButton pageId="whiteboard" />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveImage} 
            style={{...styles.saveBtn, background: isSaving ? '#22C55E' : 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)'}}
          >
            {isSaving ? <Check size={18} /> : <Download size={18} />}
            {isSaving ? "Saved!" : "Export PNG"}
          </motion.button>
          <button onClick={onClose} style={styles.closeBtn}><X size={24} /></button>
        </div>
      </div>

      {/* FLOATING VERTICAL TOOLBAR */}
      <div style={styles.sidebar}>
        <ToolIcon active={tool === 'pencil'} onClick={() => {finalizeText(); setTool('pencil');}} Icon={Pencil} />
        <ToolIcon active={tool === 'highlighter'} onClick={() => {finalizeText(); setTool('highlighter');}} Icon={Highlighter} />
        <ToolIcon active={tool === 'text'} onClick={() => setTool('text')} Icon={Type} />
        <ToolIcon active={tool === 'eraser'} onClick={() => {finalizeText(); setTool('eraser');}} Icon={Eraser} />
        
        <div style={styles.sideDivider} />
        
        {/* COLOR PICKER FIX - Make it properly clickable */}
        <div style={styles.colorWrapper}>
          <input 
            type="color" 
            value={color} 
            onChange={handleColorChange}
            style={styles.colorInput}
          />
          <div 
            style={{...styles.colorCircle, backgroundColor: color, borderColor: color}}
            onClick={() => {
              // Trigger the color input click when clicking on the color circle
              document.querySelector('input[type="color"]').click();
            }}
          />
        </div>

        {/* THICKNESS LIST */}
        <div style={{ position: 'relative' }}>
          <button style={styles.sizeTrigger} onClick={() => setShowSizeList(!showSizeList)}>
            <div style={{ 
              width: Math.min((tool === 'eraser' ? eraserWidth : lineWidth)/3 + 4, 20), 
              height: Math.min((tool === 'eraser' ? eraserWidth : lineWidth)/3 + 4, 20), 
              borderRadius: '50%', background: '#1E293B' 
            }} />
            <ChevronUp size={10} style={{ transform: showSizeList ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s'}} />
          </button>

          <AnimatePresence>
            {showSizeList && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={styles.sizeMenu}>
                {[2, 8, 20, 40, 90].map(s => (
                  <button key={s} onClick={() => {
                    if (tool === 'eraser') setEraserWidth(s); else setLineWidth(s);
                    setShowSizeList(false);
                  }} style={styles.sizeItem}>
                    <div style={{ width: s/6 + 2, height: s/6 + 2, borderRadius: '50%', background: '#444' }} />
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{s}px</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={styles.sideDivider} />
        <button onClick={() => {
          contextRef.current.fillStyle = 'white';
          contextRef.current.fillRect(0,0, 5000, 5000);
        }} style={styles.trashBtn}>
          <Trash2 size={20} />
        </button>
      </div>

      {/* CANVAS */}
      <div style={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={styles.canvas}
        />

        {textInput.visible && (
          <input
            ref={inputRef}
            style={{...styles.liveInput, left: textInput.x, top: textInput.y, color: color}}
            value={textInput.value}
            onChange={(e) => setTextInput({...textInput, value: e.target.value})}
            onBlur={finalizeText}
            onKeyDown={(e) => e.key === 'Enter' && finalizeText()}
            placeholder="Type & Enter..."
          />
        )}
      </div>
    </div>
  );
}

const ToolIcon = ({ active, onClick, Icon }) => (
  <button onClick={onClick} style={{...styles.toolBtn, backgroundColor: active ? '#6366F1' : 'transparent', boxShadow: active ? '0 8px 15px rgba(99, 102, 241, 0.3)' : 'none'}}>
    <Icon size={22} color={active ? 'white' : '#64748B'} />
  </button>
);

const styles = {
  container: { position: 'fixed', inset: 0, zIndex: 9999, background: '#F8FAFC', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, sans-serif' },
  topNav: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', zIndex: 50 },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconCircle: { width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  boardTitle: { fontWeight: '900', fontSize: '18px', color: '#1E293B', letterSpacing: '-0.5px' },
  topActions: { display: 'flex', alignItems: 'center', gap: '15px' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '10px', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: '0.3s' },
  closeBtn: { background: '#F1F5F9', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
  sidebar: { position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', width: '75px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #FFF', zIndex: 100 },
  toolBtn: { width: '50px', height: '50px', borderRadius: '15px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sideDivider: { width: '30px', height: '1px', background: '#E2E8F0', margin: '5px 0' },
  colorWrapper: { position: 'relative', width: '45px', height: '45px' },
  colorInput: { 
    position: 'absolute', 
    inset: 0, 
    opacity: 0.01, 
    cursor: 'pointer', 
    zIndex: 2,
    width: '100%',
    height: '100%'
  },
  colorCircle: { 
    position: 'absolute', 
    inset: 0, 
    borderRadius: '50%', 
    border: '4px solid white', 
    boxShadow: '0 0 0 1px #E2E8F0', 
    zIndex: 1,
    cursor: 'pointer'
  },
  sizeTrigger: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', width: '50px', height: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  sizeMenu: { position: 'absolute', right: '85px', bottom: '0', background: 'white', padding: '12px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '8px', width: '70px' },
  sizeItem: { background: '#F8FAFC', border: 'none', padding: '12px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderRadius: '12px', transition: '0.2s' },
  trashBtn: { color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '10px' },
  canvasContainer: { flex: 1, padding: '30px', position: 'relative' },

  // Mobile adjustments
  '@mobileOverrides': {
    canvasContainer: { padding: '12px' }
  },
  canvas: { background: 'white', borderRadius: '30px', boxShadow: '0 10px 60px rgba(0,0,0,0.05)', display: 'block' },
  liveInput: { position: 'absolute', background: 'transparent', border: 'none', outline: 'none', fontSize: '32px', fontWeight: '900', minWidth: '400px', borderBottom: '2px solid #6366f1', padding: '5px' }
};
