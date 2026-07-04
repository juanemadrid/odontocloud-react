import React, { useState, useEffect, useMemo } from "react";
import { db, storage } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../context/AuthContext";
import { subscribeToCategories } from "../../services/resourceService";
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiBox, 
  FiAlertTriangle, FiMinus, FiSave, FiX, 
  FiArrowLeft, FiCamera, FiImage, FiCheck 
} from "react-icons/fi";
import { toast } from "sonner";

const UnidadBadge = ({ unidad }) => {
  const colors = {
    unidades: "bg-blue-50 text-blue-600 border-blue-100",
    ml: "bg-purple-50 text-purple-600 border-purple-100",
    litros: "bg-indigo-50 text-indigo-600 border-indigo-100",
    g: "bg-emerald-50 text-emerald-600 border-emerald-100",
    kg: "bg-green-50 text-green-600 border-green-100",
    cajas: "bg-amber-50 text-amber-600 border-amber-100",
    pares: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${colors[unidad] || colors.unidades}`}>
      {unidad}
    </span>
  );
};

const initialFormState = {
  imagen: "",
  nombre: "",
  referencia: "",
  descripcion: "",
  cuenta_contable: "",
  categoria: "",
  es_servicio: false,
  precio_compra: "",
  cantidad: 0,
  minimo: 5,
  unidad: "unidades",
  marca: "",
  principio_activo: "",
  registro_invima: "",
  forma_farmaceutica: "",
  concentracion: "",
  presentacion_comercial: "",
  temperatura_almacenamiento: "",
  unidad_temperatura: "",
  humedad_almacenamiento: "",
  unidad_humedad: "",
  es_inventariable: false,
  clasificacion_riesgo: "",
  vida_util: "",
  periodicidad_mantenimiento: "",
  periodicidad_calibracion: "",
  extension_texto_1: "",
  extension_texto_2: "",
  extension_numero_1: "",
  extension_numero_2: "",
  extension_fecha_1: "",
  extension_fecha_2: ""
};

export default function Inventario() {
  const { userProfile } = useAuth();
  const inquilino = userProfile?.inquilino;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Modal tabs & upload states
  const [activeTab, setActiveTab] = useState("basica"); // basica, stock, tecnica, almacenamiento, adicional
  const [isUploading, setIsUploading] = useState(false);
  const [categoriasList, setCategoriasList] = useState([]);

  // Formulario
  const [form, setForm] = useState(initialFormState);

  // Cargar categorías del inquilino
  useEffect(() => {
    if (!inquilino) return;
    const unsubscribe = subscribeToCategories(inquilino, (data) => {
      setCategoriasList(data);
    });
    return () => unsubscribe();
  }, [inquilino]);

  // Cargar datos en tiempo real filtrados por inquilino
  useEffect(() => {
    if (!inquilino) return;
    const q = query(
      collection(db, "inventario"), 
      where("inquilino", "==", inquilino)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordenar en memoria para evitar errores de índice compuesto
      data.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [inquilino]);

  const filteredItems = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return items.filter(i =>
      (i.nombre || "").toLowerCase().includes(t) ||
      (i.descripcion || "").toLowerCase().includes(t) ||
      (i.referencia || "").toLowerCase().includes(t)
    );
  }, [items, searchTerm]);

  // Manejar Stock rápido
  const handleStockChange = async (item, delta) => {
    const nuevaCantidad = Math.max(0, (item.cantidad || 0) + delta);
    try {
      await updateDoc(doc(db, "inventario", item.id), { 
        cantidad: nuevaCantidad,
        actualizado: new Date()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `inventario/${inquilino}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(prev => ({ ...prev, imagen: url }));
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast.error("No se pudo subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!form.categoria) {
      toast.error("Debe seleccionar una Categoría");
      return;
    }

    try {
      const dataToSave = {
        ...form,
        inquilino,
        cantidad: Number(form.cantidad) || 0,
        minimo: Number(form.minimo) || 0,
        precio_compra: Number(String(form.precio_compra).replace(/\D/g, "")) || 0,
        actualizado: new Date()
      };

      if (editingItem) {
        await updateDoc(doc(db, "inventario", editingItem.id), dataToSave);
      } else {
        await addDoc(collection(db, "inventario"), {
          ...dataToSave,
          creado: new Date()
        });
      }
      setModalOpen(false);
      setEditingItem(null);
      setForm(initialFormState);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "inventario", id));
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      ...initialFormState,
      ...item
    });
    setActiveTab("basica");
    setModalOpen(true);
  };

  const openNew = () => {
    setEditingItem(null);
    setForm(initialFormState);
    setActiveTab("basica");
    setModalOpen(true);
  };

  const handleCOPFormat = (val) => {
    if (!val) return "";
    const numericVal = String(val).replace(/\D/g, "");
    if (!numericVal) return "";
    return Number(numericVal).toLocaleString("es-CO");
  };

  // Categorías de respaldo si el inquilino no tiene
  const standardCategories = [
    { id: "cat-meds", nombre: "Medicamentos" },
    { id: "cat-insumos", nombre: "Insumos Clínicos" },
    { id: "cat-desinf", nombre: "Desinfectantes" },
    { id: "cat-equipos", nombre: "Equipos" },
    { id: "cat-lab", nombre: "Material de Laboratorio" },
    { id: "cat-oficina", nombre: "Oficina" }
  ];
  const categoriesToDisplay = categoriasList.length > 0 ? categoriasList : standardCategories;

  return (
    <div className="w-full flex flex-col gap-10 animate-fadeIn px-2 md:px-6 lg:px-10 pb-10 h-screen overflow-hidden">

      {/* 1. THE ARCHITECTURAL HEADER (Slender Pro Institutional Style) */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 flex-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <FiBox className="text-blue-600" />
            <span>Institucional</span>
            <span className="text-slate-200">/</span>
            <span className="text-slate-800">Control de Inventario</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
            Gestión <span className="text-blue-600">Insumos</span>
          </h2>
          <div className="w-12 h-1.5 bg-blue-600 rounded-full" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openNew}
            className="flex items-center gap-3 px-8 py-4 rounded-[22px] bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.1em] shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <FiPlus size={16} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* 2. THE SLENDER HUD (Search & Filters) */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-4 flex flex-col lg:flex-row items-center gap-4 flex-none">
        <div className="relative flex-1 group w-full">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
            <FiSearch className="text-blue-600" size={18} />
          </div>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] pl-16 pr-8 py-5 text-[12px] font-black text-slate-800 focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all outline-none placeholder:text-slate-300 uppercase tracking-tight"
            placeholder="BUSCAR PRODUCTO POR NOMBRE O REFERENCIA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 px-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-5 py-3">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Total: {items.length}</span>
          </div>
        </div>
      </div>

      {/* 3. THE INSTITUTIONAL CONTENT (Grid Container) */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-y-auto flex-1 p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 animate-pulse">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-blue-400 mb-4">
              <FiBox size={24} />
            </div>
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Cargando inventario...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <FiBox size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">No hay productos registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filteredItems.map(item => {
              const alerta = item.cantidad <= (item.minimo || 5);
              return (
                <div key={item.id} className={`bg-white rounded-[28px] border ${alerta ? 'border-red-100 shadow-red-50/20' : 'border-slate-150 shadow-slate-100/30'} hover:shadow-xl hover:border-slate-200 transition-all duration-300 group flex flex-col relative overflow-hidden`}>
                  
                  {/* Banner superior con imagen o ícono */}
                  <div className="relative w-full h-36 bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden flex-none">
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100/70 flex items-center justify-center relative">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-sm">
                          <FiBox size={24} />
                        </div>
                      </div>
                    )}
                    
                    {/* Botón flotante para editar */}
                    <button 
                      onClick={() => openEdit(item)} 
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:scale-105 shadow-sm transition-all border border-slate-200/50 z-20"
                      title="Editar Producto"
                    >
                      <FiEdit2 size={13} />
                    </button>

                    {/* Alerta de Bajo Stock */}
                    {alerta && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse z-20">
                        <FiAlertTriangle size={10} /> Bajo Stock
                      </div>
                    )}
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Fila de insignias (unidad de medida y categoría con espacio horizontal) */}
                      <div className="flex flex-wrap gap-2 items-center mb-3">
                        <UnidadBadge unidad={item.unidad} />
                        {item.categoria && (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-slate-150 text-slate-650 border border-slate-200 uppercase tracking-wider">
                            {item.categoria}
                          </span>
                        )}
                      </div>

                      {/* Nombre del concepto */}
                      <h3 className="text-[14px] font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase tracking-tight min-h-[2.5em]">{item.nombre}</h3>
                      
                      {/* Descripción */}
                      <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-4 line-clamp-2 min-h-[2.5em]">
                        {item.descripcion || "Sin descripción adicional registrada."}
                      </p>
                    </div>

                    {/* Stock y controles de ajuste rápido */}
                    <div className="pt-4 border-t border-slate-100/80 space-y-4">
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock Actual</span>
                          <span className={`text-[28px] font-black tracking-tighter leading-none mt-1 ${alerta ? 'text-red-500' : 'text-slate-800'}`}>
                            {item.cantidad}
                          </span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mínimo</span>
                          <span className="text-[13px] font-black text-slate-600 mt-1 uppercase">
                            {item.minimo || 5} {item.unidad}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleStockChange(item, -1)}
                          className="py-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-500 border border-slate-100 hover:border-red-100 text-slate-400 transition-all active:scale-95 flex items-center justify-center"
                        >
                          <FiMinus size={15} />
                        </button>
                        <button
                          onClick={() => handleStockChange(item, 1)}
                          className="py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-500 border border-slate-100 hover:border-emerald-100 text-slate-400 transition-all active:scale-95 flex items-center justify-center"
                        >
                          <FiPlus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. REDESIGNED TABBED MODAL (Premium Large Scale layout) */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-none">
              <div>
                <h3 className="text-[18px] font-black text-slate-800 uppercase tracking-tight">
                  {editingItem ? "Editar Producto" : "Nuevo Producto"}
                </h3>
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                  <span>Administración</span> <span>-</span>
                  <span>Inventario</span> <span>-</span>
                  <span className="text-blue-500">{editingItem ? "Modificar concepto" : "Añadir concepto"}</span>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-200 bg-white">
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Tabs Navigator */}
            <div className="flex bg-slate-50 px-8 py-2 border-b border-slate-100 gap-2 overflow-x-auto flex-none scrollbar-none">
              {[
                { id: "basica", label: "Inf. Básica" },
                { id: "stock", label: "Stock & Medida" },
                { id: "tecnica", label: "Inf. Técnica" },
                { id: "almacenamiento", label: "Almacenamiento" },
                { id: "adicional", label: "Datos Adicionales" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/50 scale-[1.02]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content Scroll Area */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              {/* TAB 1: INFORMACIÓN BÁSICA */}
              {activeTab === "basica" && (
                <div className="space-y-6">
                  {/* Imagen y Drag Box */}
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start pb-6 border-b border-dashed border-slate-150">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest md:w-1/4 md:text-right pt-2">Imagen</span>
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden relative group cursor-pointer shadow-inner">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={handleImageChange}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 animate-pulse">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subiendo...</span>
                          </div>
                        ) : form.imagen ? (
                          <img src={form.imagen} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-slate-400 w-full h-full flex flex-col items-center justify-center relative group-hover:bg-slate-500 transition-colors">
                            <div className="absolute w-[40px] h-[40px] rounded-full bg-white/20 top-[20%]"></div>
                            <div className="absolute w-[80px] h-[60px] rounded-t-full bg-white/20 bottom-0"></div>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Arrastra o click para cargar la foto.</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Solo archivos de imágenes</p>
                      </div>
                    </div>
                  </div>

                  {/* Campos Básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre del Concepto *</label>
                      <input
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                        placeholder="NOMBRE DEL CONCEPTO"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Referencia</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                        value={form.referencia}
                        onChange={e => setForm({ ...form, referencia: e.target.value })}
                        placeholder="REFERENCIA DEL CONCEPTO"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                        value={form.descripcion}
                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                        placeholder="DESCRIPCIÓN DEL CONCEPTO"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cuenta Contable</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none"
                        value={form.cuenta_contable}
                        onChange={e => setForm({ ...form, cuenta_contable: e.target.value })}
                      >
                        <option value="">SELECCIONE...</option>
                        <option value="Activos">ACTIVOS</option>
                        <option value="Pasivos">PASIVOS</option>
                        <option value="Patrimonio">PATRIMONIO</option>
                        <option value="Ingresos">INGRESOS</option>
                        <option value="Egresos">EGRESOS</option>
                        <option value="Costos de venta">COSTOS DE VENTA</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Categoría *</label>
                      <select 
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none"
                        value={form.categoria}
                        onChange={e => setForm({ ...form, categoria: e.target.value })}
                      >
                        <option value="">SELECCIONE...</option>
                        {categoriesToDisplay.map(cat => (
                          <option key={cat.id} value={cat.nombre}>{cat.nombre.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Precio Compra *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                        <input
                          required
                          type="text"
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                          value={handleCOPFormat(form.precio_compra)}
                          onChange={e => setForm({ ...form, precio_compra: e.target.value.replace(/\D/g, "") })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pl-1 pt-6">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">¿Es servicio?</span>
                      <div 
                        onClick={() => setForm({ ...form, es_servicio: !form.es_servicio })}
                        className={`w-12 h-6 rounded-full cursor-pointer transition-all duration-300 relative flex items-center shadow-inner ${form.es_servicio ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute ${form.es_servicio ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTROL DE STOCK & MEDIDA */}
              {activeTab === "stock" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cantidad Inicial / Stock *</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all text-center"
                      value={form.cantidad}
                      onChange={e => setForm({ ...form, cantidad: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Stock Mínimo (Alerta) *</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all text-center"
                      value={form.minimo}
                      onChange={e => setForm({ ...form, minimo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unidad de Medida *</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none"
                      value={form.unidad}
                      onChange={e => setForm({ ...form, unidad: e.target.value })}
                    >
                      <option value="unidades">UNIDADES</option>
                      <option value="ml">MILILITROS (ML)</option>
                      <option value="litros">LITROS</option>
                      <option value="g">GRAMOS (G)</option>
                      <option value="kg">KILOGRAMOS</option>
                      <option value="cajas">CAJAS</option>
                      <option value="pares">PARES</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4 pl-1 pt-6">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">¿Es inventariable?</span>
                    <div 
                      onClick={() => setForm({ ...form, es_inventariable: !form.es_inventariable })}
                      className={`w-12 h-6 rounded-full cursor-pointer transition-all duration-300 relative flex items-center shadow-inner ${form.es_inventariable ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute ${form.es_inventariable ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INFORMACIÓN TÉCNICA */}
              {activeTab === "tecnica" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Marca", id: "marca", placeholder: "MARCA DEL CONCEPTO" },
                    { label: "Principio Activo", id: "principio_activo", placeholder: "PRINCIPIO ACTIVO DEL CONCEPTO" },
                    { label: "Registro Invima", id: "registro_invima", placeholder: "INFORMACION INVIMA DEL CONCEPTO" },
                    { label: "Forma Farmacéutica", id: "forma_farmaceutica", placeholder: "FORMA FARMACÉUTICA" },
                    { label: "Concentración", id: "concentracion", placeholder: "CONCENTRACIÓN DEL CONCEPTO" },
                    { label: "Presentación Comercial", id: "presentacion_comercial", placeholder: "PRESENTACIÓN COMERCIAL" }
                  ].map(field => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{field.label}</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                        value={form[field.id]}
                        onChange={e => setForm({ ...form, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ALMACENAMIENTO */}
              {activeTab === "almacenamiento" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Temperatura de Almacenamiento", id: "temperatura_almacenamiento", placeholder: "TEMPERATURA DE ALMACENAMIENTO" },
                    { label: "Unidad de Temperatura", id: "unidad_temperatura", placeholder: "UNIDAD DE TEMP." },
                    { label: "Humedad de Almacenamiento", id: "humedad_almacenamiento", placeholder: "HUMEDAD DE ALMACENAMIENTO" },
                    { label: "Unidad de Humedad", id: "unidad_humedad", placeholder: "UNIDAD DE HUMEDAD" },
                    { label: "Clasificación de Riesgo", id: "clasificacion_riesgo", placeholder: "CLASIF. RIESGO DEL CONCEPTO" },
                    { label: "Vida Útil", id: "vida_util", placeholder: "VIDA ÚTIL DEL CONCEPTO" },
                    { label: "Periodicidad Mantenimiento", id: "periodicidad_mantenimiento", placeholder: "PERIODICIDAD MANT." },
                    { label: "Periodicidad Calibración", id: "periodicidad_calibracion", placeholder: "PERIODICIDAD CAL." }
                  ].map(field => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{field.label}</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-355"
                        value={form[field.id]}
                        onChange={e => setForm({ ...form, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: DATOS ADICIONALES */}
              {activeTab === "adicional" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Extensión Texto 1</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                      value={form.extension_texto_1}
                      onChange={e => setForm({ ...form, extension_texto_1: e.target.value })}
                      placeholder="EXT. TEXTO 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Extensión Texto 2</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                      value={form.extension_texto_2}
                      onChange={e => setForm({ ...form, extension_texto_2: e.target.value })}
                      placeholder="EXT. TEXTO 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Extensión Número 1</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                      value={form.extension_numero_1}
                      onChange={e => setForm({ ...form, extension_numero_1: e.target.value })}
                      placeholder="EXT. NÚMERO 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Extensión Número 2</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-350"
                      value={form.extension_numero_2}
                      onChange={e => setForm({ ...form, extension_numero_2: e.target.value })}
                      placeholder="EXT. NÚMERO 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Extensión Fecha 1 (dd/mm/aaaa)</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-650 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={form.extension_fecha_1}
                      onChange={e => setForm({ ...form, extension_fecha_1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Extensión Fecha 2 (dd/mm/aaaa)</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-650 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={form.extension_fecha_2}
                      onChange={e => setForm({ ...form, extension_fecha_2: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Form Actions inside scroll area at the bottom */}
              <div className="pt-8 border-t border-slate-100 flex gap-4 mt-8">
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingItem.id)}
                    className="flex-1 py-4 rounded-2xl border border-red-100 text-red-500 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    <FiTrash2 className="inline mr-2" /> Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiSave size={16} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
