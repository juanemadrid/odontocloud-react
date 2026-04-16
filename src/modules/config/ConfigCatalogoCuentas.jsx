
import React, { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiSave, FiX, FiChevronRight, FiChevronDown, FiBook, FiSettings, FiBriefcase, FiHash, FiActivity } from "react-icons/fi";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, setDoc, getDoc, serverTimestamp, writeBatch, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const INITIAL_CLASSES = [
    { code: "1", nombre: "Activos" },
    { code: "2", nombre: "Pasivos" },
    { code: "3", nombre: "Patrimonio" },
    { code: "4", nombre: "Ingresos" },
    { code: "5", nombre: "Egresos" },
    { code: "6", nombre: "Costos de ventas" },
    { code: "7", nombre: "Costos de producción" },
    { code: "8", nombre: "Cuentas de orden deudoras" },
    { code: "9", nombre: "Cuentas de orden acreedoras" }
];

export default function ConfigCatalogoCuentas() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const toast = useToast();

    // GENERAL CONFIG STATE
    const [generalConfig, setGeneralConfig] = useState({
        comprobanteFacturasEmpresas: "",
        comprobanteFacturasPersonas: "",
        comprobanteRecibosCaja: ""
    });
    const [savingGeneral, setSavingGeneral] = useState(false);

    // CATALOGO STATE
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // MODAL STATE
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [savingAccount, setSavingAccount] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        codigoPadre: "",
        codigoSufijo: "",
        descripcion: "",
        naturaleza: "Debito" // Debito, Credito
    });

    useEffect(() => {
        if (!inquilino) return;

        fetchGeneralConfig();

        setLoading(true);
        const q = query(
            collection(db, "tenants", inquilino, "catalogo_cuentas"),
            orderBy("codigo", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const fetchedAccounts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const combined = [...fetchedAccounts];
            INITIAL_CLASSES.forEach(c => {
                if (!combined.find(a => a.codigo === c.code)) {
                    combined.push({ id: `base-${c.code}`, codigo: c.code, nombre: c.nombre, isBase: true });
                }
            });
            combined.sort((a, b) => a.codigo.localeCompare(b.codigo));
            setAccounts(combined);
            setLoading(false);
        }, (err) => {
            console.error(err);
            toast.error("Error al sincronizar catálogo");
            setLoading(false);
        });

        return () => unsub();
    }, [inquilino]);

    const fetchGeneralConfig = async () => {
        try {
            const docSnap = await getDoc(doc(db, "tenants", inquilino, "config", "contabilidad"));
            if (docSnap.exists()) {
                setGeneralConfig(docSnap.data());
            }
        } catch (e) {
            console.error("Error fetching config:", e);
        }
    };

    const handleSaveGeneral = async () => {
        setSavingGeneral(true);
        try {
            await setDoc(doc(db, "tenants", inquilino, "config", "contabilidad"), {
                ...generalConfig,
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.email
            }, { merge: true });
            toast.success("Configuración general guardada");
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar configuración");
        } finally {
            setSavingGeneral(false);
        }
    };

    const handleSaveAccount = async () => {
        if (!formData.nombre.trim()) return toast.warning("Defina el nombre de la cuenta");
        if (!formData.codigoSufijo.trim()) return toast.warning("El código es obligatorio");

        const codigoCompleto = formData.codigoPadre ? `${formData.codigoPadre}${formData.codigoSufijo}` : formData.codigoSufijo;

        if (!editingId && accounts.find(a => a.codigo === codigoCompleto)) {
            return toast.error("Conflicto: El código ya existe en el catálogo");
        }

        setSavingAccount(true);
        try {
            const payload = {
                nombre: formData.nombre.toUpperCase(),
                codigo: codigoCompleto,
                codigoPadre: formData.codigoPadre,
                descripcion: formData.descripcion,
                naturaleza: formData.naturaleza,
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.email
            };

            if (editingId) {
                await updateDoc(doc(db, "tenants", inquilino, "catalogo_cuentas", editingId), payload);
                toast.success("Cuenta contable actualizada");
            } else {
                await setDoc(doc(db, "tenants", inquilino, "catalogo_cuentas", codigoCompleto), {
                    ...payload,
                    createdAt: serverTimestamp(),
                    createdBy: userProfile.email
                });
                toast.success("Nueva cuenta vinculada al catálogo");
            }
            closeModal();
        } catch (e) {
            console.error(e);
            toast.error("Error al procesar registro");
        } finally {
            setSavingAccount(true);
        }
    };

    const handleDeleteAccount = async (id) => {
        if (!window.confirm("¿Seguro que desea eliminar esta cuenta? Los movimientos asociados podrían verse afectados.")) return;
        try {
            await deleteDoc(doc(db, "tenants", inquilino, "catalogo_cuentas", id));
            toast.success("Cuenta removida del catálogo");
        } catch (e) {
            console.error(e);
            toast.error("Error al eliminar");
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                nombre: item.nombre,
                codigoPadre: item.codigoPadre || "",
                codigoSufijo: item.codigo.replace(item.codigoPadre || "", ""),
                descripcion: item.descripcion || "",
                naturaleza: item.naturaleza || "Debito"
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: "",
                codigoPadre: "",
                codigoSufijo: "",
                descripcion: "",
                naturaleza: "Debito"
            });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const fullCode = formData.codigoPadre ? `${formData.codigoPadre}${formData.codigoSufijo}` : formData.codigoSufijo;

    const filteredAccounts = accounts.filter(a =>
        a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.codigo.includes(searchTerm)
    );

    return (
        <div className="space-y-10 p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-left">

            {/* Context Panel & General Config */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 shadow-[1px_0_10px_rgba(79,70,229,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-indigo-200">
                            <FiBriefcase size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-tighter">Gestión Contable</h2>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">Configuración de catálogo y comprobantes</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveGeneral}
                        disabled={savingGeneral}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-200 transition-all active:scale-95 group/save relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:animate-shimmer" />
                        {savingGeneral ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiSave className="text-lg" />
                        )}
                        <span>Guardar General</span>
                    </button>
                </div>

                <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="group/field">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-indigo-500 transition-colors">FACTURAS - EMPRESAS</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="Tipo de comprobante..."
                            value={generalConfig.comprobanteFacturasEmpresas}
                            onChange={e => setGeneralConfig({ ...generalConfig, comprobanteFacturasEmpresas: e.target.value })}
                        />
                    </div>
                    <div className="group/field">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-indigo-500 transition-colors">FACTURAS - PERSONAS</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="Tipo de comprobante..."
                            value={generalConfig.comprobanteFacturasPersonas}
                            onChange={e => setGeneralConfig({ ...generalConfig, comprobanteFacturasPersonas: e.target.value })}
                        />
                    </div>
                    <div className="group/field">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-indigo-500 transition-colors">RECIBOS DE CAJA</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="Tipo de comprobante..."
                            value={generalConfig.comprobanteRecibosCaja}
                            onChange={e => setGeneralConfig({ ...generalConfig, comprobanteRecibosCaja: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Catalog Tree Area */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-700">
                <div className="bg-slate-50/50 backdrop-blur-sm px-10 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                            <FiBook size={20} />
                        </div>
                        <h3 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter">Plan Único de Cuentas (PUC)</h3>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group/search flex-1 md:w-64">
                            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/search:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR CUENTA..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 outline-none w-full focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all uppercase tracking-wider placeholder:text-slate-300 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative shrink-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nueva Cuenta
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-4">Jerarquía / Nombre de Cuenta</th>
                                <th className="px-10 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={2} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Sincronizando puc institucional...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <FiBriefcase size={48} className="text-slate-200 mb-6" />
                                            <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">Registro contable vacío</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map(acc => {
                                    const level = acc.codigo.length;
                                    const padding = (level - 1) * 32 + 40;
                                    return (
                                        <tr key={acc.id} className="group/row hover:bg-indigo-50/20 transition-all duration-300">
                                            <td className="py-4 pr-10" style={{ paddingLeft: padding }}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[12px] font-black ${level === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'} group-hover/row:scale-110 transition-all duration-300`}>
                                                        {acc.codigo}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[14px] font-black uppercase tracking-tight ${level === 1 ? 'text-slate-800' : 'text-slate-600 group-hover/row:text-indigo-600'} transition-colors`}>
                                                            {acc.nombre}
                                                        </span>
                                                        {acc.descripcion && (
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                                {acc.descripcion}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-4 text-right">
                                                {!acc.isBase && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                                                        <button
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-90"
                                                            onClick={() => openModal(acc)}
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-lg hover:shadow-red-50 transition-all active:scale-90"
                                                            onClick={() => handleDeleteAccount(acc.id)}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                                {acc.isBase && (
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100 group-hover/row:hidden transition-all">ESTRUCTURA BASE</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL INSTITUCIONAL */}
            {showModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={closeModal} />

                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        {/* Modal Header */}
                        <div className="px-12 py-10 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center relative gap-4">
                            <div className="absolute top-0 left-12 w-24 h-1.5 bg-indigo-600 rounded-b-full shadow-[0_2px_10px_rgba(79,70,229,0.3)]" />
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[28px] bg-white shadow-xl flex items-center justify-center text-indigo-600 border border-slate-100">
                                    <FiActivity size={32} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-[24px] font-black text-slate-800 uppercase tracking-tighter leading-tight">
                                        {editingId ? "Propiedades de Cuenta" : "Registrar Nueva Cuenta"}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-70">
                                        Definición de jerarquía y naturaleza contable
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:shadow-xl transition-all duration-300 active:scale-90">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-12 space-y-8 text-left">
                            <div className="group/field">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">PERTENECE A (JERARQUÍA)</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner appearance-none bg-no-repeat"
                                    value={formData.codigoPadre}
                                    onChange={e => setFormData({ ...formData, codigoPadre: e.target.value })}
                                >
                                    <option value="">NINGUNA (CLASE PRINCIPAL)</option>
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.codigo}>{a.codigo} - {a.nombre.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">NOMBRE DE LA CUENTA *</label>
                                    <input
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner uppercase placeholder:text-slate-300"
                                        placeholder="EJ. BANCO NACIONAL"
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">CÓDIGO (SUFIJO) *</label>
                                    <div className="flex gap-2 items-center">
                                        <div className="px-5 py-4 bg-slate-200/50 rounded-2xl text-[14px] font-mono font-black text-slate-400 border border-slate-200 transition-all">
                                            {formData.codigoPadre || "X"}
                                        </div>
                                        <input
                                            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-mono font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-300"
                                            placeholder="SUFIJO"
                                            value={formData.codigoSufijo}
                                            onChange={e => setFormData({ ...formData, codigoSufijo: e.target.value })}
                                        />
                                    </div>
                                    <p className="mt-2 ml-1 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Código resultante: <span className="underline decoration-2 underline-offset-4">{fullCode || "..."}</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 group/field">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">DESCRIPCIÓN / COMENTARIO</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-300"
                                        placeholder="Breve descripción de la cuenta..."
                                        value={formData.descripcion}
                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </div>
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">NATURALEZA *</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-inner appearance-none"
                                        value={formData.naturaleza}
                                        onChange={e => setFormData({ ...formData, naturaleza: e.target.value })}
                                    >
                                        <option value="Debito">DÉBITO</option>
                                        <option value="Credito">CRÉDITO</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-5">
                            <button
                                onClick={closeModal}
                                className="px-10 py-5 rounded-3xl text-[13px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAccount}
                                disabled={savingAccount}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-3xl text-[13px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-emerald-200 transition-all active:scale-95 group/save relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/save:animate-shimmer" />
                                {savingAccount ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FiHash className="text-xl" /> Confirmar Registro
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
