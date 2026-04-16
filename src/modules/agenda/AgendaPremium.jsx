import React, { useState } from "react";
import { FiHome } from "react-icons/fi";
import { useAgenda } from "./hooks/useAgenda";
import AgendaGrid from "./components/AgendaGrid";
import AppointmentModal from "./components/AppointmentModal";
import Button from "../../components/ui/Button";
import { sendConfirmation } from "../../services/WhatsAppService"; // ⬇️ NUEVO

export default function Agenda() {
    const {
        selectedDate, setSelectedDate,
        doctors, appointments,
        createAppointment, updateAppointment, deleteAppointment
    } = useAgenda();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingApt, setEditingApt] = useState(null);
    const [slotData, setSlotData] = useState(null); // { doctorId, time } for new apts

    const handleSlotClick = (doctorId, time) => {
        // Parse time string "HH:mm" to Date
        const [hh, mm] = time.split(":").map(Number);
        const start = new Date(selectedDate);
        start.setHours(hh, mm, 0, 0);

        setSlotData({ doctorId, start });
        setEditingApt(null);
        setModalOpen(true);
    };

    const handleEventClick = (apt) => {
        setEditingApt(apt);
        setSlotData(null);
        setModalOpen(true);
    };

    const handleSave = async (data) => {
        if (editingApt) {
            await updateAppointment(editingApt.id, data);
        } else {
            await createAppointment(data);
        }
    };

    const handleDelete = async () => {
        if (editingApt && window.confirm("¿Seguro de eliminar esta cita?")) {
            await deleteAppointment(editingApt.id);
            setModalOpen(false);
        }
    };

    // ⬇️ NUEVO: Handler WhatsApp
    const handleWhatsApp = async () => {
        if (!editingApt) return;
        try {
            const res = await sendConfirmation(editingApt);
            alert("✅ " + res.message);
        } catch (e) {
            alert("❌ " + e.message);
        }
    };

    // Date Navigation
    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d);
    };

    return (
        <div className="w-full flex flex-col gap-10 animate-fadeIn px-2 md:px-6 lg:px-10 pb-10">
            {/* 1. THE ARCHITECTURAL HEADER (Slender Pro Institutional Style) */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <FiHome className="text-blue-600" />
                        <span>Institucional</span>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-800">Control de Agenda</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                        Gestión <span className="text-blue-600">Agenda</span>
                    </h2>
                    <div className="w-12 h-1.5 bg-blue-600 rounded-full" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => { setSlotData(null); setEditingApt(null); setModalOpen(true); }}
                        className="flex items-center gap-3 px-8 py-4 rounded-[22px] bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-xl shadow-blue-100 transition-all active:scale-95"
                    >
                        <span>+ Nueva Cita</span>
                    </button>
                    <button
                        className="flex items-center gap-3 px-8 py-4 rounded-[22px] bg-white text-slate-400 border border-slate-100 hover:text-slate-800 shadow-slate-50 font-black text-[11px] uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg"
                    >
                        Configuración
                    </button>
                </div>
            </div>

            {/* 2. THE SLENDER HUD (Controls & Date Nav) */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-4 flex flex-col lg:flex-row items-center justify-between gap-4">

                {/* Date Navigation */}
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100 w-full lg:w-auto justify-between lg:justify-start">
                    <button onClick={() => changeDate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100">
                        ◀
                    </button>
                    <div className="px-6 font-black text-slate-700 min-w-[200px] text-center uppercase tracking-widest text-[11px]">
                        {selectedDate.toLocaleDateString("es-CO", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={() => changeDate(1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100">
                        ▶
                    </button>
                </div>

                <div className="flex items-center gap-3 px-4">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-5 py-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Doctores: {doctors.length}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-5 py-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Citas: {appointments.length}</span>
                    </div>
                </div>
            </div>

            {/* 3. THE INSTITUTIONAL CONTENT (Grid) */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden p-6 relative min-h-[600px]">
                <AgendaGrid
                    date={selectedDate}
                    doctors={doctors}
                    appointments={appointments}
                    onSlotClick={handleSlotClick}
                    onEventClick={handleEventClick}
                />
            </div>

            <AppointmentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                initialData={editingApt || slotData || { start: new Date() }} // Default to now if nothing
                doctors={doctors}
                chairs={[]} // Pasaremos consultorios si el hook los carga
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
}
