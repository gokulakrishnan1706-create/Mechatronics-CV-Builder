import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Save, FolderOpen, User, ChevronDown } from 'lucide-react';
import { signOut } from '../services/supabase';

const UserMenu = ({ user, onSave, onOpenSaved, onSignOut }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const avatar = user?.user_metadata?.avatar_url;
    const initials = displayName.charAt(0).toUpperCase();

    const handleSignOut = async () => {
        try {
            await signOut();
            onSignOut?.();
        } catch (err) {
            console.error('Sign-out error:', err);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-1 pr-3 py-1 transition-all cursor-pointer active:scale-95"
            >
                {avatar ? (
                    <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                    </div>
                )}
                <span className="text-xs font-semibold text-white hidden sm:inline max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#111827] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <button
                        onClick={() => { onSave?.(); setOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                        <Save className="w-4 h-4 text-indigo-400" />
                        Save CV to Cloud
                    </button>

                    <button
                        onClick={() => { onOpenSaved?.(); setOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                        <FolderOpen className="w-4 h-4 text-emerald-400" />
                        My Saved CVs
                    </button>

                    <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
