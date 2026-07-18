import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import factusService from '../../../services/factusService';
import { FiFileText, FiCalendar, FiActivity, FiArrowRight, FiPrinter, FiEye, FiCheckCircle, FiClock, FiXCircle, FiCloudLightning } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/formatters';

export default function HistoricoFacturasTab({ patientId, patient }) {
    const { userProfile } = useAuth();
    const toast = useToast();
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [credentials, setCredentials] = useState(null);
    const [emittingIds, setEmittingIds] = useState({});

    useEffect(() => {
        if (!patientId) return;
        
        const q = query(
            collection(db, "facturas"),
            where("patientId", "==", patientId),
            orderBy("fechaISO", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                fecha: d.data().fechaISO ? new Date(d.data().fechaISO) : new Date()
            }));
            setFacturas(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching invoices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [patientId]);

    useEffect(() => {
        if (!userProfile?.inquilino) return;
        const loadCredentials = async () => {
            try {
                const docRef = doc(db, "tenants", userProfile.inquilino);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.factusClientId && data.factusClientSecret) {
                        setCredentials({
                            factusClientId: data.factusClientId,
                            factusClientSecret: data.factusClientSecret,
                            username: data.factusUsername,
                            password: data.factusPassword,
                            factusTestMode: data.factusTestMode !== undefined ? data.factusTestMode : true
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading Factus credentials:", err);
            }
        };
        loadCredentials();
    }, [userProfile]);

    const handleEmitInvoice = async (invoice) => {
        if (!credentials) {
            toast.error("Por favor configura tus credenciales de Factus en la sección de Configuración antes de emitir facturas.");
            return;
        }
        if (!patient?.documento && !patient?.identificacion) {
            toast.error("El paciente debe tener registrado su Documento/NIT para poder facturar ante la DIAN.");
            return;
        }

        setEmittingIds(prev => ({ ...prev, [invoice.id]: true }));
        try {
            const result = await factusService.sendInvoice(invoice, patient, credentials);
            
            if (result && result.data) {
                const factRef = doc(db, "facturas", invoice.id);
                await updateDoc(factRef, {
                    factusEstado: "Emitido",
                    factusUuid: result.data.uuid || null,
                    factusNumero: result.data.number || null,
                    factusPdfUrl: result.data.pdf || null,
                    factusQr: result.data.qr || null,
                    factusCufe: result.data.cufe || null,
                    nroFactura: result.data.number || invoice.nroFactura || null
                });
                
                toast.success(`Factura electrónica emitida con éxito. Número oficial: ${result.data.number}`);
            }
        } catch (error) {
            console.error("Error emitiendo factura en Factus:", error);
            toast.error(`Error de emisión en Factus: ${error.message}`);
        } finally {
            setEmittingIds(prev => ({ ...prev, [invoice.id]: false }));
        }
    };

    const getStatusStyles = (status) => {
        const s = (status || "pendiente").toLowerCase();
        if (["pagada", "pagado", "paid"].includes(s)) return { color: "bg-emerald-50 text-emerald-600", icon: FiCheckCircle };
        if (["cancelada", "anulada", "void"].includes(s)) return { color: "bg-rose-50 text-rose-600", icon: FiXCircle };
        return { color: "bg-amber-50 text-amber-600", icon: FiClock };
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-30 animate-pulse">
            <FiActivity size={48} className="text-slate-400 mb-4" />
            <h5 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Recuperando Folios...</h5>
        </div>
    );

    if (facturas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-slate-50 border border-slate-100 rounded-[32px] m-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                    <FiFileText size={32} />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight mb-2">No hay Facturas Emitidas</h3>
                <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed px-10">Las facturas se generan al finalizar presupuestos aprobados o realizar ventas directas.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 md:p-10 animate-fadeIn bg-slate-50/20 custom-scrollbar overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                        <FiFileText size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">Historial de <span className="text-indigo-600 underline decoration-indigo-100 decoration-8 underline-offset-4">Facturas</span></h2>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <span>Facturación institucional y RIPS</span>
                           <FiArrowRight size={10} className="text-slate-200" />
                           <span className="text-slate-500">Folios autorizados</span>
                        </div>
                    </div>
                 </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4 pb-20">
                {facturas.map((fact) => {
                    const status = getStatusStyles(fact.estado);
                    return (
                        <div key={fact.id} className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group">
                            
                            <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                                <div className="w-16 h-16 bg-slate-50 rounded-[22px] flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0 shadow-inner">
                                    <FiFileText size={24} />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-4 mb-2">
                                        <h4 className="font-black text-slate-800 text-[16px] uppercase tracking-tighter">Factura #{fact.nroFactura || fact.numero || fact.id.slice(-6).toUpperCase()}</h4>
                                        <div className={`flex items-center gap-2 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${status.color}`}>
                                            <status.icon size={12} strokeWidth={3} />
                                            {fact.estado || "PENDIENTE"}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                             <FiCalendar className="text-slate-300" />
                                             {fact.fechaISO ? new Date(fact.fechaISO).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                                         </div>
                                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                             <FiActivity className="text-slate-300" />
                                             {fact.items?.length || 0} CONCEPTOS FACTURADOS
                                         </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                                 <div className="text-right px-4">
                                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Monto de Venta</div>
                                      <div className="text-2xl font-black text-indigo-700 tracking-tighter leading-none">
                                          <span className="text-[14px] font-bold text-slate-300 mr-1">$</span>
                                          {formatCurrency(fact.total || 0)}
                                      </div>
                                 </div>

                                 <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[22px]">
                                      {fact.factusEstado === "Emitido" ? (
                                          <a
                                              href={fact.factusPdfUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="Ver PDF Oficial Factus"
                                              className="w-11 h-11 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[16px] flex items-center justify-center transition-all shadow-sm"
                                          >
                                              <FiFileText size={18} />
                                          </a>
                                      ) : (
                                          <button
                                              onClick={() => handleEmitInvoice(fact)}
                                              disabled={emittingIds[fact.id]}
                                              title="Emitir Factura Electrónica (DIAN / Factus)"
                                              className="w-11 h-11 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-50 rounded-[16px] flex items-center justify-center transition-all shadow-sm"
                                          >
                                              <FiCloudLightning size={18} className={emittingIds[fact.id] ? "animate-bounce" : ""} />
                                          </button>
                                      )}
                                      <button
                                          onClick={() => alert("Mostrando detalle...")}
                                          title="Ver detalle"
                                          className="w-11 h-11 bg-white text-slate-400 hover:bg-slate-800 hover:text-white rounded-[16px] flex items-center justify-center transition-all shadow-sm"
                                      >
                                          <FiEye size={18} />
                                      </button>
                                      <button
                                          onClick={() => window.print()}
                                          title="Imprimir factura"
                                          className="w-11 h-11 bg-white text-slate-400 hover:bg-indigo-600 hover:text-white rounded-[16px] flex items-center justify-center transition-all shadow-sm"
                                      >
                                          <FiPrinter size={18} />
                                      </button>
                                 </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Tip */}
            <div className="mt-auto py-10 flex items-center justify-center gap-3 opacity-20 hover:opacity-50 transition-opacity">
                 <div className="w-8 h-px bg-slate-400" />
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Facturación Electrónica DIAN Integrada</p>
                 <div className="w-8 h-px bg-slate-400" />
            </div>
        </div>
    );
}
