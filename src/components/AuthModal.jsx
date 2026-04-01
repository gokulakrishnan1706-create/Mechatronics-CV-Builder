import React, { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { X, Mail, Lock, Loader2, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabase';

const AuthModal = ({ onClose }) => {
    const [mode, setMode] = useState('login'); // login | signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mouse Spotlight Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await signInWithEmail(email, password);
                onClose();
            } else {
                await signUpWithEmail(email, password);
                setSuccess('Check your email for a confirmation link!');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-[#030303]/80 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden"
            onClick={onClose}
        >
            {/* Ambient Background Orbs (Aesthetic Monochrome) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-zinc-500/30 blur-[120px]" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-white/10 blur-[150px]" 
                />
            </div>

            {/* Main Auth Card Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative max-w-[400px] w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Spotlight Card */}
                <div 
                    className="relative rounded-[2rem] bg-[#09090b]/80 shadow-2xl overflow-hidden border border-white/5 group"
                    onMouseMove={handleMouseMove}
                >
                    {/* Spotlight Base Glow */}
                    <motion.div
                        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-500 group-hover:opacity-100"
                        style={{
                            background: useMotionTemplate`
                                radial-gradient(
                                    600px circle at ${mouseX}px ${mouseY}px,
                                    rgba(255, 255, 255, 0.03),
                                    transparent 40%
                                )
                            `,
                        }}
                    />
                    
                    {/* Animated Border Reveal on Hover */}
                    <motion.div
                        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100 z-10"
                        style={{
                            background: useMotionTemplate`
                                radial-gradient(
                                    250px circle at ${mouseX}px ${mouseY}px,
                                    rgba(255, 255, 255, 0.15),
                                    transparent 60%
                                )
                            `,
                            WebkitMaskboxImage: "linear-gradient(white, white)",
                            WebkitMaskComposite: "xor",
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            padding: "1px",
                            maskComposite: "exclude"
                        }}
                    />

                    {/* Content Wrapper */}
                    <div className="relative p-8 z-20">
                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-all hover:rotate-90 hover:scale-110 p-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/5 cursor-pointer z-50">
                            <X className="w-4 h-4" />
                        </button>

                        {/* Top Decorative Icon (3D Mockup) */}
                        <div className="flex justify-center mb-6 relative">
                            {/* Ambient Glow under image */}
                            <div className="absolute inset-x-0 bottom-4 h-16 bg-white/10 blur-[40px] opacity-30 rounded-full scale-110 pointer-events-none" />
                            
                            <motion.img 
                                src="/auth_lock.png" 
                                alt="Security Lock Mockup" 
                                className="w-32 h-32 object-contain -mt-4 relative z-10 mix-blend-screen"
                                style={{
                                    maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
                                    WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)'
                                }}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>

                        {/* Text Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-sm mb-2">
                                {mode === 'login' ? 'Welcome Back' : 'Join the Elite'}
                            </h2>
                            <p className="text-sm font-medium text-zinc-400">
                                {mode === 'login' ? 'Authenticate to access your workspace' : 'Create an account to save your synthesis'}
                            </p>
                        </div>

                        {/* OAuth Section */}
                        <button
                            onClick={handleGoogle}
                            disabled={googleLoading}
                            className="w-full py-3.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] mb-6 overflow-hidden relative group/btn"
                        >
                            {/* Subtle shine effect on hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />
                            
                            {googleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin relative z-10 text-zinc-400" />
                            ) : (
                                <div className="p-1 bg-white/90 rounded flex items-center justify-center shadow-sm relative z-10">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                            )}
                            <span className="relative z-10 tracking-wide">Continue with Google</span>
                        </button>

                        <div className="flex items-center gap-4 mb-6 opacity-40">
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />
                            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">Authentication</span>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-zinc-600 group-focus-within/input:text-zinc-300 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 focus:bg-zinc-800/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                                />
                            </div>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-zinc-600 group-focus-within/input:text-zinc-300 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-white/5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 focus:bg-zinc-800/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                                />
                            </div>

                            {/* Notifications */}
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-rose-400 text-xs font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5 shadow-sm">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 flex items-center gap-2 shadow-sm">
                                    <Sparkles className="w-4 h-4 shrink-0" />
                                    {success}
                                </motion.div>
                            )}

                            {/* Primary Action Button (White/Silver Aesthetic) */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full py-4 px-4 rounded-xl font-black tracking-wide text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 overflow-hidden group/submit shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] border border-white/20 cursor-pointer mt-2 bg-white text-zinc-950 hover:bg-zinc-200"
                            >
                                {/* Button Inner Shine */}
                                <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] pointer-events-none" />
                                
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover/submit:translate-x-1 transition-transform" />}
                                    {mode === 'login' ? 'INITIALIZE SECURE LOGIN' : 'CREATE CREDENTIALS'}
                                </span>
                            </button>
                        </form>

                        {/* Mode Toggle */}
                        <div className="mt-8 text-center pt-6 border-t border-white/5">
                            <p className="text-xs font-medium text-zinc-500">
                                {mode === 'login' ? "System unauthenticated? " : 'Credentials established? '}
                                <button
                                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
                                    className="text-white hover:text-zinc-300 font-bold transition-colors border-b border-white/20 hover:border-white pb-0.5 ml-1 inline-block cursor-pointer"
                                >
                                    {mode === 'login' ? 'Create Account' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AuthModal;
