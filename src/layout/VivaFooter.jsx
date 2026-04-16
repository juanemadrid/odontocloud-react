import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function VivaFooter({ config }) {
    const isMaster = config?.isMaster;

    return (
        <footer className="bg-[var(--viva-blue)] text-white pt-24 pb-12 overflow-hidden relative font-sans">
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

            {/* Subtle Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
                    {/* Brand Column (Span 4) */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link to={isMaster ? "/" : `/c/${config?.slug}`} className="flex items-center gap-4 group">
                            {((config?.logo && !config.logo.includes('logo.png')) || isMaster) && (
                                <img
                                    src={config?.logo?.startsWith('/') ? `${import.meta.env.BASE_URL}${config.logo.slice(1)}` : (config?.logo || `${import.meta.env.BASE_URL}assets/logo.png`)}
                                    alt="Logo"
                                    className="h-12 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                            <span className="text-3xl font-extrabold text-white tracking-tighter">
                                {isMaster ? (
                                    <>Odonto<span className="text-sky-500">Cloud</span></>
                                ) : (
                                    config?.name || "Tu Clínica"
                                )}
                            </span>
                        </Link>
                        <p className="text-slate-400 font-light leading-relaxed text-lg max-w-sm">
                            {isMaster
                                ? "La plataforma líder en gestión dental inteligente. Diseñada para transformar clínicas odontológicas en negocios eficientes y escalables."
                                : (config?.footerDesc || "Comprometidos con la excelencia en salud oral, combinando tecnología de vanguardia con un trato humano excepcional.")
                            }
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href={config?.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-sky-600 hover:text-white text-slate-400 transition-all duration-300 border border-white/5 hover:border-sky-500 hover:scale-110">
                                <FiFacebook size={20} />
                            </a>
                            <a href={config?.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white text-slate-400 transition-all duration-300 border border-white/5 hover:border-pink-500 hover:scale-110">
                                <FiInstagram size={20} />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-700 hover:text-white text-slate-400 transition-all duration-300 border border-white/5 hover:border-blue-600 hover:scale-110">
                                <FiLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns (Span 8 total) */}
                    <div className="lg:col-span-2 lg:col-start-6">
                        <h4 className="text-sm font-bold mb-8 text-white uppercase tracking-widest">{isMaster ? "Solución" : "Menú"}</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><Link to={isMaster ? "/servicios" : `/c/${config?.slug}/servicios`} className="hover:text-sky-400 transition-colors text-sm font-medium">{isMaster ? "Funcionalidades" : "Servicios"}</Link></li>
                            {isMaster && <li><Link to="/planes" className="hover:text-sky-400 transition-colors text-sm font-medium">Planes y Precios</Link></li>}
                            <li><Link to={isMaster ? "/faq" : `/c/${config?.slug}/faq`} className="hover:text-sky-400 transition-colors text-sm font-medium">Preguntas Frecuentes</Link></li>
                            {isMaster && <li><Link to="/login" className="hover:text-sky-400 transition-colors text-sm font-medium">Acceso Clientes</Link></li>}
                            {!isMaster && <li><Link to={`/c/${config?.slug}/portal`} className="hover:text-sky-400 transition-colors text-sm font-medium">Portal Pacientes</Link></li>}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-sm font-bold mb-8 text-white uppercase tracking-widest">Legal & Soporte</h4>
                        <ul className="space-y-4 text-slate-400">
                            {!isMaster && <li><Link to={`/c/${config?.slug}/nosotros`} className="hover:text-sky-400 transition-colors text-sm font-medium">Sobre Nosotros</Link></li>}
                            <li><Link to={isMaster ? "/soporte" : (config?.supportUrl || `/c/${config?.slug}/faq`)} className="hover:text-sky-400 transition-colors text-sm font-medium">{isMaster ? "Centro de Ayuda" : "Soporte"}</Link></li>
                            {/* Fixed broken documentation link */}
                            {isMaster && <li><a href="https://docs.odontocloud.pro" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors text-sm font-medium">Documentación API</a></li>}
                            <li><Link to={config?.privacyUrl || "/privacidad"} className="hover:text-sky-400 transition-colors text-sm font-medium">Política de Privacidad</Link></li>
                            <li><Link to={config?.termsUrl || "/terminos"} className="hover:text-sky-400 transition-colors text-sm font-medium">Términos del Servicio</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-bold mb-8 text-white uppercase tracking-widest">Contacto</h4>
                        <ul className="space-y-6 text-slate-400">
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
                                    <FiPhone size={18} />
                                </div>
                                <span className="font-medium">+57 {(config?.contactPhone || "3001234567")}</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
                                    <FiMail size={18} />
                                </div>
                                <span className="font-medium">{(config?.contactEmail || "soporte@odontocloud.co")}</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
                                    <FiMapPin size={18} />
                                </div>
                                <span className="font-medium text-sm">{(config?.address || "Bogotá, Colombia - World Wide Support")}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} {isMaster ? "OdontoCloud SaaS" : config?.name}. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Seguridad SSL 256-bit</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Cloud Partner</span>
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        </footer>
    );
}
