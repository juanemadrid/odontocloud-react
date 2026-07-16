import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiPlus, FiCalendar, FiSearch, FiPrinter, FiEye, FiTrash2, FiX } from "react-icons/fi";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
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

export default function NotaCreditoList({ onNew }) {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino || "";

    const [loading, setLoading] = useState(true);
    const [notas, setNotas] = useState([]);
    
    // Toggles and filters
    const [detalleMovimientos, setDetalleMovimientos] = useState(false);
    const [conSaldo, setConSaldo] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [fechaInicio, setFechaInicio] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

    // View Modal
    const [viewModal, setViewModal] = useState({ open: false, nota: null });
    
    // Void Modal
    const [voidModal, setVoidModal] = useState({ open: false, nota: null });
    const [voidReason, setVoidReason] = useState("");
    const [voidUser, setVoidUser] = useState("");

    useEffect(() => {
        if (userProfile) {
            setVoidUser(userProfile.nombreCompleto || userProfile.nombre || userProfile.email || "");
        }
    }, [userProfile]);

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

            const q = query(
                collection(db, "notas_credito"),
                where("inquilino", "==", inquilino)
            );
            const snap = await getDocs(q);
            const list = snap.docs.map(doc => {
                const data = doc.data();
                const ts = data.fecha;
                const dObj = ts?.toDate ? ts.toDate() : new Date(ts);
                return {
                    id: doc.id,
                    ...data,
                    fechaObj: dObj
                };
            });

            // Filter locally by date range
            const filtered = list.filter(item => {
                return item.fechaObj >= start && item.fechaObj <= end;
            });

            // Sort by date desc
            filtered.sort((a, b) => b.fechaObj - a.fechaObj);

            setNotas(filtered);
        } catch (e) {
            console.error("Error loading credit notes:", e);
        } finally {
            setLoading(false);
        }
    }, [inquilino, fechaInicio, fechaFin]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredNotas = useMemo(() => {
        return notas.filter(n => {
            // "Con saldo" filter
            if (conSaldo && Number(n.saldoFavor || 0) <= 0) return false;

            // Search filter
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchesName = (n.pacienteNombre || "").toLowerCase().includes(q);
                const matchesDoc = (n.nroConsecutivo || "").toLowerCase().includes(q);
                const matchesNotes = (n.notas || "").toLowerCase().includes(q);
                if (!matchesName && !matchesDoc && !matchesNotes) return false;
            }

            return true;
        });
    }, [notas, conSaldo, searchTerm]);

    const handlePrint = (nota) => {
        const printWindow = window.open("", "_blank");
        const dateStr = fmtDate(nota.fecha);
        const totalStr = fmt(nota.total);
        const ticketNum = nota.nroConsecutivo || nota.id.slice(0, 8).toUpperCase();
        const isAnulado = nota.estado === "Anulado";
        
        const anulStamp = isAnulado ? `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:90px;font-weight:900;color:rgba(239,68,68,0.13);text-transform:uppercase;letter-spacing:6px;pointer-events:none;z-index:0;white-space:nowrap;">ANULADO</div>` : "";
        const anulBanner = isAnulado ? `
            <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:14px 20px;margin-bottom:24px;display:flex;align-items:flex-start;gap:12px;">
                <span style="font-size:22px;">🚫</span>
                <div>
                    <div style="font-size:13px;font-weight:900;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Nota de Crédito Anulada</div>
                    ${nota.motivoAnulacion ? `<div style="font-size:12px;color:#7f1d1d;margin-top:4px;"><strong>Motivo:</strong> ${nota.motivoAnulacion}</div>` : ""}
                    ${nota.anuladoPor ? `<div style="font-size:11px;color:#991b1b;margin-top:2px;"><strong>Anulado por:</strong> ${nota.anuladoPor}</div>` : ""}
                    ${nota.fechaAnulacion ? `<div style="font-size:11px;color:#991b1b;margin-top:2px;"><strong>Fecha anulación:</strong> ${new Date(nota.fechaAnulacion).toLocaleString("es-CO")}</div>` : ""}
                </div>
            </div>` : "";

        let conceptsHtml = "";
        if (nota.conceptos && nota.conceptos.length > 0) {
            nota.conceptos.forEach(c => {
                conceptsHtml += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>${c.concepto}</strong><br><small style="color: #64748b;">${c.descripcion || ""}</small></td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${c.cantidad}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${fmt(c.precioUnitario)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">${fmt(c.total || (c.precioUnitario * c.cantidad))}</td>
                    </tr>
                `;
            });
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Nota de Crédito #${ticketNum}${isAnulado ? ' [ANULADO]' : ''}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; position: relative; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${isAnulado ? '#fca5a5' : '#f1f5f9'}; padding-bottom: 20px; margin-bottom: 30px; }
                        .title { font-size: 24px; font-weight: 900; text-transform: uppercase; color: ${isAnulado ? '#dc2626' : '#ec4899'}; }
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
                            <div class="title">Nota de Crédito${isAnulado ? ' — ANULADA' : ''}</div>
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
                            <strong style="font-size: 14px;">${nota.pacienteNombre}</strong>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: #64748b; font-weight: bold;">SALDO A FAVOR GENERADO:</span><br>
                            <strong style="font-size: 14px; text-transform: uppercase; color: #16a34a;">
                                ${nota.generarSaldoFavor ? `SÍ (${fmt(nota.total)})` : 'NO'}
                            </strong>
                        </div>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th style="text-align: center;">Cant.</th>
                                <th style="text-align: right;">P. Unitario</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${conceptsHtml}
                        </tbody>
                    </table>
                    <div class="total-row">
                        Valor Nota Crédito: <span style="color: #ec4899; margin-left: 10px;">${totalStr}</span>
                    </div>
                    ${nota.notas ? `<div style="margin-top:20px; font-size:12px; background:#f8fafc; padding:15px; border-radius:8px; border: 1px solid #e2e8f0;"><strong>Observaciones:</strong> ${nota.notas}</div>` : ""}
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

    const handleConfirmVoid = async () => {
        if (!voidReason.trim()) {
            alert("El motivo de la anulación es obligatorio");
            return;
        }

        try {
            const nota = voidModal.nota;

            // 1. Update Nota de Crédito status
            await updateDoc(doc(db, "notas_credito", nota.id), {
                estado: "Anulado",
                motivoAnulacion: voidReason.trim(),
                anuladoPor: voidUser.trim(),
                fechaAnulacion: new Date().toISOString()
            });

            // 2. Void related payment (Saldo a favor) in "pagos" collection
            if (nota.pagoId) {
                try {
                    await updateDoc(doc(db, "pagos", nota.pagoId), {
                        estado: "Anulado",
                        motivoAnulacion: `Anulación por Nota de Crédito #${nota.nroConsecutivo || nota.id.slice(0, 8).toUpperCase()}`,
                        anuladoPor: voidUser.trim(),
                        fechaAnulacion: new Date().toISOString()
                    });
                } catch (pagoErr) {
                    console.error("Error voiding related payment:", pagoErr);
                }
            }

            await loadData();
            setVoidModal({ open: false, nota: null });
        } catch (e) {
            console.error("Error voiding credit note:", e);
            alert("Error al anular la nota de crédito");
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">

            {/* Filter Toggle Cards & Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                            Detalle de movimientos por tercero
                        </span>
                        <button
                            type="button"
                            onClick={() => setDetalleMovimientos(!detalleMovimientos)}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                                detalleMovimientos ? "bg-[#8cc33f]" : "bg-slate-200"
                            }`}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ${
                                    detalleMovimientos ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                            ¿Con saldo?
                        </span>
                        <button
                            type="button"
                            onClick={() => setConSaldo(!conSaldo)}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                                conSaldo ? "bg-[#8cc33f]" : "bg-slate-200"
                            }`}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ${
                                    conSaldo ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-center gap-4 lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Buscar...</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <FiSearch size={14} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Nombre o consecutivo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-full text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Fecha Inicio</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <FiCalendar size={14} />
                                </span>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-full text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Fecha Fin</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <FiCalendar size={14} />
                                </span>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-full text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Notas de Crédito...</p>
                    </div>
                ) : filteredNotas.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
                        <span className="text-4xl">🗒️</span>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">No se encontraron notas de crédito.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota crédito</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente/Tercero</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor total</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor usado</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo a favor</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredNotas.map((n) => (
                                    <tr key={n.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="py-4 px-6 text-xs font-bold text-slate-500 whitespace-nowrap">
                                            {fmtDate(n.fecha)}
                                        </td>
                                        <td className="py-4 px-6 text-xs font-extrabold text-rose-500 uppercase whitespace-nowrap">
                                            #{n.nroConsecutivo || n.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="py-4 px-6 text-xs font-black text-slate-700">
                                            {n.pacienteNombre}
                                        </td>
                                        <td className="py-4 px-6 text-xs font-black text-slate-700 text-right whitespace-nowrap">
                                            {fmt(n.total)}
                                        </td>
                                        <td className="py-4 px-6 text-xs font-bold text-slate-400 text-right whitespace-nowrap">
                                            {fmt(n.valorUsado || 0)}
                                        </td>
                                        <td className="py-4 px-6 text-xs font-black text-emerald-600 text-right whitespace-nowrap">
                                            {fmt(n.saldoFavor || 0)}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-400 max-w-[200px] truncate" title={n.notas}>
                                            {n.notas || "—"}
                                        </td>
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider leading-none ${
                                                n.estado === "Anulado" 
                                                    ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            }`}>
                                                {n.estado || "Activo"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handlePrint(n)}
                                                    className="w-8 h-8 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition-all"
                                                    title="Imprimir nota crédito"
                                                >
                                                    <FiPrinter size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setViewModal({ open: true, nota: n })}
                                                    className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all"
                                                    title="Ver detalles"
                                                >
                                                    <FiEye size={14} />
                                                </button>
                                                {n.estado !== "Anulado" && (
                                                    <button
                                                        onClick={() => {
                                                            setVoidReason("");
                                                            setVoidModal({ open: true, nota: n });
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 hover:text-rose-700 rounded-lg transition-all"
                                                        title="Anular"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {viewModal.open && viewModal.nota && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Detalle Nota de Crédito</span>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mt-1">
                                    #{viewModal.nota.nroConsecutivo || viewModal.nota.id.slice(0, 8).toUpperCase()}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setViewModal({ open: false, nota: null })}
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-6 text-xs">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Paciente/Tercero</span>
                                    <strong className="text-slate-700 text-sm block">{viewModal.nota.pacienteNombre}</strong>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Fecha</span>
                                    <strong className="text-slate-700 text-sm block">{fmtDate(viewModal.nota.fecha)}</strong>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Conceptos Detallados</span>
                                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="p-3 text-[10px] font-black text-slate-400 uppercase">Concepto</th>
                                                <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-center">Cant</th>
                                                <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-right">Precio Unit.</th>
                                                <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {viewModal.nota.conceptos?.map((c, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50">
                                                    <td className="p-3 text-slate-700 font-bold">
                                                        {c.concepto}
                                                        {c.descripcion && <span className="block text-[10px] text-slate-400 font-normal">{c.descripcion}</span>}
                                                    </td>
                                                    <td className="p-3 text-slate-500 text-center font-bold">{c.cantidad}</td>
                                                    <td className="p-3 text-slate-500 text-right font-bold">{fmt(c.precioUnitario)}</td>
                                                    <td className="p-3 text-slate-700 text-right font-black">{fmt(c.total || (c.precioUnitario * c.cantidad))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Saldo a favor generado</span>
                                    <strong className="text-slate-700 text-sm block">{viewModal.nota.generarSaldoFavor ? "Sí" : "No"}</strong>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Valor Total</span>
                                    <strong className="text-rose-500 text-lg font-black block">{fmt(viewModal.nota.total)}</strong>
                                </div>
                            </div>

                            {viewModal.nota.notas && (
                                <div className="text-xs">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Observaciones</span>
                                    <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 font-bold italic leading-relaxed">
                                        "{viewModal.nota.notas}"
                                    </p>
                                </div>
                            )}

                            {viewModal.nota.estado === "Anulado" && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs space-y-1">
                                    <strong className="text-rose-600 uppercase tracking-wider text-[10px] block">Motivo de Anulación:</strong>
                                    <p className="text-rose-800 font-bold">"{viewModal.nota.motivoAnulacion || "—"}"</p>
                                    <div className="flex gap-4 text-[10px] text-rose-500 font-medium pt-1">
                                        <span>Por: {viewModal.nota.anuladoPor || "—"}</span>
                                        <span>•</span>
                                        <span>Fecha: {viewModal.nota.fechaAnulacion ? new Date(viewModal.nota.fechaAnulacion).toLocaleString("es-CO") : "—"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Void Confirmation Modal */}
            {voidModal.open && voidModal.nota && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Confirmar Anulación</span>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mt-1">
                                    Nota de Crédito #{voidModal.nota.nroConsecutivo || voidModal.nota.id.slice(0, 8).toUpperCase()}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setVoidModal({ open: false, nota: null })}
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                ¿Estás seguro de que deseas anular esta Nota de Crédito? Si generó un saldo a favor, el saldo a favor también se anulará. Esta acción no se puede deshacer.
                            </p>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Motivo de Anulación *</label>
                                <textarea
                                    required
                                    placeholder="Indique el motivo por el cual anula este documento..."
                                    value={voidReason}
                                    onChange={(e) => setVoidReason(e.target.value)}
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-100 hover:border-slate-200 focus:bg-white rounded-2xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setVoidModal({ open: false, nota: null })}
                                className="h-10 px-6 rounded-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 border border-slate-200 hover:bg-white transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmVoid}
                                disabled={!voidReason.trim()}
                                className="h-10 px-8 rounded-full text-xs font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-rose-500/20"
                            >
                                Confirmar Anulación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
