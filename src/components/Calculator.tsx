import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Move, Info, ShieldCheck, Loader2, RefreshCcw, ExternalLink } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Calculator() {
    const [isMinimized, setIsMinimized] = useState(false);
    const [mode, setMode] = useState<'graphing' | 'scientific'>('graphing');
    const [size, setSize] = useState({ width: 580, height: 500 });
    const [isResizing, setIsResizing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0);

    const handleResize = (e: React.MouseEvent) => {
        setIsResizing(true);
        const startX = e.pageX;
        const startY = e.pageY;
        const startWidth = size.width;
        const startHeight = size.height;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(450, startWidth + (moveEvent.pageX - startX));
            const newHeight = Math.max(450, startHeight + (moveEvent.pageY - startY));
            setSize({ width: newWidth, height: newHeight });
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const refresh = () => {
        setIsLoading(true);
        setKey(prev => prev + 1);
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: 20, y: 100 }}
            className={`fixed z-[300] glass-card-depth border-glow flex flex-col overflow-hidden transition-all duration-300 ease-out ${isMinimized ? 'h-16 w-80' : ''}`}
            style={{
                width: isMinimized ? 320 : size.width,
                height: isMinimized ? 64 : size.height,
                cursor: isResizing ? 'nwse-resize' : 'default',
                borderRadius: '16px'
            }}
        >
            {/* Header / Drag Handle */}
            <div className="flex items-center justify-between bg-white/10 text-white px-5 py-4 cursor-move group select-none border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-1.5 bg-white/5 text-white rounded-lg border border-white/10">
                        <Move className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.25em]">Desmos Official</span>
                            <div className="h-1 w-1 bg-white/30 rounded-full" />
                            <span className="text-[9px] font-bold opacity-50 uppercase">{mode}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <button
                                className={`text-[8px] font-black uppercase px-2.5 py-0.5 border rounded transition-all ${mode === 'graphing' ? 'bg-white text-black border-white' : 'border-white/20 opacity-40 hover:opacity-100 hover:border-white/40'}`}
                                onClick={(e) => { e.stopPropagation(); setMode('graphing'); setIsLoading(true); }}
                            >
                                Graphing
                            </button>
                            <button
                                className={`text-[8px] font-black uppercase px-2.5 py-0.5 border rounded transition-all ${mode === 'scientific' ? 'bg-white text-black border-white' : 'border-white/20 opacity-40 hover:opacity-100 hover:border-white/40'}`}
                                onClick={(e) => { e.stopPropagation(); setMode('scientific'); setIsLoading(true); }}
                            >
                                Scientific
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-red-500/20 text-[8px] font-black px-2.5 py-1 rounded-lg text-red-400 animate-pulse uppercase border border-red-500/30">
                        <ShieldCheck className="h-3 w-3" /> NON-CAS APPROVED
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                        <button onClick={(e) => { e.stopPropagation(); refresh(); }} className="glass-button p-1.5 rounded-lg opacity-60 hover:opacity-100">
                            <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                            className="glass-button p-1.5 rounded-lg"
                        >
                            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content (Iframe with Loading) */}
            <div
                className={`flex-1 relative bg-white ${isMinimized ? 'hidden' : 'block'}`}
                style={{ height: 'calc(100% - 64px)' }}
            >
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease }}
                            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                        >
                            <Loader2 className="h-10 w-10 animate-spin text-white/40 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center px-10">
                                Calibrating secure calc environment...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <iframe
                    key={`${mode}-${key}`}
                    title={`${mode} Calculator`}
                    src={mode === 'graphing' ? "https://www.desmos.com/calculator" : "https://www.desmos.com/scientific"}
                    className="absolute inset-0 w-full h-full border-none"
                    onLoad={() => setTimeout(() => setIsLoading(false), 800)}
                />

                {/* Custom Resize Handle (Bottom Right) */}
                {!isMinimized && (
                    <div
                        onMouseDown={handleResize}
                        className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-[310] flex items-end justify-end p-1.5 group"
                    >
                        <div className="w-5 h-5 border-r-4 border-b-4 border-white/20 opacity-10 group-hover:opacity-100 transition-opacity rounded-br-lg" />
                    </div>
                )}
            </div>

            {!isMinimized && (
                <div className="bg-black text-[9px] font-black p-3 text-white/40 uppercase tracking-widest flex items-center justify-between border-t border-white/10 select-none">
                    <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                        SECURE TEST ENVIRONMENT // 2024 DIGITAL SAT READY
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="opacity-20 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-help">
                            ANTI-CHEAT ACTIVE <ShieldCheck className="h-2.5 w-2.5 font-black" />
                        </span>
                        <div className="h-3 w-[1px] bg-white/10" />
                        <Info className="h-3 w-3" />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
