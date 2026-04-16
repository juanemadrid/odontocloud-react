import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ServicesSection from './landing/ServicesSection';
import TrialModal from '../components/landing/TrialModal';
import { FiArrowRight } from 'react-icons/fi';

export default function Servicios() {
    const { config } = useOutletContext() || {};
    const [showTrialModal, setShowTrialModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("Trial");

    const onShowTrial = () => {
        if (!config?.isMaster) {
            const whatsappUrl = `https://wa.me/57${(config?.contactPhone || "3001234567").replace(/\D/g, '')}?text=Hola,%20quisiera%20agendar%20una%20cita%20en%20${config?.name || 'la clínica'}`;
            window.open(whatsappUrl, '_blank');
            return;
        }
        setShowTrialModal(true);
    };

    return (
        <div className="fade-in min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            {/* HERO SECTION - CLEAN & PREMIUM WHITE */}
            <section className="relative pt-40 pb-10 px-6 overflow-hidden bg-white">
                <div className="container mx-auto max-w-7xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <span className="text-blue-700 text-xs font-bold tracking-widest uppercase">Ecosistema Integral</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-slate-900 tracking-tight leading-tight">
                        Todo lo que tu clínica necesita <br />
                        <span className="text-blue-600">en un solo lugar</span>
                    </h1>

                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                        Olvídate de usar múltiples herramientas desconectadas. Centraliza tu operación con la suite más potente del mercado.
                    </p>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute top-[10%] -right-[5%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none"></div>
            </section>

            {/* SERVICES GRID - SHARED COMPONENT */}
            <ServicesSection config={{ ...config, servicesSectionTitle: null }} dark={false} onShowTrial={onShowTrial} />

            {/* CTA SECTION - CLEAN & ELEGANT */}
            <section className="bg-[#022a63] text-white py-24 relative overflow-hidden mt-auto">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                        ¿Listo para escalar tu negocio?
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-light">
                        Únete a las clínicas más exitosas que ya confían en OdontoCloud para su gestión diaria.
                    </p>
                    <button
                        onClick={onShowTrial}
                        className="bg-white text-[#022a63] px-10 py-4 rounded-full font-bold text-sm tracking-widest hover:bg-amber-400 hover:text-[#022a63] hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-xl inline-flex items-center gap-2"
                    >
                        COMENZAR PRUEBA GRATIS <FiArrowRight />
                    </button>
                </div>
            </section>

            {/* TRIAL MODAL */}
            <TrialModal
                isOpen={showTrialModal}
                onClose={() => setShowTrialModal(false)}
                initialPlan={selectedPlan}
            />
        </div>
    );
}
