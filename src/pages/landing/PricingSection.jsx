import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiStar } from 'react-icons/fi';

export default function PricingSection({ config, dbPlans, onShowTrial, dark = false }) {
    if (!config?.isMaster) return null;

    // Default plans if DB is empty
    const defaultPlans = [
        {
            name: "Esencial",
            price: 120000,
            desc: "Para consultorios que inician su digitalización.",
            features: [
                "1 Usuario (Administrador)",
                "Agenda Inteligente",
                "Historia Clínica Digital",
                "Odontograma 3D Básico",
                "Hasta 500 Pacientes",
                "Soporte vía WhatsApp"
            ],
            isPopular: false,
            btnText: "Probar Esencial"
        },
        {
            name: "Pro Professional",
            price: 250000,
            desc: "El estándar de oro para clínicas modernas.",
            features: [
                "Usuarios Ilimitados",
                "Página Web Clínica Personalizada",
                "Recordatorios WhatsApp Ilimitados",
                "Odontograma 3D Avanzado",
                "Facturación y Cartera",
                "Gestión de Inventarios",
                "Pacientes Ilimitados",
                "Soporte Prioritario 24/7"
            ],
            isPopular: true,
            btnText: "Elegir Professional"
        },
        {
            name: "Élite Multi-Sede",
            price: 480000,
            desc: "Control total para redes de clínicas.",
            features: [
                "Todo lo del Plan Pro Professional",
                "Sedes Ilimitadas",
                "Analítica de Datos Avanzada",
                "Portal del Paciente Premium",
                "API para Integraciones",
                "Account Manager Dedicado"
            ],
            isPopular: false,
            btnText: "Contactar Ventas"
        }
    ];

    const featureMapping = {
        "Agenda": "Agenda Inteligente y Recordatorios",
        "Pacientes": "Gestión Integral de Pacientes",
        "Inventario": "Control de Inventarios y Stock",
        "Facturación": "Facturación y Control de Cartera",
        "Facturacion": "Facturación y Control de Cartera",
        "RIPS": "RIPS y Normativa de Salud Vigente",
        "Administración": "Módulo de Administración Clínica",
        "Administracion": "Módulo de Administración Clínica",
        "CMS": "Sitio Web Corporativo Profesional",
        "Personalizacion": "Personalización de Marca de Élite"
    };

    const enrichFeatures = (features) => {
        if (!features || features.length === 0) return [];
        return features.map(f => {
            const cleanText = f.trim();
            return featureMapping[cleanText] || f;
        });
    };

    let displayPlans = (dbPlans && dbPlans.length > 0)
        ? dbPlans.map(p => {
            // Normalize DB plan to match expected Landing UI schema
            return {
                ...p,
                desc: p.description || p.desc, // Support both
                userLimit: p.maxUsers ? `${p.maxUsers} Usuarios` : p.userLimit,
                coreModule: p.coreModule || "Módulo Core",
                recommended: p.recommended || p.isPopular || p.name?.toLowerCase().includes('corporativo'),
                features: enrichFeatures(p.features)
            };
        })
        : (config?.plans && config.plans.length > 0 ? config.plans : defaultPlans);

    // If we only have 2 plans (Basico and Corporativo), and Corporativo is second, ensure it stands out.
    if (displayPlans.length === 2 && !displayPlans[1].recommended) {
        displayPlans[1].recommended = true;
    }

    return (
        <section id="planes" className={`py-32 relative overflow-hidden ${dark ? 'bg-transparent' : 'bg-slate-50'}`}>
            {/* Background Ornaments */}
            {!dark && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />}

            <div className={`container relative z-10 mx-auto px-6`}>
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-indigo-500 font-bold tracking-widest text-sm uppercase mb-3 block"
                    >
                        Planes y Precios
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`text-4xl md:text-6xl font-display font-bold mb-6 ${dark ? 'text-white' : 'text-slate-900'}`}
                    >
                        Inversión inteligente para <br /> tu crecimiento digital
                    </motion.h2>
                    <p className={`text-xl max-w-2xl mx-auto font-light leading-relaxed ${dark ? 'text-slate-200' : 'text-slate-500'}`}>
                        Elige el plan que mejor se adapte al tamaño de tu práctica. <br /> Sin contratos forzosos ni letras pequeñas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {displayPlans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative p-8 rounded-[2.5rem] border shadow-xl flex flex-col h-full overflow-hidden transition-all duration-500 hover:-translate-y-4 z-10 
                                ${dark
                                    ? 'glass-premium border-white/5 text-white'
                                    : 'bg-white border-slate-100 text-slate-800'
                                }
                                ${(plan.isPopular || plan.recommended)
                                    ? (dark ? 'ring-2 ring-amber-400/50 shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] scale-105 z-20' : 'ring-4 ring-blue-500/10 scale-105 z-20 shadow-2xl')
                                    : 'hover:border-white/20'
                                }`}
                        >
                            {(plan.isPopular || plan.recommended) && (
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className={`absolute top-0 right-0 px-8 py-2 rounded-bl-3xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 z-20 shadow-lg
                                        ${dark
                                            ? 'bg-gradient-to-l from-amber-400 to-orange-500 text-white'
                                            : 'bg-gradient-to-l from-indigo-600 to-blue-500 text-white'
                                        }
                                    `}
                                >
                                    <FiStar className="animate-pulse" /> Recomendado
                                </motion.div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                                <p className={`text-sm font-light leading-relaxed mb-6 ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{plan.desc || plan.description}</p>

                                <div className="flex flex-wrap gap-2">
                                    {plan.userLimit && (
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm 
                                            ${dark ? 'bg-white/10 border-white/10 text-white' : '!bg-white border-slate-100 text-slate-900'}`}>
                                            <svg className={`w-3 h-3 ${dark ? 'text-sky-300' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            {plan.userLimit}
                                        </span>
                                    )}
                                    {plan.coreModule && (
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm 
                                            ${dark ? 'bg-white/10 border-white/10 text-white' : '!bg-white border-slate-100 text-slate-900'}`}>
                                            <svg className={`w-3 h-3 ${dark ? 'text-sky-300' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                                            {plan.coreModule}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-10">
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                                            $ {Number(plan.price || plan.monthlyPrice).toLocaleString('es-CO')}
                                        </span>
                                        <span className={`${dark ? 'text-slate-400' : 'text-slate-400'} font-medium text-sm`}>/mes</span>
                                    </div>

                                    {(plan.yearlyPrice || plan.annualPrice) && (
                                        <div className="flex items-baseline gap-2 opacity-60">
                                            <span className={`text-xl font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                $ {Number(plan.yearlyPrice || plan.annualPrice).toLocaleString('es-CO')}
                                            </span>
                                            <span className="text-slate-400 font-medium text-xs">/año</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                                AHORRA 15%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 text-[10px] font-black uppercase tracking-widest border-t pt-4 border-slate-100 text-indigo-500/50">
                                    IVA Incluido • Pesos Colombianos
                                </div>
                            </div>

                            <ul className="space-y-4 mb-12 flex-grow">
                                {(plan.features || []).map((feat, j) => (
                                    <li key={j} className="flex items-start gap-3 group/item">
                                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors
                                            ${dark
                                                ? 'bg-white/10 text-sky-400 group-hover/item:bg-sky-500 group-hover/item:text-white'
                                                : 'bg-indigo-50 text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white'
                                            }
                                        `}>
                                            <FiCheck size={12} />
                                        </div>
                                        <span className={`text-sm leading-tight ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    if (onShowTrial) {
                                        onShowTrial(plan);
                                    }
                                }}
                                className={`w-full py-5 px-8 rounded-full font-bold transition-all duration-500 uppercase tracking-widest text-xs group/btn relative overflow-hidden ${(plan.isPopular || plan.recommended)
                                    ? (dark ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-[#022a63] text-white shadow-xl shadow-blue-900/20')
                                    : (dark ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200')
                                    }`}
                            >
                                <span className="relative z-10">{plan.btnText || "Probar Gratis"}</span>
                                {(plan.isPopular || plan.recommended) && (
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section >
    );
}
