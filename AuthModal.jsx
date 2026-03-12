import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Chrome, Loader2, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabase';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, page redirects — no need to close modal
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Check your email to confirm your account, then sign in.');
      }
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 16,
            padding: '32px 28px', width: '100%', maxWidth: 400,
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            position: 'relative',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: '#f3f4f6', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} color="#6b7280" />
          </button>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, background: '#2563eb', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'Georgia, serif',
              }}>G</div>
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 16, color: '#111' }}>
                Gokul<span style={{ color: '#2563eb' }}>CV</span>
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif', marginBottom: 4 }}>
              {mode === 'signin' ? 'Sign in to save your CVs' : 'Create your free account'}
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', fontFamily: 'sans-serif' }}>
              Save up to 3 CVs and re-download any time.
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%', padding: '11px 16px',
              background: '#fff', border: '1.5px solid #d1d5db',
              borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 14, fontWeight: 600, color: '#111', fontFamily: 'sans-serif',
              marginBottom: 16,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Chrome size={18} color="#4285f4" />
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'sans-serif' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth}>
            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                border: '1.5px solid #d1d5db', borderRadius: 10,
                padding: '10px 14px',
              }}>
                <Mail size={16} color="#9ca3af" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontSize: 14, fontFamily: 'sans-serif', color: '#111',
                    background: 'transparent',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                border: '1.5px solid #d1d5db', borderRadius: 10,
                padding: '10px 14px',
              }}>
                <Lock size={16} color="#9ca3af" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontSize: 14, fontFamily: 'sans-serif', color: '#111',
                    background: 'transparent',
                  }}
                />
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '10px 12px', marginBottom: 12,
              }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: 13, color: '#ef4444', fontFamily: 'sans-serif' }}>{error}</span>
              </div>
            )}
            {success && (
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 8, padding: '10px 12px', marginBottom: 12,
              }}>
                <span style={{ fontSize: 13, color: '#16a34a', fontFamily: 'sans-serif' }}>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 16px',
                background: '#2563eb', border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Toggle mode */}
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6b7280', fontFamily: 'sans-serif' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
              style={{ color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: 13 }}
            >
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
