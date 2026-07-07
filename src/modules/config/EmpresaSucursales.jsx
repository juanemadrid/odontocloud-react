import React, { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiArrowRight, FiArrowLeft, FiMapPin, FiCheckCircle, FiXCircle, FiSave, FiPhone, FiMail, FiLink, FiBox, FiPhoneCall, FiInfo, FiChevronsRight, FiChevronsLeft, FiChevronRight, FiChevronLeft, FiX } from "react-icons/fi";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const CIUDADES_COLOMBIA = [
    "Abejorral", "Acacías", "Aguachica", "Agustín Codazzi", "Anapoima", "Andes", "Apartadó", "Aracataca", "Arauca", "Armenia",
    "Baranoa", "Barbosa", "Barrancabermeja", "Barranquilla", "Bello", "Bogotá D.C.", "Bucaramanga", "Buenaventura", "Buga",
    "Cajicá", "Calarcá", "Caldas", "Cali", "Candelaria", "Carepa", "Cartagena", "Cartago", "Caucasia", "Cereté", "Chía",
    "Chigorodó", "Chiquinquirá", "Ciénaga", "Cota", "Cúcuta", "Dosquebradas", "Duitama", "El Bagre", "El Carmen de Viboral",
    "Envigado", "Espinal", "Facatativá", "Florencia", "Floridablanca", "Fundación", "Funza", "Fusagasugá", "Garzón", "Girardot",
    "Girón", "Granada", "Honda", "Ibagué", "Ipiales", "Itagüí", "Jamundí", "La Ceja", "La Dorada", "La Estrella", "La Mesa",
    "Lorica", "Madrid", "Magangué", "Maicao", "Malambo", "Manizales", "Marinilla", "Medellín", "Melgar", "Mitú", "Montelíbano",
    "Montería", "Mosquera", "Neiva", "Ocaña", "Paipa", "Palmira", "Pamplona", "Pasto", "Pereira", "Pitalito", "Planeta Rica",
    "Plato", "Popayán", "Puerto Asís", "Puerto Berrío", "Puerto Boyacá", "Puerto Carreño", "Puerto Colombia", "Quibdó",
    "Riohacha", "Rionegro", "Sabanalarga", "Sabaneta", "Sahagún", "San Andrés", "San Gil", "Santa Marta", "Santa Rosa de Cabal",
    "Santander de Quilichao", "Saravena", "Sevilla", "Sibaté", "Sincelejo", "Soacha", "Socorro", "Sogamoso", "Soledad", "Sonsón",
    "Sopó", "Tibú", "Tierralta", "Tuluá", "Tumaco", "Tunja", "Turbaco", "Turbo", "Valledupar", "Villa del Rosario", "Villavicencio",
    "Villeta", "Yopal", "Yumbo", "Zipaquirá"
].sort();

