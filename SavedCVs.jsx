import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { getSavedCVs, deleteCV } from '../services/supabase';
import { pdf } from '@react-pdf/renderer';
import { ATSPartTimePDF } from '../services/PDFTemplates';

const SECTOR_LABELS = {
  warehouse: 'Warehouse', carehome: 'Care Home', retail: 'Retail',
  kitchen: 'Kitchen', hospitality: 'Hospitality', freelance: 'Freelance',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SavedCVs({ user, onClose }) {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    setLoading(true);
    const { data, error } = await getSavedCVs(user.id);
    if (error) setError('Could not load your CVs. Try again.');
    else setCvs(data || []);
    setLoading(false);
  };

  const handleDownload = async (cv) => {
    setDownloading(cv.id);
    try {
      const blob = await pdf(
        <ATSPartTimePDF formData={cv.cv_data} sector={cv.sector || 'warehouse'} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.title.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
    setDownloading(null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    const { error } = await deleteCV(id);
    if (!error) setCvs(prev => prev.filter(c => c.id !== id));
    setDeleting(null);
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
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
            width: '100%', maxWidth: 520,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif', marginBottom: 2 }}>
                My saved CVs
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', fontFamily: 'sans-serif' }}>
                {cvs.length} CV{cvs.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f3f4f6', border: 'none', borderRadius: 8,
                width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} color="#6b7280" />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 }}>
                <Loader2 size={20} color="#2563eb" className="animate-spin" />
                <span style={{ fontSize: 14, color: '#6b7280', fontFamily: 'sans-serif' }}>Loading your CVs...</span>
              </div>
            ) : error ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: 12,
              }}>
                <AlertCircle size={16} color="#ef4444" />
                <span style={{ fontSize: 13, color: '#ef4444', fontFamily: 'sans-serif' }}>{error}</span>
              </div>
            ) : cvs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FileText size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', marginBottom: 4 }}>No CVs saved yet</p>
                <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'sans-serif' }}>Generate a CV and click Save to store it here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cvs.map(cv => (
                  <div
                    key={cv.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', borderRadius: 10,
                      border: '1.5px solid #e5e7eb', background: '#fafafa',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, background: '#eff6ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FileText size={18} color="#2563eb" />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111', fontFamily: 'sans-serif', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cv.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'sans-serif' }}>
                        {SECTOR_LABELS[cv.sector] || cv.sector} · {formatDate(cv.created_at)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleDownload(cv)}
                        disabled={downloading === cv.id}
                        title="Download PDF"
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: '#eff6ff', border: '1px solid #bfdbfe',
                          cursor: downloading === cv.id ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {downloading === cv.id
                          ? <Loader2 size={14} color="#2563eb" className="animate-spin" />
                          : <Download size={14} color="#2563eb" />}
                      </button>
                      <button
                        onClick={() => handleDelete(cv.id)}
                        disabled={deleting === cv.id}
                        title="Delete"
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: '#fef2f2', border: '1px solid #fecaca',
                          cursor: deleting === cv.id ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {deleting === cv.id
                          ? <Loader2 size={14} color="#ef4444" className="animate-spin" />
                          : <Trash2 size={14} color="#ef4444" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
