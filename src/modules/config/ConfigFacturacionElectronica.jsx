import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FiSave, FiInfo, FiFileText, FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import Input from "../../components/ui/Input";
import factusService from "../../services/factusService";

export default function ConfigFacturacionElectronica() {
    const { userProfile } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [showApiPassword, setShowApiPassword] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        factusClientId: "",
        factusClientSecret: "",
        factusUsername: "",
        factusPassword: "",
        factusTestMode: true,
        dianResolucion: "",
        dianPrefijo: "",
        dianRangoDesde: 1,
        dianRangoHasta: 1000,
        dianClaveTecnica: "",
        dianFechaResolucion: ""
    });

    useEffect(() => {
        if (userProfile && userProfile.inquilino) {
            loadData();
        }
    }, [userProfile]);

    const loadData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "tenants", userProfile.inquilino);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setFormData({
                    factusClientId: data.factusClientId || "",
                    factusClientSecret: data.factusClientSecret || "",
                    factusUsername: data.factusUsername || "",
                    factusPassword: data.factusPassword || "",
                    factusTestMode: data.factusTestMode !== undefined ? data.factusTestMode : true,
                    dianResolucion: data.dianResolucion || "",
                    dianPrefijo: data.dianPrefijo || "",
                    dianRangoDesde: data.dianRangoDesde || 1,
                    dianRangoHasta: data.dianRangoHasta || 1000,
                    dianClaveTecnica: data.dianClaveTecnica || "",
                    dianFechaResolucion: data.dianFechaResolucion || ""
                });
            }
        } catch (error) {
            console.error("Error cargando configuración de facturación:", error);
            toast.error("Error al cargar configuración");
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        if (!formData.factusClientId || !formData.factusClientSecret || !formData.factusUsername || !formData.factusPassword) {
            toast.error("Por favor ingresa todos los campos de credenciales de la API Factus (Client ID, Secret, Usuario y Contraseña) antes de probar la conexión.");
            return;
        }

        setTestingConnection(true);
        try {
            const res = await factusService.testConnection({
                factusClientId: formData.factusClientId,
                factusClientSecret: formData.factusClientSecret,
                username: formData.factusUsername,
                password: formData.factusPassword,
                factusTestMode: formData.factusTestMode
            });

            if (res.success) {
                toast.success("¡Conexión establecida con éxito con Factus! Credenciales válidas.");
            }
        } catch (error) {
            console.error("Error al probar la conexión con Factus:", error);
            toast.error(`Error de conexión con Factus: ${error.message}`);
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docRef = doc(db, "tenants", userProfile.inquilino);
            await setDoc(docRef, {
                ...formData,
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.uid
            }, { merge: true });

            toast.success("Configuración de facturación electrónica guardada con éxito");
        } catch (error) {
            console.error("Error guardando configuración de facturación:", error);
            toast.error("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-2 md:p-8 pb-32 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
                    <FiFileText size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Facturación Electrónica</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Conexión con el proveedor tecnológico Factus y la DIAN</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Factus API Config */}
                <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <FiKey size={20} />
                        </div>
                        <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Credenciales de API Factus</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client ID *</label>
                            <Input
                                value={formData.factusClientId}
                                onChange={e => setFormData({ ...formData, factusClientId: e.target.value })}
                                placeholder="Ingrese el Client ID proporcionado por Factus"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Secret *</label>
                            <div className="relative">
                                <Input
                                    type={showSecret ? "text" : "password"}
                                    value={formData.factusClientSecret}
                                    onChange={e => setFormData({ ...formData, factusClientSecret: e.target.value })}
                                    placeholder="Ingrese el Client Secret"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario / Correo API *</label>
                            <Input
                                value={formData.factusUsername}
                                onChange={e => setFormData({ ...formData, factusUsername: e.target.value })}
                                placeholder="Ingrese el usuario o correo de la API"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña API *</label>
                            <div className="relative">
                                <Input
                                    type={showApiPassword ? "text" : "password"}
                                    value={formData.factusPassword}
                                    onChange={e => setFormData({ ...formData, factusPassword: e.target.value })}
                                    placeholder="Ingrese la contraseña de la API"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiPassword(!showApiPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showApiPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl select-none cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, factusTestMode: !prev.factusTestMode }))}>
                            <input
                                type="checkbox"
                                checked={formData.factusTestMode}
                                onChange={() => {}}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-xs font-black uppercase tracking-wide text-slate-700 block">Modo de Pruebas (Sandbox)</span>
                                <span className="text-[10px] font-medium text-slate-400">Mantener activado para realizar facturas ficticias de prueba sin validez legal.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DIAN Resolution Config */}
                <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FiFileText size={20} />
                        </div>
                        <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Autorización de Numeración (DIAN)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prefijo de Factura</label>
                            <Input
                                value={formData.dianPrefijo}
                                onChange={e => setFormData({ ...formData, dianPrefijo: e.target.value })}
                                placeholder="Ej: SETT o FE"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resolución DIAN Nº</label>
                            <Input
                                value={formData.dianResolucion}
                                onChange={e => setFormData({ ...formData, dianResolucion: e.target.value })}
                                placeholder="Número de resolución autorizada"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Resolución</label>
                            <Input
                                type="date"
                                value={formData.dianFechaResolucion}
                                onChange={e => setFormData({ ...formData, dianFechaResolucion: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rango Desde</label>
                                <Input
                                    type="number"
                                    value={formData.dianRangoDesde}
                                    onChange={e => setFormData({ ...formData, dianRangoDesde: parseInt(e.target.value) || 1 })}
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rango Hasta</label>
                                <Input
                                    type="number"
                                    value={formData.dianRangoHasta}
                                    onChange={e => setFormData({ ...formData, dianRangoHasta: parseInt(e.target.value) || 1000 })}
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave Técnica DIAN</label>
                            <Input
                                value={formData.dianClaveTecnica}
                                onChange={e => setFormData({ ...formData, dianClaveTecnica: e.target.value })}
                                placeholder="Clave técnica de facturación electrónica"
                            />
                        </div>
                    </div>
                </div>

                {/* Alerta de Habilitación */}
                <div className="p-5 bg-amber-50 border border-amber-200/60 rounded-3xl flex items-start gap-4 text-slate-700">
                    <FiInfo size={24} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wide text-amber-800 mb-1">Nota importante de habilitación</h4>
                        <p className="text-[11px] font-semibold text-amber-700/90 leading-relaxed">
                            Antes de cambiar el "Modo de pruebas (Sandbox)", asegúrese de haber completado las pruebas requeridas de la DIAN y haber asociado a Factus como su Proveedor Tecnológico Autorizado en el portal oficial de la DIAN.
                        </p>
                    </div>
                </div>

                {/* Guardar y Probar Conexión */}
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-100 pb-16">
                    <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testingConnection || saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
                    >
                        <FiKey size={16} />
                        <span>{testingConnection ? "Probando..." : "Probar Conexión"}</span>
                    </button>
                    <button
                        type="submit"
                        disabled={saving || testingConnection}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                    >
                        <FiSave size={16} />
                        <span>{saving ? "Guardando..." : "Guardar Configuración"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
