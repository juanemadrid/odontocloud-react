import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  FiArrowRight, FiPlay, FiCloud, FiLock, FiHeadphones, FiCheckCircle, 
  FiCalendar, FiUser, FiFileText, FiGrid, FiDollarSign, FiBox, FiMessageSquare,
  FiSearch, FiBell, FiChevronDown, FiTrendingUp, FiCheck, FiPieChart, FiUsers
} from "react-icons/fi";
import DocumentationModal from "../../components/landing/DocumentationModal";
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ config = {}, onShowTrial }) {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [showDocModal, setShowDocModal] = useState(false);

    const isMaster = config.isMaster !== false;

    return (
        <section
            id="inicio"
            ref={containerRef}
            className="relative w-full bg-white text-slate-900 overflow-hidden font-sans pt-24 sm:pt-28 md:pt-32 pb-16 border-b border-slate-100"
        >
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-[1450px]">

                {/* 1. HERO TOP - 2 COLUMNS RESPONSIVE LAYOUT WITH LOCALIZED BLUE CURVE BACKDROP */}
                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-24 pt-4">
                    
                    {/* Background Light Blue Curved Shape on Right Side (High Definition Gradient) */}
                    <div className="absolute -top-12 -right-8 sm:-right-16 w-full lg:w-3/5 h-[115%] bg-gradient-to-br from-blue-100/90 via-sky-100/60 to-blue-50/50 pointer-events-none rounded-b-[100px] lg:rounded-l-[280px] -z-0"></div>

                    {/* LEFT COLUMN: HEADLINE, SUBTITLE, CTAS & BADGES */}
                    <div className="lg:col-span-5 text-left space-y-6 relative z-10">
                        
                        {/* Top Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                            <span className="text-xs font-bold text-blue-700 tracking-wide">
                                {isMaster 
                                    ? (config.heroBadgeText || "Software Odontológico Todo en Uno")
                                    : (config.heroBadgeText || "Atención Odontológica Especializada")
                                }
                            </span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                            {isMaster ? (
                                <>
                                    Gestiona tu clínica <br className="hidden sm:inline" />
                                    dental de forma <br className="hidden sm:inline" />
                                    <span className="text-blue-600">simple y profesional</span>
                                </>
                            ) : (
                                config.heroTitle || "Cuidamos de tu sonrisa con excelencia"
                            )}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-lg">
                            {isMaster ? (
                                "OdontoCloud es el software en la nube que te ayuda a ahorrar tiempo, organizar tu clínica y brindar la mejor experiencia a tus pacientes."
                            ) : (
                                config.heroSubtitle || "La mejor atención odontológica con tecnología avanzada y un equipo especializado."
                            )}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <button
                                onClick={() => onShowTrial(isMaster ? "Solicitar Demostración" : (config.heroBtn1Text || "Agendar Cita"))}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-xl shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer border-0"
                            >
                                <span>{isMaster ? "Solicitar Demostración" : (config.heroBtn1Text || "Agendar Cita")}</span>
                                <FiArrowRight size={18} />
                            </button>

                            <button
                                onClick={() => {
                                    if (isMaster) {
                                        setShowDocModal(true);
                                    } else {
                                        const el = document.getElementById("servicios");
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="px-7 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                {isMaster ? (
                                    <>
                                        <FiPlay size={15} className="text-blue-600 fill-blue-600" />
                                        <span>Ver Video</span>
                                    </>
                                ) : (
                                    <span>{config.heroBtn2Text || "Nuestros Servicios"}</span>
                                )}
                            </button>
                        </div>

                        {/* 3 Trust Badges */}
                        <div className="pt-6 flex flex-wrap items-center gap-6 text-slate-500 text-xs sm:text-sm font-medium border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <FiCloud className="text-blue-500" size={18} />
                                <span>{isMaster ? "100% en la nube" : "Atención Personalizada"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiLock className="text-blue-500" size={18} />
                                <span>{isMaster ? "Seguro y confiable" : "Tecnología de Vanguardia"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiHeadphones className="text-blue-500" size={18} />
                                <span>{isMaster ? "Soporte 24/7" : "Especialistas Certificados"}</span>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: SHOWCASE */}
                    <div className="lg:col-span-7 relative w-full flex justify-center lg:justify-end z-10 pt-4 lg:pt-0">
                        {/* Soft Glow Backdrop */}
                        <div className="absolute -inset-6 bg-gradient-to-tr from-blue-300/30 via-sky-200/30 to-indigo-200/20 rounded-[4rem] blur-3xl -z-10"></div>

                        {isMaster ? (
                            /* Master Software Dashboard Mockup */
                            <div 
                                className="w-full max-w-[880px] bg-white rounded-3xl border border-slate-300/80 shadow-[0_30px_75px_-15px_rgba(15,23,42,0.22)] overflow-hidden text-slate-800 text-left transition-all duration-700 ease-out origin-right lg:scale-[0.92] xl:scale-100"
                                style={{ 
                                    transform: "perspective(1400px) rotateY(-16deg) rotateX(0deg) rotate(0deg)",
                                    transformStyle: "preserve-3d"
                                }}
                            >
                                <div className="px-5 md:px-7 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">☁</div>
                                            <span className="font-extrabold text-base tracking-tight text-slate-900">Odonto<span className="text-blue-600">Cloud</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 text-center text-slate-400">Plataforma OdontoCloud Master</div>
                            </div>
                        ) : (
                            /* Dental Clinic Hero Showcase Card */
                            <div className="w-full max-w-[650px] relative">
                                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] relative">
                                    <img 
                                        src={config.heroImage || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200"} 
                                        alt="Clínica Dental"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                                        <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">{config.name}</div>
                                        <div className="text-xl font-extrabold">Excelencia Odontológica</div>
                                    </div>
                                </div>

                                {/* Floating Badges */}
                                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                                        ⭐
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-800">Atención 5/5</div>
                                        <div className="text-[10px] text-slate-500">Pacientes Satisfechos</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* 2. "TODO LO QUE TU CLÍNICA NECESITA" - 6 FEATURE CARDS GRID (CLEAN HUMAN MINIMALIST DESIGN) */}
                <div id="funcionalidades" className="pt-12 pb-16 text-center max-w-6xl mx-auto scroll-mt-28">
                    
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 text-center mb-12 tracking-tight">
                        Todo lo que tu clínica necesita
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 justify-center items-center">
                        
                        {/* Card 1: Agenda Inteligente */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl mb-4 mx-auto">
                                <FiCalendar />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 text-center">Agenda Inteligente</h3>
                            <p className="text-xs text-slate-500 leading-relaxed text-center font-normal">Citas, recordatorios y disponibilidad en tiempo real.</p>
                        </div>

                        {/* Card 2: Historia Clínica */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-4 mx-auto">
                                <FiUser />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 text-center">Historia Clínica</h3>
                            <p className="text-xs text-slate-500 leading-relaxed text-center font-normal">Fichas completas y seguras siempre disponibles.</p>
                        </div>

                        {/* Card 3: Odontograma Digital */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-xl mb-4 mx-auto">
                                <FiFileText />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 text-center">Odontograma Digital</h3>
                            <p className="text-xs text-slate-500 leading-relaxed text-center font-normal">Visualiza y registra tratamientos de forma interactiva.</p>
                        </div>

                        {/* Card 4: Facturación y Caja */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xl mb-4 mx-auto">
                                <FiDollarSign />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 text-center">Facturación y Caja</h3>
                            <p className="text-xs text-slate-500 leading-relaxed text-center font-normal">Factura electrónicamente y controla tus ingresos fácilmente.</p>
                        </div>

                        {/* Card 5: Inventario */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center text-xl mb-4 mx-auto">
                                <FiBox />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 text-center">Inventario</h3>
                            <p className="text-xs text-slate-500 leading-relaxed text-center font-normal">Controla productos, stock y proveedores.</p>
                        </div>

                        {/* Card 6: Recordatorios */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-4 mx-auto">
                                <FiMessageSquare />
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mb-1.5 text-center">Recordatorios</h3>
                            <p className="text-xs text-slate-500 leading-relaxed text-center font-normal">Envía recordatorios automáticos por WhatsApp y SMS.</p>
                        </div>

                    </div>
                </div>

                {/* 3. BOTTOM SOCIAL PROOF BANNER */}
                <div className="p-8 md:p-10 rounded-3xl bg-blue-50/60 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-lg shadow-blue-500/25">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mb-0.5">Más de 200 clínicas ya confían en OdontoCloud</h4>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Únete a la transformación digital de la odontología.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/servicios')}
                        className="px-6 py-3.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-600 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-2"
                    >
                        <span>Conoce nuestras funcionalidades</span>
                        <FiArrowRight size={16} />
                    </button>
                </div>

            </div>

            <DocumentationModal
                isOpen={showDocModal}
                onClose={() => setShowDocModal(false)}
            />
        </section>
    );
}


