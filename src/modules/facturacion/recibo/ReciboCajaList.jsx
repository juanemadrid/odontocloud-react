import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiCalendar, FiSearch, FiPrinter, FiEdit2, FiTrash2, FiArrowLeft, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, Timestamp, doc, updateDoc, increment, addDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

const fmtDate = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export default function ReciboCajaList({ onNew }) {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [loading, setLoading] = useState(true);
    const [recibos, setRecibos] = useState([]);

    // Modal: Ver motivo de anulación
    const [viewVoidModal, setViewVoidModal] = useState({ open: false, recibo: null });

    // Void Modal State
    const [voidModal, setVoidModal] = useState({ open: false, recibo: null });
    const [voidReason, setVoidReason] = useState("");
    const [voidUser, setVoidUser] = useState("");

    useEffect(() => {
        if (userProfile) {
            setVoidUser(userProfile.nombreCompleto || userProfile.nombre || userProfile.email || "");
        }
    }, [userProfile]);

    const handlePrint = (recibo) => {
        const printWindow = window.open("", "_blank");
        const dateStr = fmtDate(recibo.fecha);
        const totalStr = fmt(recibo.total);
        const ticketNum = recibo.nroConsecutivo || recibo.id.slice(0, 8).toUpperCase();
        const isAnulado = recibo.estado === "Anulado";
        const anulStamp = isAnulado ? `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:90px;font-weight:900;color:rgba(239,68,68,0.13);text-transform:uppercase;letter-spacing:6px;pointer-events:none;z-index:0;white-space:nowrap;">ANULADO</div>` : "";
        const anulBanner = isAnulado ? `
            <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:14px 20px;margin-bottom:24px;display:flex;align-items:flex-start;gap:12px;">
                <span style="font-size:22px;">🚫</span>
                <div>
                    <div style="font-size:13px;font-weight:900;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Recibo Anulado</div>
                    ${recibo.motivoAnulacion ? `<div style="font-size:12px;color:#7f1d1d;margin-top:4px;"><strong>Motivo:</strong> ${recibo.motivoAnulacion}</div>` : ""}
                    ${recibo.anuladoPor ? `<div style="font-size:11px;color:#991b1b;margin-top:2px;"><strong>Anulado por:</strong> ${recibo.anuladoPor}</div>` : ""}
                    ${recibo.fechaAnulacion ? `<div style="font-size:11px;color:#991b1b;margin-top:2px;"><strong>Fecha anulación:</strong> ${new Date(recibo.fechaAnulacion).toLocaleString("es-CO")}</div>` : ""}
                </div>
            </div>` : "";
        
        let conceptsHtml = "";
        if (recibo.conceptos && recibo.conceptos.length > 0) {
            recibo.conceptos.forEach(c => {
                conceptsHtml += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>${c.concepto}</strong><br><small style="color: #64748b;">${c.descripcion || ""}</small></td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${c.cantidad}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${fmt(c.precioUnitario)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">-${fmt(c.descuento)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">${fmt(c.total)}</td>
                    </tr>
                `;
            });
        } else {
            conceptsHtml = `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>${recibo.concepto || "Abono a tratamiento"}</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">1</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${fmt(recibo.total)}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">$0</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">${fmt(recibo.total)}</td>
                </tr>
            `;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Recibo de Caja #${ticketNum}${isAnulado ? ' [ANULADO]' : ''}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; position: relative; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${isAnulado ? '#fca5a5' : '#f1f5f9'}; padding-bottom: 20px; margin-bottom: 30px; }
                        .title { font-size: 24px; font-weight: 900; text-transform: uppercase; color: ${isAnulado ? '#dc2626' : '#10b981'}; }
                        .details { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
                        .table { border-collapse: collapse; margin-bottom: 30px; width: 100%; }
                        .table th { background: #f8fafc; padding: 12px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; text-align: left; }
                        .total-row { display: flex; justify-content: flex-end; font-size: 16px; font-weight: 900; margin-top: 20px; padding-top: 20px; border-top: 2px solid #f1f5f9; }
                        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    ${anulStamp}
                    <div class="header">
                        <div>
                            <div class="title">Recibo de Caja${isAnulado ? ' — ANULADO' : ''}</div>
                            <div style="font-size: 12px; color: #64748b; font-weight: bold; margin-top: 5px;">CLINICA DENTAL</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 900; font-size: 14px;">NRO: #${ticketNum}</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Fecha: ${dateStr}</div>
                        </div>
                    </div>
                    ${anulBanner}
                    <div class="details">
                        <div>
                            <span style="color: #64748b; font-weight: bold;">PACIENTE / TERCERO:</span><br>
                            <strong style="font-size: 14px;">${recibo.pacienteNombre}</strong>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: #64748b; font-weight: bold;">MÉTODO / CONDICIÓN:</span><br>
                            <strong style="font-size: 14px; text-transform: uppercase;">${recibo.condicionPago || "Contado"}</strong>
                        </div>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th style="text-align: center;">Cant.</th>
                                <th style="text-align: right;">P. Unitario</th>
                                <th style="text-align: right;">Desc.</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${conceptsHtml}
                        </tbody>
                    </table>
                    <div class="total-row">
                        Total Pagado: <span style="color: #16a34a; margin-left: 10px;">${totalStr}</span>
                    </div>
                    <div class="footer">
                        ¡Gracias por su confianza! · Documento impreso automáticamente desde OdontoCloud
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleOpenVoid = (recibo) => {
        setVoidReason("");
        setVoidModal({ open: true, recibo });
    };

    const handleConfirmVoid = async () => {
        if (!voidReason.trim()) {
            alert("El motivo de la anulación es obligatorio");
            return;
        }
        
        try {
            const recibo = voidModal.recibo;
            const targetCollection = recibo.isPago ? "pagos" : "recibos_caja";
            
            // 1. Update document status
            const docRef = doc(db, targetCollection, recibo.id);
            await updateDoc(docRef, {
                estado: "Anulado",
                motivoAnulacion: voidReason.trim(),
                anuladoPor: voidUser.trim(),
                fechaAnulacion: new Date().toISOString()
            });

            // 2. Synchronize with active Caja session (if exists)
            const cSnap = await getDocs(query(
                collection(db, "cajas"), 
                where("inquilino", "==", inquilino),
                where("estado", "==", "abierta"),
                where("usuarioId", "==", userProfile?.uid)
            ));
            
            if (!cSnap.empty) {
                const activeCaja = { id: cSnap.docs[0].id, ...cSnap.docs[0].data() };
                const movData = {
                    inquilino,
                    tipo: "egreso",
                    concepto: `Anulación de recibo #${recibo.id.slice(0, 8).toUpperCase()}`,
                    monto: recibo.total,
                    metodoPago: recibo.condicionPago || "Otros",
                    descripcion: `Anulación del recibo de ${recibo.pacienteNombre}. Motivo: ${voidReason.trim()}`,
                    pacienteId: recibo.pacienteId || "",
                    pacienteNombre: recibo.pacienteNombre,
                    pagoId: recibo.id,
                    usuarioId: userProfile?.uid,
                    usuarioNombre: userProfile?.nombre || userProfile?.email,
                    fecha: Timestamp.now(),
                };
                
                await addDoc(collection(db, "cajas", activeCaja.id, "movimientos"), movData);
                await updateDoc(doc(db, "cajas", activeCaja.id), {
                    saldoActual: increment(-recibo.total),
                    totalEgresos: increment(recibo.total)
                });
            }

            await loadData();
            setVoidModal({ open: false, recibo: null });
        } catch (e) {
            console.error("Error voiding receipt:", e);
            alert("Error al anular el recibo");
        }
    };
    
    // Filters - declared before loadData so they're captured correctly
    const [fechaInicio, setFechaInicio] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");

    // Parse date string as local date (not UTC) to avoid timezone boundary bugs
    const parseLocalDate = (dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const loadData = useCallback(async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            const start = parseLocalDate(fechaInicio);
            start.setHours(0, 0, 0, 0);
            const end = parseLocalDate(fechaFin);
            end.setHours(23, 59, 59, 999);

            // 1. Fetch recibos_caja
            const qRecibos = query(
                collection(db, "recibos_caja"),
                where("inquilino", "==", inquilino)
            );
            const snapRecibos = await getDocs(qRecibos);
            const dataRecibos = snapRecibos.docs.map(d => ({ 
                id: d.id, 
                ...d.data(),
                isPago: false 
            }));

            // 2. Fetch pagos (abonos from patient profile)
            const qPagos = query(
                collection(db, "pagos"),
                where("inquilino", "==", inquilino)
            );
            const snapPagos = await getDocs(qPagos);
            const dataPagos = snapPagos.docs
                .map(d => {
                    const pData = d.data();
                    const medioRaw = pData.medio || "Abono";
                    const condicionPago = medioRaw.toLowerCase() === "saldo a favor" ? "Consumo s. a favor" : medioRaw;
                    return {
                        id: d.id,
                        nroConsecutivo: pData.nroConsecutivo || "",
                        fecha: pData.fecha,
                        pacienteNombre: pData.patientNombre || pData.pacienteNombre || "—",
                        condicionPago: condicionPago,
                        concepto: pData.concepto || "Abono",
                        total: pData.monto || 0,
                        isPago: true
                    };
                })
                .filter(p => p.concepto !== "SALDO A FAVOR");

            // Combine and filter by date range client-side
            let data = [...dataRecibos, ...dataPagos];
            const startTime = start.getTime();
            const endTime = end.getTime();
            data = data.filter(r => {
                if (!r.fecha) return false;
                const rTime = r.fecha.toDate ? r.fecha.toDate().getTime() : new Date(r.fecha).getTime();
                return rTime >= startTime && rTime <= endTime;
            });
            
            // Sort descending by fecha
            data.sort((a, b) => {
                const ta = a.fecha?.toDate ? a.fecha.toDate().getTime() : new Date(a.fecha).getTime();
                const tb = b.fecha?.toDate ? b.fecha.toDate().getTime() : new Date(b.fecha).getTime();
                return tb - ta;
            });
            
            setRecibos(data);
        } catch (e) {
            console.error("Error cargando recibos:", e);
        } finally {
            setLoading(false);
        }
    }, [inquilino, fechaInicio, fechaFin]);

    // Re-fetch whenever inquilino or date range changes (also fires on mount)
    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredRecibos = recibos.filter(r => 
        (r.pacienteNombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateNew = onNew || (() => navigate("nuevo"));

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">

            {/* Filter Card */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Inicial</label>
                        <div className="relative">
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="date" 
                                className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Final</label>
                        <div className="relative">
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="date" 
                                className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={loadData}
                        className="h-11 flex items-center justify-center gap-2 bg-[#8cc33f] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#7db02b] transition-all active:scale-95 shadow"
                    >
                        <FiSearch /> Buscar
                    </button>
                </div>
            </div>

            {/* Text filter bar */}
            <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm max-w-md">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por paciente o recibo..."
                        className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Receipts Table */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-auto max-h-[550px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100 shadow-[inset_0_-1px_0_rgba(226,232,240,0.8)]">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4 pl-8">Recibo #</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Condición</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center pr-8 w-36">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-[#8cc33f] border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando recibos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRecibos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 italic">
                                        No se encontraron recibos de caja en este rango de fechas.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecibos.map(r => (
                                    <tr key={r.id} className={`transition-colors group ${r.estado === "Anulado" ? "bg-rose-50/40 hover:bg-rose-50/60" : "hover:bg-slate-50/30"}`}>
                                        <td className="px-6 py-4 pl-8 font-bold font-mono text-slate-800">
                                            #{r.nroConsecutivo || r.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-500">
                                            {fmtDate(r.fecha)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 uppercase tracking-tight">{r.pacienteNombre}</div>
                                            {r.concepto && (
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{r.concepto}</div>
                                            )}
                                            {r.estado === "Anulado" && (
                                                <span className="inline-block mt-1.5 px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-black uppercase tracking-widest leading-none">
                                                    Anulado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {r.condicionPago || "Contado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900 font-mono">
                                            {fmt(r.total)}
                                        </td>
                                        <td className="px-6 py-4 text-center pr-8 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handlePrint(r)}
                                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all shadow-sm"
                                                    title="Imprimir"
                                                >
                                                    <FiPrinter size={14} />
                                                </button>
                                                {!r.isPago && r.estado !== "Anulado" && (
                                                    <button 
                                                        onClick={() => navigate(`editar/${r.id}`)}
                                                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center transition-all shadow-sm"
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                )}
                                                {r.estado === "Anulado" && (
                                                    <button 
                                                        onClick={() => setViewVoidModal({ open: true, recibo: r })}
                                                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-all shadow-sm"
                                                        title="Ver motivo de anulación"
                                                    >
                                                        <FiEye size={14} />
                                                    </button>
                                                )}
                                                {r.estado !== "Anulado" && (
                                                    <button 
                                                        onClick={() => handleOpenVoid(r)}
                                                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-all shadow-sm"
                                                        title="Anular recibo"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* MODAL: ANULACION */}
            {voidModal.open && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-[500px] rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                    Anulación
                                </h3>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setVoidModal({ open: false, recibo: null })}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-500 transition-all shadow-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Banco/Caja *</label>
                                <select 
                                    disabled
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                                    value={voidUser}
                                >
                                    <option value={voidUser}>{voidUser}</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Motivo de anulación *</label>
                                <textarea 
                                    required
                                    value={voidReason}
                                    onChange={e => setVoidReason(e.target.value)}
                                    placeholder="Ingresa el motivo detallado de la anulación"
                                    className="w-full h-28 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-all resize-none font-sans"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
                            <button
                                type="button"
                                onClick={() => setVoidModal({ open: false, recibo: null })}
                                className="h-10 px-5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmVoid}
                                className="h-10 px-6 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 active:scale-95 animate-pulse-subtle"
                            >
                                Anular
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: VER MOTIVO DE ANULACIÓN */}
            {viewVoidModal.open && viewVoidModal.recibo && (
                <div
                    className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setViewVoidModal({ open: false, recibo: null })}
                >
                    <div
                        className="bg-white w-full max-w-[460px] rounded-[28px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/60">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                                    <span className="text-lg">🚫</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-rose-800 uppercase tracking-tight">Recibo Anulado</h3>
                                    <p className="text-[10px] text-rose-400 font-bold"># {viewVoidModal.recibo.nroConsecutivo || viewVoidModal.recibo.id.slice(0,8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewVoidModal({ open: false, recibo: null })}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-rose-200 text-rose-400 hover:text-rose-600 transition-all text-sm font-bold shadow-sm"
                            >
                                ✕
                            </button>
                        </div>
                        {/* Content */}
                        <div className="p-8 space-y-5">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</p>
                                <p className="text-sm font-black text-slate-800 uppercase">{viewVoidModal.recibo.pacienteNombre}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo de anulación</p>
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                                    <p className="text-sm font-bold text-rose-800 leading-relaxed">
                                        {viewVoidModal.recibo.motivoAnulacion || "Sin motivo registrado"}
                                    </p>
                                </div>
                            </div>
                            {viewVoidModal.recibo.anuladoPor && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anulado por</p>
                                    <p className="text-sm font-bold text-slate-700">{viewVoidModal.recibo.anuladoPor}</p>
                                </div>
                            )}
                            {viewVoidModal.recibo.fechaAnulacion && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de anulación</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {new Date(viewVoidModal.recibo.fechaAnulacion).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => setViewVoidModal({ open: false, recibo: null })}
                                className="h-10 px-6 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all active:scale-95"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
