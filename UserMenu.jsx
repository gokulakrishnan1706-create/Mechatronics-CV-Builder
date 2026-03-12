import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, FolderOpen, ChevronDown } from 'lucide-react';
import { signOut } from '../services/supabase';

export default function UserMenu({ user, onViewSaved }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const initial = user?.email?.[0]?.toUpperCase() || 'U';
  const email = user?.email || '';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f3f4f6', border: '1.5px solid #e5e7eb',
          borderRadius: 20, padding: '5px 12px 5px 6px',
          cursor: 'pointer', fontFamily: 'sans-serif',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#2563eb', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>{initial}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email.split('@')[0]}
        </span>
        <ChevronDown size={14} color="#9ca3af" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 12, padding: '8px',
              minWidth: 200, boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              zIndex: 300,
            }}
          >
            {/* Email label */}
            <div style={{ padding: '6px 10px 10px', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'sans-serif' }}>Signed in as</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: 'sans-serif', marginTop: 2, wordBreak: 'break-all' }}>{email}</div>
            </div>

            {/* My CVs */}
            <button
              onClick={() => { onViewSaved(); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'sans-serif',
                fontSize: 13, fontWeight: 600, color: '#111',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <FolderOpen size={15} color="#2563eb" />
              My saved CVs
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'sans-serif',
                fontSize: 13, fontWeight: 600, color: '#ef4444',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <LogOut size={15} color="#ef4444" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
