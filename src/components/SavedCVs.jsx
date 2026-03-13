import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Trash2, FileText, Clock, AlertTriangle, FolderOpen } from 'lucide-react';
import { getSavedCVs, deleteCV } from '../services/supabase';

const SavedCVs = ({ onClose, onLoad }) => {
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        loadList();
    }, []);

    const loadList = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getSavedCVs();
            setCvs(data || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch saved CVs');
        } finally {
            setLoading(false);
        }
    };

    const handleLoad = async (id) => {
        try {
            const cv = cvs.find(c => c.id === id);
            if (!cv) throw new Error('CV not found');
            onLoad(cv.cv_data || cv.resume_data, cv.id, cv.title);
            onClose();
        } catch (err) {
            setError('Failed to load CV: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this saved CV? This cannot be undone.')) return;
        setDeleting(id);
        try {
            await deleteCV(id);
            setCvs(prev => prev.filter(cv => cv.id !== id));
        } catch (err) {
            setError('Failed to delete: ' + err.message);
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
            ' • ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                className="bg-[#0d1221] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Saved CVs</h2>
                            <p className="text-[11px] text-slate-500">{cvs.length} saved</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
                            <p className="text-sm text-red-400">{error}</p>
                            <button onClick={loadList} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">Retry</button>
                        </div>
                    ) : cvs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <FileText className="w-10 h-10 text-slate-600 mb-3" />
                            <p className="text-sm text-slate-400 font-semibold">No saved CVs yet</p>
                            <p className="text-xs text-slate-600 mt-1">Save your first CV from the builder to see it here</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {cvs.map(cv => (
                                <div
                                    key={cv.id}
                                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-indigo-400" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{cv.title}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Clock className="w-3 h-3 text-slate-600" />
                                            <p className="text-[10px] text-slate-500 font-mono">{formatDate(cv.updated_at)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleLoad(cv.id)}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold hover:bg-indigo-500/30 transition-colors cursor-pointer"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cv.id)}
                                            disabled={deleting === cv.id}
                                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {deleting === cv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SavedCVs;