function SucursalEditor({ item, onBack, inquilino }) {
    const [form, setForm] = useState({
        nombre: item?.nombre || "",
        telefono: item?.telefono || "",
        celular: item?.celular || "",
        ciudad: item?.ciudad || "",
        direccion: item?.direccion || "",
        codigoPostal: item?.codigoPostal || "",
        email: item?.email || "",
        consecutivoId: item?.consecutivoId || "",
        listaPrecioId: item?.listaPrecioId || "",
        mostrarPie: item?.mostrarPie || false,
        piePersonalizado: item?.piePersonalizado || "",
        codigoPrestador: item?.codigoPrestador || "",
        entidadExtranjeros: item?.entidadExtranjeros || "000508",
        entidadNacionales: item?.entidadNacionales || "000508",
        centroCostos: item?.centroCostos || false,
        centroCostosValor: item?.centroCostosValor || "",
        usuarioSoporte: item?.usuarioSoporte || "Ninguno",
        codigoPrestadorPropio: item?.codigoPrestadorPropio || false
    });

    const [allAlmacenes, setAllAlmacenes] = useState([]);
    const [selectedAlmacenesIds, setSelectedAlmacenesIds] = useState(item?.almacenesIds || []);
    const [consecutivos, setConsecutivos] = useState([]);
    const [listasPrecios, setListasPrecios] = useState([]);

    useEffect(() => {
        const loadDeps = async () => {
            if (!inquilino) return;
            try {
                const snapC = await getDocs(query(collection(db, "consecutivos"), where("inquilino", "==", inquilino)));
                setConsecutivos(snapC.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")));

                const snapL = await getDocs(query(collection(db, "listas_precios"), where("inquilino", "==", inquilino)));
                setListasPrecios(snapL.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")));

                const snapA = await getDocs(query(collection(db, "almacenes"), where("inquilino", "==", inquilino)));
                setAllAlmacenes(snapA.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")));
            } catch (e) { console.error(e); }
        };
        loadDeps();
    }, [inquilino]);

    const availableAlmacenes = allAlmacenes.filter(a => !selectedAlmacenesIds.includes(a.id));
    const selectedAlmacenesList = allAlmacenes.filter(a => selectedAlmacenesIds.includes(a.id));

    const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
    const handleMoveAlmacen = (id, direction) => {
        if (direction === "add") {
            setSelectedAlmacenesIds(prev => [...new Set([...prev, id])]);
        } else if (direction === "remove") {
            setSelectedAlmacenesIds(prev => prev.filter(pid => pid !== id));
        }
    };

    const handleMoveAllAlmacenes = (direction) => {
        if (direction === "addAll") {
            const filtered = availableAlmacenes
                .filter(a => (a.nombre || "").toLowerCase().includes(searchTermSucAvailable.toLowerCase()))
                .map(a => a.id);
            setSelectedAlmacenesIds(prev => [...new Set([...prev, ...filtered])]);
            setSearchTermSucAvailable("");
        } else if (direction === "removeAll") {
            setSelectedAlmacenesIds([]);
            setSearchTermSucSelected("");
        }
    };

    const [searchTermSucAvailable, setSearchTermSucAvailable] = useState("");
    const [searchTermSucSelected, setSearchTermSucSelected] = useState("");

    const handleSave = async () => {
        // Validar campos obligatorios
        if (!form.nombre.trim()) return alert("El nombre es obligatorio");
        if (!form.telefono.trim()) return alert("El teléfono fijo es obligatorio");
        if (!form.celular.trim()) return alert("El celular es obligatorio");
        if (!form.ciudad) return alert("La ciudad es obligatoria");
        if (!form.direccion.trim()) return alert("La dirección es obligatoria");
        if (!form.email.trim()) return alert("El correo electrónico es obligatorio");
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return alert("El correo electrónico no es válido");
        
        if (!form.consecutivoId) return alert("Debe seleccionar un consecutivo");
        if (!form.listaPrecioId) return alert("Debe seleccionar una lista de precios");
        if (selectedAlmacenesIds.length === 0) return alert("Debe seleccionar al menos un almacén");
        
        try {
            const payload = { ...form, inquilino, almacenesIds: selectedAlmacenesIds, actualizado: new Date() };
            if (item?.id) {
                await updateDoc(doc(db, "sucursales", item.id), payload);
                alert("Sucursal actualizada correctamente");
            } else {
                await addDoc(collection(db, "sucursales"), { ...payload, creado: new Date() });
                alert("Sucursal creada correctamente");
            }
            onBack();
        } catch (e) { 
            console.error(e); 
            alert("Error al guardar la sucursal: " + e.message);
        }
    };

    return (
        <div className="p-4 w-full max-w-5xl mx-auto relative transition-all duration-300">
            {/* Header: Institutional & Actions */}
            <div className="group/section bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative mb-6">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90"
                        >
                            <FiArrowLeft size={18} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                            <FiMapPin size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[18px] font-black text-slate-800 uppercase tracking-tighter">
                                {item ? "Editar Sucursal" : "Nueva Sucursal"}
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Gestión de sede física</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Editor Body */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-12 relative overflow-hidden">
                <div className="max-w-3xl mx-auto space-y-8 relative">

                    {/* NOMBRE */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Nombre *</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                            value={form.nombre}
                            onChange={e => handleChange("nombre", e.target.value)}
                            placeholder="Nombre de la sucursal"
                        />
                    </div>

                    {/* TELEFONO FIJO */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Teléfono fijo *</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                            value={form.telefono}
                            onChange={e => handleChange("telefono", e.target.value)}
                            placeholder="Ingrese el número de teléfono fijo de la sucursal"
                        />
                    </div>

                    {/* CELULAR */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Celular *</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                            value={form.celular}
                            onChange={e => handleChange("celular", e.target.value)}
                            placeholder="Ingrese el número celular de la sucursal"
                        />
                    </div>

                    {/* CIUDAD */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Ciudad*</label>
                        <select
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm appearance-none"
                            value={form.ciudad}
                            onChange={e => handleChange("ciudad", e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {CIUDADES_COLOMBIA.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* DIRECCION */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Dirección*</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                            value={form.direccion}
                            onChange={e => handleChange("direccion", e.target.value)}
                            placeholder="Ingrese la dirección de la sucursal"
                        />
                    </div>

                    {/* CODIGO POSTAL */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Código postal</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                            value={form.codigoPostal}
                            onChange={e => handleChange("codigoPostal", e.target.value)}
                            placeholder="Ingrese el código postal de la oficina"
                        />
                    </div>

                    {/* CORREO ELECTRONICO */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Correo electrónico *</label>
                        <input
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                            value={form.email}
                            onChange={e => handleChange("email", e.target.value)}
                            placeholder="Ingrese el email de la sucursal"
                        />
                    </div>

                    {/* CONSECUTIVO */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Consecutivo*</label>
                        <select
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm appearance-none"
                            value={form.consecutivoId}
                            onChange={e => handleChange("consecutivoId", e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {consecutivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>

                    {/* LISTA DE PRECIOS */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Lista de precios*</label>
                        <select
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm appearance-none"
                            value={form.listaPrecioId}
                            onChange={e => handleChange("listaPrecioId", e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {listasPrecios.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                        </select>
                    </div>

                    {/* ALMACENES (DOBLE LISTA) */}
                    <div className="space-y-4">
                        <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Almacenes*</label>
                        <div className="flex flex-row items-stretch gap-4 h-[400px]">
                            {/* Disponibles */}
                            <div className="flex flex-col flex-1 border border-slate-200 rounded-[24px] overflow-hidden bg-slate-50 shadow-sm">
                                <div className="bg-white px-4 py-3 border-b border-slate-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Almacenes disponibles</span>
                                    </div>
                                    <div className="relative group">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                                        <input
                                            type="text"
                                            placeholder="FILTRAR..."
                                            value={searchTermSucAvailable}
                                            onChange={e => setSearchTermSucAvailable(e.target.value)}
                                            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wider focus:bg-white focus:border-blue-400 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                    <div className="space-y-1">
                                        {availableAlmacenes
                                            .filter(a => (a.nombre || "").toLowerCase().includes(searchTermSucAvailable.toLowerCase()))
                                            .map(a => (
                                                <button
                                                    key={a.id}
                                                    type="button"
                                                    onClick={() => handleMoveAlmacen(a.id, "add")}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100 flex items-center justify-between group"
                                                >
                                                    <span>{a.nombre}</span>
                                                    <FiChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex flex-col items-center justify-center gap-2 w-14 self-center">
                                <button
                                    type="button"
                                    className="w-10 h-10 rounded-xl bg-white text-slate-400 border border-slate-200 opacity-40 cursor-not-allowed flex items-center justify-center"
                                >
                                    <FiChevronRight size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMoveAllAlmacenes("addAll")}
                                    className="w-10 h-10 rounded-xl bg-blue-600 text-white border border-blue-500 hover:bg-blue-700 hover:scale-110 active:scale-90 transition-all shadow-lg flex items-center justify-center"
                                >
                                    <FiChevronsRight size={20} />
                                </button>
                                <button
                                    type="button"
                                    className="w-10 h-10 rounded-xl bg-white text-slate-400 border border-slate-200 opacity-40 cursor-not-allowed flex items-center justify-center"
                                >
                                    <FiChevronLeft size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMoveAllAlmacenes("removeAll")}
                                    className="w-10 h-10 rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-200 hover:scale-110 active:scale-90 transition-all shadow-sm flex items-center justify-center"
                                >
                                    <FiChevronsLeft size={20} />
                                </button>
                            </div>

                            {/* Seleccionados */}
                            <div className="flex flex-col flex-1 border border-blue-100 rounded-[24px] overflow-hidden bg-blue-50/20 shadow-sm">
                                <div className="bg-white px-4 py-3 border-b border-blue-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Almacenes seleccionados</span>
                                    </div>
                                    <div className="relative group">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                                        <input
                                            type="text"
                                            placeholder="FILTRAR..."
                                            value={searchTermSucSelected}
                                            onChange={e => setSearchTermSucSelected(e.target.value)}
                                            className="w-full h-9 pl-9 pr-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] font-bold uppercase tracking-wider focus:bg-white focus:border-blue-400 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                    <div className="space-y-1">
                                        {selectedAlmacenesList
                                            .filter(a => (a.nombre || "").toLowerCase().includes(searchTermSucSelected.toLowerCase()))
                                            .map(a => (
                                                <button
                                                    key={a.id}
                                                    type="button"
                                                    onClick={() => handleMoveAlmacen(a.id, "remove")}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-black text-blue-800 bg-white border border-blue-100 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-between group"
                                                >
                                                    <span>{a.nombre}</span>
                                                    <FiX size={12} className="text-blue-300 group-hover:text-red-500 transition-colors" />
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TOGGLES & REST OF FIELDS */}
                    <div className="pt-8 space-y-10">
                        {/* TOGGLE: Pie de pagina */}
                        <div className="flex items-center justify-between group/toggle bg-slate-50 p-6 rounded-[28px] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-blue-200">
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Datos de sucursal en pie de pág. doc clínicos</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">¿Imprimir información en el pie?</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={form.mostrarPie}
                                    onChange={e => handleChange("mostrarPie", e.target.checked)}
                                />
                                <div className={`w-14 h-7 rounded-full transition-all duration-300 relative ${form.mostrarPie ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 left-1 bg-white rounded-full h-5 w-5 transition-all duration-300 ${form.mostrarPie ? 'translate-x-7' : 'translate-x-0'}`} />
                                </div>
                            </label>
                        </div>

                        {/* PIE DE PAGINA PERSONALIZADO */}
                        <div className="space-y-3">
                            <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Pie de página personalizado doc cl.</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                value={form.piePersonalizado}
                                onChange={e => handleChange("piePersonalizado", e.target.value)}
                                placeholder="Ingrese la dirección de la sucursal"
                            />
                        </div>

                        {/* CODIGO PRESTADOR */}
                        <div className="space-y-3">
                            <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Código del prestador de servicio</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                value={form.codigoPrestador}
                                onChange={e => handleChange("codigoPrestador", e.target.value)}
                                placeholder="Código del prestador de servicio"
                            />
                        </div>

                        {/* ENTIDADES ADMINISTRADORAS */}
                        <div className="space-y-3">
                            <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Entidad Administradora extranjeros</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                value={form.entidadExtranjeros}
                                onChange={e => handleChange("entidadExtranjeros", e.target.value)}
                                placeholder="000000"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Entidad Administradora Nacionales</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                value={form.entidadNacionales}
                                onChange={e => handleChange("entidadNacionales", e.target.value)}
                                placeholder="000000"
                            />
                        </div>

                        {/* CENTRO DE COSTOS */}
                        <div className="space-y-3">
                            <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Centro de costos</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                value={form.centroCostosValor}
                                onChange={e => handleChange("centroCostosValor", e.target.value)}
                                placeholder="Centro de costos"
                            />
                        </div>

                        {/* USUARIO PARA SOPORTE */}
                        <div className="space-y-3">
                            <label className="text-[12px] font-black text-slate-500 tracking-[0.05em] ml-1">Usuario para soporte</label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm appearance-none"
                                value={form.usuarioSoporte}
                                onChange={e => handleChange("usuarioSoporte", e.target.value)}
                            >
                                <option value="Ninguno">Ninguno</option>
                                <option value="Soporte VIP">Soporte VIP</option>
                                <option value="Soporte Estándar">Soporte Estándar</option>
                            </select>
                        </div>

                        {/* TOGGLE: Código de prestador propio */}
                        <div className="flex items-center justify-between group/toggle bg-slate-50 p-6 rounded-[28px] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-emerald-200">
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Código de prestador propio</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">¿Usar código asignado específico?</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={form.codigoPrestadorPropio}
                                    onChange={e => handleChange("codigoPrestadorPropio", e.target.checked)}
                                />
                                <div className={`w-14 h-7 rounded-full transition-all duration-300 relative ${form.codigoPrestadorPropio ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 left-1 bg-white rounded-full h-5 w-5 transition-all duration-300 ${form.codigoPrestadorPropio ? 'translate-x-7' : 'translate-x-0'}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* BOTON GUARDAR */}
                    <div className="pt-12 flex justify-center">
                        <button
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-20 py-5 rounded-[30px] text-[15px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.5)] transition-all duration-700 active:scale-95 flex items-center gap-4 overflow-hidden relative group"
                            onClick={handleSave}
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <FiSave size={24} className="relative z-10 group-hover:rotate-6 transition-transform" />
                            <span className="relative z-10 text-[14px]">Guardar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EmpresaSucursales() {
    const { userProfile } = useAuth();
    const inquilino = userProfile?.inquilino;
    const [searchTerm, setSearchTerm] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("list");
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = async () => {
        if (!inquilino) return;
        setLoading(true);
        try {
            const q = query(collection(db, "sucursales"), where("inquilino", "==", inquilino));
            const snap = await getDocs(q);
            setRows(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")));
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [inquilino]);

    if (view === "editor") return <SucursalEditor item={editingItem} onBack={() => { setView("list"); fetchData(); }} inquilino={inquilino} />;

    const filteredRows = rows.filter(r => (r.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-4 w-full max-w-6xl mx-auto relative transition-all duration-300">
            {loading && (
                <div className="absolute top-4 right-4 z-50">
                    <div className="w-4 h-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Main Header / Toolbar */}
            <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden relative mb-6">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[1px_0_10px_rgba(37,99,235,0.15)]"></div>

                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                            <FiMapPin className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-slate-800 uppercase tracking-tighter">Sucursales</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Sedes y puntos de atención</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative group flex-1 md:flex-none">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-all font-black" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] font-extrabold text-slate-800 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm"
                            />
                        </div>

                        {/* New Button */}
                        <button
                            onClick={() => { setEditingItem(null); setView("editor"); }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                            <FiPlus className="text-lg" /> Nueva
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
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Nombre de Sede</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Ubicación y Contacto</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Estado</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Operaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-blue-400">
                                                <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Cargando sedes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <FiMapPin size={40} className="text-slate-300" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay sucursales registradas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row) => (
                                    <tr key={row.id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-4 border-b border-slate-50 transition-all group-hover/row:translate-x-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover/row:scale-110 transition-transform duration-500">
                                                    <FiMapPin size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[15px] font-black text-slate-700 uppercase tracking-tight">{row.nombre}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.ciudad}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                                                    <FiPhoneCall size={12} className="text-slate-400" />
                                                    {row.celular || row.telefono || "Sin contacto"}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                                    <FiMapPin size={10} />
                                                    {row.direccion || "Sin dirección"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit border border-emerald-100/50 shadow-sm">
                                                <FiCheckCircle size={12} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Activo</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 border-b border-slate-50 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-500 translate-x-4 group-hover/row:translate-x-0">
                                                <button
                                                    onClick={() => { setEditingItem(row); setView("editor"); }}
                                                    className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm("¿Eliminar?")) return;
                                                        await deleteDoc(doc(db, "sucursales", row.id));
                                                        setRows(prev => prev.filter(r => r.id !== row.id));
                                                    }}
                                                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all active:scale-90"
                                                >
                                                    <FiTrash2 size={16} />
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
        </div>
    );
}
