import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy, where, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db, firebaseConfig } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiFilter, FiUser, FiArrowLeft, FiArrowRight, FiSave, FiInfo, FiMail, FiPhone, FiCreditCard, FiMapPin, FiActivity, FiLayers, FiChevronRight, FiChevronLeft, FiChevronsRight, FiChevronsLeft } from "react-icons/fi";
import Input from "../../components/ui/Input";

export default function EmpresaUsuarios() {
    const { userProfile } = useAuth();
    const toast = useToast();

    // Data States
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [rolesDisponibles, setRolesDisponibles] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [specialties, setSpecialties] = useState([]); // Loaded from 'especialidades'

    // UI States
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showDisabled, setShowDisabled] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTermAvailable, setSearchTermAvailable] = useState("");
    const [searchTermSelected, setSearchTermSelected] = useState("");
    const [searchTermSucAvailable, setSearchTermSucAvailable] = useState("");
    const [searchTermSucSelected, setSearchTermSucSelected] = useState("");

    // Form State
    const initialForm = {
        nombre: "",
        apellido: "",
        email: "",
        tipoDocumento: "CC",
        numeroDocumento: "",
        telefonoMovil: "",
        telefonoFijo: "",
        direccion: "",
        genero: "Masculino",
        fechaNacimiento: "",
        esLaboratory: false, // New field from OralDrive

        // Sección Empresarial
        esDoctor: false,
        profileId: "",
        profileType: "Doctor", // New from OralDrive screenshot
        sucursales: [],
        especialidades: [],
        seeOtherDoctorsData: false, // "Puedo ver todo lo de otros doctores"
        comisionPorcentaje: 0, // "Porcentaje"
        clinicalDocsWithLogo: true, // "¿Documentos clínicos se imprimen con logo?"
        clinicalDocsHeader: "sucursal", // "sucursal" o "personalizado"
        formaPago: "Realizadas y pagadas", // "Forma de pago"

        password: ""
    };
    const [formData, setFormData] = useState(initialForm);

    // 1. Load Data
    const loadData = async () => {
        if (!userProfile?.inquilino) return;
        setLoading(true);
        try {
            // Usuarios (sin orderBy email para evitar error de índice si hay filtros de tenant)
            const usersQ = query(collection(db, "usuarios"), where("inquilino", "==", userProfile.inquilino));
            const uSnap = await getDocs(usersQ);

            // Otros recursos (sin orderBy para evitar errores de índice si no existen)
            // Ordenaremos del lado del cliente para mayor robustez
            const [pSnap, sSnap, espSnap] = await Promise.all([
                getDocs(query(collection(db, "perfiles"), where("inquilino", "==", userProfile.inquilino))),
                getDocs(query(collection(db, "sucursales"), where("inquilino", "==", userProfile.inquilino))),
                getDocs(query(collection(db, "especialidades"), where("inquilino", "==", userProfile.inquilino)))
            ]);

            const sortedProfiles = pSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            const sortedBranches = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            const sortedSpecialties = espSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

            setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setRolesDisponibles(sortedProfiles);
            setSucursales(sortedBranches);
            setSpecialties(sortedSpecialties);

        } catch (e) {
            console.error(e);
            toast.error("Error cargando usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [userProfile]);

    // 2. Filter Logic
    useEffect(() => {
        let res = users;
        // Search
        if (search.trim()) {
            const lower = search.toLowerCase();
            res = res.filter(u =>
                (u.nombreCompleto || "").toLowerCase().includes(lower) ||
                (u.email || "").toLowerCase().includes(lower)
            );
        }
        // Disabled toggle (Currently filtering by 'activo' flag logic implied? 
        // Screenshot implies a toggle to SHOW disabled. Usually we show actives by default.
        // Let's assume most users are active. If 'activo' is false they are disabled.
        if (!showDisabled) {
            res = res.filter(u => u.activo !== false); // Show only active
        } else {
            // Show all or only disabled? Usually "Deshabilitados" button TOGGLES view to show them.
            // Let's make it filter to SHOW disabled ones if button is active? Or show ALL?
            // Screenshot: Blue button "Deshabilitados". Likely a filter. 
            // Let's assume clicking it shows the disabled list.
            res = res.filter(u => u.activo === false);
        }

        // Wait, if button is inactive (default), show actives. If active, show disabled? 
        // Or show ALL? Let's implement: Default = Show Active. Toggle ON = Show Inactive.

        setFiltered(res);
    }, [users, search, showDisabled]);

    // 3. Handlers
    const handleOpenModal = async (user = null) => {
        if (!user && userProfile?.inquilino && userProfile?.tenant?.planId) {
            try {
                const planSnap = await getDoc(doc(db, "subscription_plans", userProfile.tenant.planId));
                if (planSnap.exists()) {
                    const { maxUsers } = planSnap.data();
                    const activeUsersCount = users.filter(u => u.activo !== false).length;
                    if (maxUsers && activeUsersCount >= maxUsers) {
                        return toast.error(`⛔ Límite alcanzado: Tu plan actual (${userProfile.tenant.plan.name || 'Básico'}) permite máximo ${maxUsers} usuarios. Actualiza tu plan para agregar más.`);
                    }
                }
            } catch (err) {
                console.error("Error checking pre-limit", err);
            }
        }

        if (user) {
            setEditId(user.id);
            setFormData({
                ...initialForm,
                nombre: user.nombre || "",
                apellido: user.apellido || "",
                email: user.email || "",
                tipoDocumento: user.tipoDocumento || "CC",
                numeroDocumento: user.numeroDocumento || "",
                telefonoMovil: user.telefonoMovil || "",
                telefonoFijo: user.telefonoFijo || "",
                direccion: user.direccion || "",
                genero: user.genero || "Femenino",
                fechaNacimiento: user.fechaNacimiento || "",
                esDoctor: user.esDoctor || false,
                esLaboratory: user.esLaboratory || false,
                seeOtherDoctorsData: user.seeOtherDoctorsData || false,
                comisionPorcentaje: user.comisionPorcentaje || 0,
                clinicalDocsWithLogo: user.clinicalDocsWithLogo !== undefined ? user.clinicalDocsWithLogo : true,
                clinicalDocsHeader: user.clinicalDocsHeader || "sucursal",
                formaPago: user.formaPago || "Realizadas y pagadas",

                profileId: user.profileId || "",
                sucursales: user.sucursales || [],
                especialidades: user.especialidades || [],
                password: ""
            });
        } else {
            setEditId(null);
            setFormData(initialForm);
        }
        setModalOpen(true);
    };

    const toggleSelection = (key, id) => {
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].includes(id)
                ? prev[key].filter(x => x !== id)
                : [...prev[key], id]
        }));
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.nombre || !formData.profileId) {
            return toast.warning("Complete los campos obligatorios");
        }
        if (!editId && !formData.password) {
            return toast.warning("Contraseña requerida para nuevos usuarios");
        }

        // ---------------------------------------------------------
        // PLAN LIMIT ENFORCEMENT
        // ---------------------------------------------------------
        if (!editId && userProfile?.inquilino && userProfile?.tenant?.planId) {
            setSaving(true);
            try {
                const planSnap = await getDoc(doc(db, "subscription_plans", userProfile.tenant.planId));
                if (planSnap.exists()) {
                    const { maxUsers } = planSnap.data();
                    const activeUsersCount = users.filter(u => u.activo !== false).length;
                    if (maxUsers && activeUsersCount >= maxUsers) {
                        toast.error(`⛔ Límite de usuarios alcanzado (${maxUsers}). Por favor, actualiza tu plan.`);
                        setSaving(false);
                        return;
                    }
                }
            } catch (limitErr) {
                console.error("Error checking limits", limitErr);
                // Optionally handle error
            }
        }
        // ---------------------------------------------------------

        setSaving(true);
        try {
            const selectedProfile = rolesDisponibles.find(p => p.id === formData.profileId);

            let uid = editId;

            // If Creating New -> Create in Auth
            if (!editId) {
                const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp"); // Avoid Logging out current user
                const secondaryAuth = getAuth(secondaryApp);
                const userCred = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
                uid = userCred.user.uid;
            }

            // Save to Firestore
            const userData = {
                uid,
                activo: true, // Default active on create/edit

                email: formData.email,
                nombre: formData.nombre,
                apellido: formData.apellido,
                nombreCompleto: `${formData.nombre} ${formData.apellido}`.trim(),

                tipoDocumento: formData.tipoDocumento,
                numeroDocumento: formData.numeroDocumento,
                telefonoMovil: formData.telefonoMovil,
                telefonoFijo: formData.telefonoFijo,
                direccion: formData.direccion,
                genero: formData.genero,
                fechaNacimiento: formData.fechaNacimiento,

                esDoctor: formData.esDoctor,
                esLaboratory: formData.esLaboratory || false,
                seeOtherDoctorsData: formData.seeOtherDoctorsData || false,
                comisionPorcentaje: Number(formData.comisionPorcentaje) || 0,
                clinicalDocsWithLogo: formData.clinicalDocsWithLogo !== undefined ? formData.clinicalDocsWithLogo : true,
                clinicalDocsHeader: formData.clinicalDocsHeader || "sucursal",
                formaPago: formData.formaPago || "Realizadas y pagadas",
                profileType: formData.profileType || "Doctor",

                sucursales: formData.sucursales,
                especialidades: formData.esDoctor ? formData.especialidades : [],

                profileId: selectedProfile?.id || "",
                profileName: selectedProfile?.nombre || "",
                rol: selectedProfile?.baseRole || "recepcionista",

                inquilino: userProfile.inquilino,
                updatedAt: serverTimestamp()
            };

            // If create, add createdAt
            if (!editId) userData.createdAt = serverTimestamp();

            await setDoc(doc(db, "usuarios", uid), userData, { merge: true });

            // ---------------------------------------------------------
            // DOCTOR SYNCHRONIZATION (profesionales collection)
            // ---------------------------------------------------------
            if (formData.esDoctor) {
                const profData = {
                    id: uid,
                    nombre: formData.nombre.trim().toUpperCase(),
                    nombreCompleto: `${formData.nombre} ${formData.apellido}`.trim().toUpperCase(),
                    correo: formData.email.toLowerCase(),
                    identificacion: formData.numeroDocumento,
                    telefono: formData.telefonoMovil,
                    especialidades: formData.especialidades,
                    sucursales: formData.sucursales, // Critical fix: mapping branches
                    inquilino: userProfile.inquilino,
                    activo: true,
                    updatedAt: serverTimestamp()
                };
                await setDoc(doc(db, "profesionales", uid), profData, { merge: true });
            } else {
                // If they were a doctor and now aren't, or just ensure it's deleted/deactivated
                // Usually deleting is safe if they aren't a doctor anymore.
                // Alternatively, set activo: false. Let's delete to keep collection clean.
                try {
                    await deleteDoc(doc(db, "profesionales", uid));
                } catch (e) {
                    // Might not exist, ignore
                }
            }
            // ---------------------------------------------------------

            toast.success(editId ? "Usuario actualizado" : "Usuario creado con éxito");
            setModalOpen(false);
            loadData();

        } catch (error) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error("El correo ya está registrado");
            } else {
                toast.error("Error al guardar: " + error.message);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDisable = async (u) => {
        if (!window.confirm(`¿${u.activo ? "Deshabilitar" : "Habilitar"} usuario?`)) return;
        try {
            await setDoc(doc(db, "usuarios", u.id), { activo: !u.activo }, { merge: true });
            toast.success("Estado actualizado");
            loadData();
        } catch (e) {
            toast.error("Error al cambiar estado");
        }
    };

    return (
        <div className="space-y-10 p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Toolbar: Search & Actions */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>
                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200 group-hover:rotate-12 transition-transform duration-500">
                            <FiUser size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Usuarios</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de talento humano</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Status Toggle */}
                        <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                            <button
                                onClick={() => setShowDisabled(false)}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${!showDisabled ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Activos
                            </button>
                            <button
                                onClick={() => setShowDisabled(true)}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${showDisabled ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Deshabilitados
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all" />
                            <input
                                type="text"
                                placeholder="Buscar miembro..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] font-extrabold text-slate-800 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm w-64"
                            />
                        </div>

                        {/* New User Button */}
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nuevo miembro
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden relative">
                <div className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Miembro / Contacto</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Perfil / Rol</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 italic">Estado Profesional</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Operaciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Sincronizando equipo...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <FiUser size={48} className="text-slate-300" />
                                            <p className="font-black uppercase tracking-widest text-slate-400">Sin miembros encontrados</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr key={u.id} className={`group hover:bg-slate-50/80 transition-all duration-300 ${u.activo === false ? 'opacity-60 grayscale' : ''}`}>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[15px] shadow-sm transform group-hover:scale-110 transition-transform duration-500 ${u.activo === false ? 'bg-slate-200 text-slate-500' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700'}`}>
                                                    {(u.nombre?.charAt(0) || "") + (u.apellido?.charAt(0) || "")}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-extrabold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{u.nombreCompleto || `${u.nombre} ${u.apellido}`}</span>
                                                    <span className="text-[11px] font-bold text-slate-400 lowercase tracking-tight">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    <span className="text-[12px] font-black text-slate-600 uppercase tracking-tighter">{u.profileName || u.rol || "Sin perfil"}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3.5 opacity-60">
                                                    {u.sucursales?.length || 0} sedes asignadas
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-[12px]">
                                            {u.esDoctor ? (
                                                <div className="inline-flex flex-col">
                                                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black uppercase tracking-tighter text-[10px] border border-emerald-500/10">
                                                        <FiCheck size={10} /> Médico / Profesional
                                                    </span>
                                                    {u.especialidades?.length > 0 && (
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1 opacity-60">
                                                            {u.especialidades.length} especialidades
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg font-black uppercase tracking-tighter text-[10px] border border-slate-100 italic">No asistencial</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleDisable(u)}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${u.activo === false ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                    title={u.activo === false ? "Habilitar" : "Deshabilitar"}
                                                >
                                                    <FiActivity size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(u)}
                                                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Rendered via Portal to escape Layout stacking/animation conflicts */}
            {modalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden">
                    <div className="bg-[#FCFDFF] w-full max-w-4xl rounded-[40px] shadow-[0_40px_120px_rgba(0,0,0,0.35)] flex flex-col h-[90vh] animate-scale-in overflow-hidden relative border border-white/60">
                        {/* Header: Institutional & Actions */}
                        <div className="bg-white/90 backdrop-blur-xl px-10 py-7 border-b border-slate-100/80 flex items-center justify-between shrink-0 relative z-20">
                            <div className="absolute top-0 left-10 w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-b-full shadow-[0_4px_12px_rgba(37,99,235,0.2)]" />
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="w-12 h-12 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white hover:border-red-100 hover:shadow-xl hover:shadow-red-500/10 transition-all active:scale-95 group"
                                >
                                    <FiX size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-[0_12px_30px_rgba(37,99,235,0.3)]">
                                        <FiUser size={28} className="text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-[22px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">
                                            {editId ? "Editar Miembro" : "Nuevo Miembro"}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">Gestión de Talento Humano</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body with subtle grid background */}
                        <div className="flex-1 overflow-hidden relative bg-white">
                            <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
                                style={{ backgroundImage: `radial-gradient(#000 0.5px, transparent 0.5px)`, backgroundSize: '20px 20px' }} />

                            <form onSubmit={handleSubmitForm} className="h-full overflow-y-auto custom-scrollbar p-10 space-y-12 pb-32">
                                {/* SECTION 1: INFORMACIÓN BÁSICA */}
                                <div className="relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50/50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
                                            <FiInfo size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.3em] leading-none mb-1">Información básica</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datos de identificación personal</p>
                                        </div>
                                        <div className="h-px flex-1 bg-gradient-to-r from-blue-100/50 to-transparent" />
                                    </div>

                                    <div className="space-y-8 bg-white border border-slate-100 p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                                        {/* Es Laboratorio Checkbox */}
                                        <div className="flex items-center gap-3 ml-2 mb-4">
                                            <label className="relative flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.esLaboratory ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 group-hover:border-blue-300'}`}>
                                                    {formData.esLaboratory && <FiCheck className="text-white text-xs" />}
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={formData.esLaboratory}
                                                        onChange={e => setFormData({ ...formData, esLaboratory: e.target.checked })}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">¿Es laboratorio o centro diagnóstico?</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nombre *</label>
                                                <Input
                                                    type="text"
                                                    value={formData.nombre}
                                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                    required
                                                    className="h-14 bg-slate-50 focus:bg-white border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold text-slate-700 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Apellido *</label>
                                                <Input
                                                    type="text"
                                                    value={formData.apellido}
                                                    onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                                    required
                                                    className="h-14 bg-slate-50 focus:bg-white border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold text-slate-700 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tipo documento *</label>
                                                <select
                                                    value={formData.tipoDocumento}
                                                    onChange={e => setFormData({ ...formData, tipoDocumento: e.target.value })}
                                                    required
                                                    className="w-full h-14 bg-slate-50 focus:bg-white border border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-black text-[12px] uppercase text-slate-700 outline-none transition-all"
                                                >
                                                    <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                                                    <option value="Cédula de extranjería">Cédula de extranjería</option>
                                                    <option value="Pasaporte">Pasaporte</option>
                                                    <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Número de documento *</label>
                                                <Input
                                                    type="text"
                                                    value={formData.numeroDocumento}
                                                    onChange={e => setFormData({ ...formData, numeroDocumento: e.target.value })}
                                                    required
                                                    className="h-14 bg-slate-50 focus:bg-white border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold text-slate-700 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Teléfono móvil *</label>
                                                <Input
                                                    type="text"
                                                    value={formData.telefonoMovil}
                                                    onChange={e => setFormData({ ...formData, telefonoMovil: e.target.value })}
                                                    required
                                                    placeholder="3XX XXX XXXX"
                                                    className="h-14 bg-slate-50 focus:bg-white border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold text-slate-700 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Teléfono fijo</label>
                                                <Input
                                                    type="text"
                                                    value={formData.telefonoFijo}
                                                    onChange={e => setFormData({ ...formData, telefonoFijo: e.target.value })}
                                                    placeholder="Ingrese un número de teléfono"
                                                    className="h-14 bg-slate-50 focus:bg-white border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold text-slate-700 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="md:col-span-1 space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Dirección *</label>
                                                <Input
                                                    type="text"
                                                    value={formData.direccion}
                                                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                                    required
                                                    className="h-14 bg-slate-50 focus:bg-white border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold text-slate-700 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Género *</label>
                                                <select
                                                    value={formData.genero}
                                                    onChange={e => setFormData({ ...formData, genero: e.target.value })}
                                                    required
                                                    className="w-full h-14 bg-slate-50 focus:bg-white border border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-black text-[12px] uppercase text-slate-700 outline-none transition-all"
                                                >
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Femenino">Femenino</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Fecha de nacimiento *</label>
                                                <Input
                                                    type="date"
                                                    value={formData.fechaNacimiento}
                                                    onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                                    required
                                                    className="h-14 bg-slate-50 focus:bg-white border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold text-slate-700 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: INFORMACIÓN EMPRESARIAL */}
                                <div className="relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50/50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
                                            <FiLayers size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.3em] leading-none mb-1">Información empresarial</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuración de lógica de negocio</p>
                                        </div>
                                        <div className="h-px flex-1 bg-gradient-to-r from-emerald-100/50 to-transparent" />
                                    </div>

                                    <div className="space-y-10 bg-white border border-slate-100 p-10 rounded-[40px] shadow-[0_15px_50px_rgba(0,0,0,0.02)] relative overflow-hidden">
                                        {/* Toggles Group */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            <div className="flex items-center justify-between group/toggle">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider group-hover/toggle:text-blue-600 transition-colors">Es doctor</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.esDoctor}
                                                        onChange={e => setFormData({ ...formData, esDoctor: e.target.checked })}
                                                    />
                                                    <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${formData.esDoctor ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-200 shadow-inner'}`}>
                                                        <div className={`absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-all duration-300 ${formData.esDoctor ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between group/toggle">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider group-hover/toggle:text-emerald-600 transition-colors">¿Documentos clínicos se imprimen con logo?</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.clinicalDocsWithLogo}
                                                        onChange={e => setFormData({ ...formData, clinicalDocsWithLogo: e.target.checked })}
                                                    />
                                                    <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${formData.clinicalDocsWithLogo ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-200 shadow-inner'}`}>
                                                        <div className={`absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-all duration-300 ${formData.clinicalDocsWithLogo ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between group/toggle">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider group-hover/toggle:text-indigo-600 transition-colors">Puedo ver todo lo de otros doctores</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.seeOtherDoctorsData}
                                                        onChange={e => setFormData({ ...formData, seeOtherDoctorsData: e.target.checked })}
                                                    />
                                                    <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${formData.seeOtherDoctorsData ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-200 shadow-inner'}`}>
                                                        <div className={`absolute top-1 left-1 bg-white rounded-full h-4 w-4 transition-all duration-300 ${formData.seeOtherDoctorsData ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4 border-t border-slate-50">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Porcentaje</label>
                                                <Input
                                                    type="number"
                                                    value={formData.comisionPorcentaje}
                                                    onChange={e => setFormData({ ...formData, comisionPorcentaje: e.target.value })}
                                                    placeholder="0"
                                                    className="h-14 bg-slate-50 border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-bold"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Cabecera documentos clínicos</label>
                                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 h-14">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, clinicalDocsHeader: 'sucursal' })}
                                                        className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.clinicalDocsHeader === 'sucursal' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        Sucursal
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, clinicalDocsHeader: 'personalizado' })}
                                                        className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.clinicalDocsHeader === 'personalizado' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        Personalizado
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Forma de pago</label>
                                                <select
                                                    value={formData.formaPago}
                                                    onChange={e => setFormData({ ...formData, formaPago: e.target.value })}
                                                    className="w-full h-14 bg-slate-50 focus:bg-white border border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-black text-[11px] uppercase text-slate-700 outline-none transition-all"
                                                >
                                                    <option value="Realizadas y pagadas">Realizadas y pagadas</option>
                                                    <option value="Solo realizadas">Solo realizadas</option>
                                                    <option value="Solo pagadas">Solo pagadas</option>
                                                </select>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tipo de perfil</label>
                                                <select
                                                    value={formData.profileType}
                                                    onChange={e => setFormData({ ...formData, profileType: e.target.value })}
                                                    className="w-full h-14 bg-slate-50 focus:bg-white border border-slate-100 focus:border-blue-500 rounded-2xl px-5 font-black text-[11px] uppercase text-slate-700 outline-none transition-all"
                                                >
                                                    <option value="Doctor">Doctor</option>
                                                    <option value="Administrativo">Administrativo</option>
                                                    <option value="Auxiliar">Auxiliar</option>
                                                    <option value="Recepción">Recepción</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Sucursales Assignment (Doble Lista) */}
                                        <div className="pt-8 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50/50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
                                                    <FiMapPin size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.3em] leading-none mb-1">Sucursales</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asignación de sedes operativas</p>
                                                </div>
                                                <div className="h-px flex-1 bg-gradient-to-r from-emerald-100/50 to-transparent" />
                                            </div>

                                            <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-[0_15px_50px_rgba(0,0,0,0.02)]">
                                                <div className="flex flex-row items-stretch gap-4 h-[500px]">
                                                    {/* Disponibles */}
                                                    <div className="flex flex-col flex-1 border border-slate-100 rounded-[20px] overflow-hidden bg-slate-50/10 shadow-sm">
                                                        <div className="bg-white px-4 py-3 border-b border-slate-100 space-y-2">
                                                            <div className="flex items-center justify-between px-1">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sucursales disponibles</span>
                                                                <span className="text-[8px] font-bold bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                                                    {sucursales.filter(s => !formData.sucursales.includes(s.id)).length}
                                                                </span>
                                                            </div>
                                                            <div className="relative group">
                                                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={12} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="FILTRAR DISPONIBLES..."
                                                                    value={searchTermSucAvailable}
                                                                    onChange={e => setSearchTermSucAvailable(e.target.value)}
                                                                    className="w-full h-8 pl-9 pr-3 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-white focus:border-emerald-400 transition-all outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white/50">
                                                            <div className="space-y-0.5">
                                                                {sucursales
                                                                    .filter(s => !formData.sucursales.includes(s.id))
                                                                    .filter(s => (s.nombre || "").toLowerCase().includes(searchTermSucAvailable.toLowerCase()))
                                                                    .map(suc => (
                                                                        <button
                                                                            key={suc.id}
                                                                            type="button"
                                                                            onClick={() => toggleSelection("sucursales", suc.id)}
                                                                            className="w-full text-left px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100 group flex items-center justify-between"
                                                                        >
                                                                            <span className="truncate">{suc.nombre}</span>
                                                                            <FiChevronRight size={10} className="opacity-0 group-hover:opacity-100" />
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-center justify-center gap-2 w-16 bg-slate-50/30 rounded-xl p-1 border border-slate-100 self-center py-4">
                                                        <button
                                                            type="button"
                                                            className="w-10 h-10 rounded-lg bg-white text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed flex items-center justify-center"
                                                            title="Seleccione un elemento para mover"
                                                        >
                                                            <FiChevronRight size={18} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const filtered = sucursales
                                                                    .filter(s => !formData.sucursales.includes(s.id))
                                                                    .filter(s => (s.nombre || "").toLowerCase().includes(searchTermSucAvailable.toLowerCase()))
                                                                    .map(s => s.id);
                                                                if (filtered.length > 0) {
                                                                    setFormData(prev => ({ ...prev, sucursales: [...new Set([...prev.sucursales, ...filtered])] }));
                                                                    setSearchTermSucAvailable("");
                                                                }
                                                            }}
                                                            className="w-10 h-10 rounded-lg bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center group"
                                                            title="Añadir filtrados"
                                                        >
                                                            <FiChevronsRight size={18} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="w-10 h-10 rounded-lg bg-white text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed flex items-center justify-center"
                                                            title="Seleccione un elemento para mover"
                                                        >
                                                            <FiChevronLeft size={18} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, sucursales: [] }));
                                                                setSearchTermSucSelected("");
                                                            }}
                                                            className="w-10 h-10 rounded-lg bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-200 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center group"
                                                            title="Remover todos"
                                                        >
                                                            <FiChevronsLeft size={18} />
                                                        </button>
                                                    </div>

                                                    {/* Seleccionados */}
                                                    <div className="flex flex-col flex-1 border border-emerald-100 rounded-[20px] overflow-hidden bg-emerald-50/5 shadow-sm">
                                                        <div className="bg-white px-4 py-3 border-b border-emerald-100 space-y-2">
                                                            <div className="flex items-center justify-between px-1">
                                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Seleccionados</span>
                                                                <span className="text-[8px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600 font-mono">
                                                                    {formData.sucursales.length}
                                                                </span>
                                                            </div>
                                                            <div className="relative group">
                                                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={12} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="FILTRAR SELECCIONADOS..."
                                                                    value={searchTermSucSelected}
                                                                    onChange={e => setSearchTermSucSelected(e.target.value)}
                                                                    className="w-full h-8 pl-9 pr-3 bg-emerald-50/30 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-white focus:border-emerald-400 transition-all outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-emerald-50/10">
                                                            <div className="space-y-0.5">
                                                                {formData.sucursales
                                                                    .map(id => sucursales.find(s => s.id === id))
                                                                    .filter(Boolean)
                                                                    .filter(s => (s.nombre || "").toLowerCase().includes(searchTermSucSelected.toLowerCase()))
                                                                    .map(suc => (
                                                                        <button
                                                                            key={suc.id}
                                                                            type="button"
                                                                            onClick={() => toggleSelection("sucursales", suc.id)}
                                                                            className="w-full text-left px-3 py-1.5 rounded-md text-[10px] font-black text-emerald-800 bg-white shadow-sm border border-emerald-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-between group"
                                                                        >
                                                                            <span className="truncate">{suc.nombre}</span>
                                                                            <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                                                                                <FiX size={8} />
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: ESPECIALIDADES (Doble Lista) */}
                                {formData.esDoctor && (
                                    <div className="relative animate-in fade-in slide-in-from-top-4 duration-700">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50/50 text-orange-600 flex items-center justify-center shadow-sm border border-orange-100/50">
                                                <FiActivity size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-[12px] font-black text-orange-600 uppercase tracking-[0.3em] leading-none mb-1">Especialidades</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asignación de competencias profesionales</p>
                                            </div>
                                            <div className="h-px flex-1 bg-gradient-to-r from-orange-100/50 to-transparent" />
                                        </div>

                                        <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-[0_15px_50px_rgba(0,0,0,0.02)]">
                                            <div className="flex flex-row items-stretch gap-4 h-[500px]">
                                                {/* Disponibles */}
                                                <div className="flex flex-col flex-1 border border-slate-100 rounded-[20px] overflow-hidden bg-slate-50/10 shadow-sm">
                                                    <div className="bg-white px-4 py-3 border-b border-slate-100 space-y-2">
                                                        <div className="flex items-center justify-between px-1">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Disponibles</span>
                                                            <span className="text-[8px] font-bold bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                                                {specialties.filter(s => !formData.especialidades.includes(s.id)).length}
                                                            </span>
                                                        </div>
                                                        <div className="relative group">
                                                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={12} />
                                                            <input
                                                                type="text"
                                                                placeholder="FILTRAR DISPONIBLES..."
                                                                value={searchTermAvailable}
                                                                onChange={e => setSearchTermAvailable(e.target.value)}
                                                                className="w-full h-8 pl-9 pr-3 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-white focus:border-blue-400 transition-all outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white/50">
                                                        <div className="space-y-0.5">
                                                            {specialties
                                                                .filter(s => !formData.especialidades.includes(s.id))
                                                                .filter(s => s.nombre.toLowerCase().includes(searchTermAvailable.toLowerCase()))
                                                                .map(spec => (
                                                                    <button
                                                                        key={spec.id}
                                                                        type="button"
                                                                        onClick={() => toggleSelection("especialidades", spec.id)}
                                                                        className="w-full text-left px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100 group flex items-center justify-between"
                                                                    >
                                                                        <span className="truncate">{spec.nombre}</span>
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center justify-center gap-2 w-16 bg-slate-50/30 rounded-xl p-1 border border-slate-100 self-center py-4">
                                                    <button
                                                        type="button"
                                                        className="w-10 h-10 rounded-lg bg-white text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed flex items-center justify-center"
                                                        title="Seleccione un elemento para mover"
                                                    >
                                                        <FiChevronRight size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const filtered = specialties
                                                                .filter(s => !formData.especialidades.includes(s.id))
                                                                .filter(s => s.nombre.toLowerCase().includes(searchTermAvailable.toLowerCase()))
                                                                .map(s => s.id);
                                                            if (filtered.length > 0) {
                                                                setFormData(prev => ({ ...prev, especialidades: [...new Set([...prev.especialidades, ...filtered])] }));
                                                                setSearchTermAvailable("");
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-lg bg-blue-600 text-white border border-blue-500 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center group"
                                                        title="Añadir filtrados"
                                                    >
                                                        <FiChevronsRight size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="w-10 h-10 rounded-lg bg-white text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed flex items-center justify-center"
                                                        title="Seleccione un elemento para mover"
                                                    >
                                                        <FiChevronLeft size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, especialidades: [] }));
                                                            setSearchTermSelected("");
                                                        }}
                                                        className="w-10 h-10 rounded-lg bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-200 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center group"
                                                        title="Remover todos"
                                                    >
                                                        <FiChevronsLeft size={18} />
                                                    </button>
                                                </div>

                                                {/* Seleccionados */}
                                                <div className="flex flex-col flex-1 border border-blue-100 rounded-[20px] overflow-hidden bg-blue-50/5 shadow-sm">
                                                    <div className="bg-white px-4 py-3 border-b border-blue-100 space-y-2">
                                                        <div className="flex items-center justify-between px-1">
                                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Seleccionados</span>
                                                            <span className="text-[8px] font-bold bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-mono">
                                                                {formData.especialidades.length}
                                                            </span>
                                                        </div>
                                                        <div className="relative group">
                                                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors" size={12} />
                                                            <input
                                                                type="text"
                                                                placeholder="FILTRAR SELECCIONADOS..."
                                                                value={searchTermSelected}
                                                                onChange={e => setSearchTermSelected(e.target.value)}
                                                                className="w-full h-8 pl-9 pr-3 bg-blue-50/30 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-white focus:border-blue-400 transition-all outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-blue-50/10">
                                                        <div className="space-y-0.5">
                                                            {formData.especialidades
                                                                .map(id => specialties.find(s => s.id === id))
                                                                .filter(Boolean)
                                                                .filter(s => s.nombre.toLowerCase().includes(searchTermSelected.toLowerCase()))
                                                                .map(spec => (
                                                                    <button
                                                                        key={spec.id}
                                                                        type="button"
                                                                        onClick={() => toggleSelection("especialidades", spec.id)}
                                                                        className="w-full text-left px-3 py-1.5 rounded-md text-[10px] font-black text-blue-800 bg-white shadow-sm border border-blue-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-between group"
                                                                    >
                                                                        <span className="truncate">{spec.nombre}</span>
                                                                        <div className="w-4 h-4 rounded bg-blue-50 text-blue-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                                                                            <FiX size={8} />
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 4: SEGURIDAD & SESIÓN */}
                                <div className="relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                            <FiMail size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] leading-none mb-1">Seguridad & Sesión</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credenciales y privilegios de acceso</p>
                                        </div>
                                        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-900 p-10 rounded-[40px] shadow-2xl shadow-slate-200">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nombre de usuario *</label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                placeholder="ejemplo@odontosalud.com"
                                                className="h-14 bg-white/10 border-white/10 focus:border-blue-500 rounded-2xl px-5 font-bold text-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                                Contraseña {editId && <span className="text-[8px] opacity-60">(Solo para cambiar)</span>}
                                            </label>
                                            <Input
                                                type="password"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                required={!editId}
                                                placeholder="••••••••••••"
                                                className="h-14 bg-white/10 border-white/10 focus:border-blue-500 rounded-2xl px-5 font-bold text-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Perfil Asignado *</label>
                                            <select
                                                value={formData.profileId}
                                                onChange={e => setFormData({ ...formData, profileId: e.target.value })}
                                                required
                                                className="w-full h-14 bg-white/10 border border-white/10 focus:border-blue-500 rounded-2xl px-5 font-black text-[11px] uppercase text-white outline-none transition-all appearance-none"
                                            >
                                                <option value="" className="text-slate-800">Seleccionar perfil...</option>
                                                {rolesDisponibles.map(r => (
                                                    <option key={r.id} value={r.id} className="text-slate-800">{r.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Professional Footer Area */}
                        < div className="bg-white px-10 py-8 border-t border-slate-100 flex items-center justify-between shrink-0 relative z-20" >
                            <div className="flex flex-col">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic">Confirmación de Registro</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                                        <FiCheck size={10} className="text-blue-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">Asegúrese de validar los accesos antes de guardar</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmitForm}
                                    disabled={saving}
                                    className="relative group/save overflow-hidden bg-slate-900 hover:bg-black text-white px-10 py-3 rounded-[20px] text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_15px_45px_rgba(0,0,0,0.15)] transition-all active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/save:translate-y-0 transition-transform duration-500" />
                                    <span className="relative z-10 font-bold">{saving ? "G U A R D A N D O..." : "G U A R D A R"}</span>
                                    <FiSave size={18} className="relative z-10 group-hover/save:rotate-12 transition-transform duration-500" />
                                </button>
                            </div>
                        </div>
                    </div >
                </div >,
                document.body
            )
            }
        </div >
    );
}
