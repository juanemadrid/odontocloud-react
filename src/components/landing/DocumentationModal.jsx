import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink } from 'react-icons/fi';

export default function DocumentationModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl overflow-hidden relative flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-sky-500 rounded-full" />
                                Documentación OdontoCloud
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.open('https://docs.odontocloud.pro', '_blank')}
                                    className="p-2 text-slate-400 hover:text-sky-600 transition-colors rounded-lg hover:bg-sky-50"
                                    title="Abrir en nueva pestaña"
                                >
                                    <FiExternalLink size={20} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Iframe Container */}
                        <div className="flex-1 bg-slate-50 relative">
                            {/* Fallback for now since .pro domain is down */}
                            <iframe
                                src="https://docs.odontocloud.com"
                                className="w-full h-full border-0"
                                title="Documentación OdontoCloud"
                                onError={(e) => {
                                    e.target.srcdoc = `
                                        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:sans-serif;color:#64748b;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            <h2 style="margin-top:1rem;font-size:1.25rem;font-weight:600;color:#334155;">Documentación no disponible</h2>
                                            <p style="margin-top:0.5rem;">Estamos actualizando nuestra base de conocimientos.</p>
                                        </div>
                                    `;
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
