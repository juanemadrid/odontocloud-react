import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiBox, FiCheckCircle, FiAlertTriangle, FiMinus, FiSave, FiX, FiArrowLeft } from "react-icons/fi";

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

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 0,
    minimo: 5,
    unidad: "unidades"
  });

  // Cargar datos en tiempo real
  useEffect(() => {
    const q = query(collection(db, "inventario"), orderBy("nombre"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return items.filter(i =>
      i.nombre.toLowerCase().includes(t) ||
      (i.descripcion || "").toLowerCase().includes(t)
    );
  }, [items, searchTerm]);

  // Manejar Stock rápido
  const handleStockChange = async (item, delta) => {
    const nuevaCantidad = Math.max(0, (item.cantidad || 0) + delta);
    try {
      await updateDoc(doc(db, "inventario", item.id), { cantidad: nuevaCantidad });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, "inventario", editingItem.id), {
          ...form,
          cantidad: Number(form.cantidad),
          minimo: Number(form.minimo)
        });
      } else {
        await addDoc(collection(db, "inventario"), {
          ...form,
          cantidad: Number(form.cantidad),
          minimo: Number(form.minimo)
        });
      }
      setModalOpen(false);
      setEditingItem(null);
      setForm({ nombre: "", descripcion: "", cantidad: 0, minimo: 5, unidad: "unidades" });
    } catch (e) {
      console.error(e);
      alert("Error al guardar: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "inventario", id));
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      cantidad: item.cantidad,
      minimo: item.minimo || 5,
      unidad: item.unidad || "unidades"
    });
    setModalOpen(true);
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ nombre: "", descripcion: "", cantidad: 0, minimo: 5, unidad: "unidades" });
    setModalOpen(true);
  };

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
            placeholder="BUSCAR PRODUCTO POR NOMBRE O DESCRIPCIÓN..."
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
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-hidden flex-1 relative">
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
                <div key={item.id} className={`bg-white rounded-[24px] border ${alerta ? 'border-red-100 shadow-red-50' : 'border-slate-100 shadow-slate-50'} shadow-lg p-6 hover:shadow-xl transition-all duration-300 group flex flex-col relative overflow-hidden`}>
                  {alerta && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 blur-[40px] opacity-20 -mr-6 -mt-6"></div>}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex-1 pr-2">
                      <h3 className="text-[16px] font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{item.nombre}</h3>
                      <UnidadBadge unidad={item.unidad} />
                    </div>
                    <button onClick={() => openEdit(item)} className="p-2 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <FiEdit2 size={16} />
                    </button>
                  </div>

                  <p className="text-[12px] font-medium text-slate-400 mb-6 line-clamp-2 min-h-[2.5em]">{item.descripcion || "Sin descripción"}</p>

                  <div className="mt-auto space-y-4 relative z-10">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Actual</span>
                        <span className={`text-[32px] font-black tracking-tighter leading-none ${alerta ? 'text-red-500' : 'text-slate-800'}`}>
                          {item.cantidad}
                        </span>
                      </div>
                      {alerta && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wide animate-pulse">
                          <FiAlertTriangle /> Bajo Stock
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStockChange(item, -1)}
                        className="py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 font-black transition-all active:scale-95 flex items-center justify-center"
                      >
                        <FiMinus size={16} />
                      </button>
                      <button
                        onClick={() => handleStockChange(item, 1)}
                        className="py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100 font-black transition-all active:scale-95 flex items-center justify-center"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[18px] font-black text-slate-800 uppercase tracking-tight">
                {editingItem ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                <FiArrowLeft />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Guantes de Látex"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 outline-none focus:border-blue-500 transition-all"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Cantidad</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all text-center"
                    value={form.cantidad}
                    onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Mínimo</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all text-center"
                    value={form.minimo}
                    onChange={e => setForm({ ...form, minimo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Unidad de Medida</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none"
                  value={form.unidad}
                  onChange={e => setForm({ ...form, unidad: e.target.value })}
                >
                  <option value="unidades">Unidades</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="litros">Litros</option>
                  <option value="g">Gramos (g)</option>
                  <option value="kg">Kilogramos</option>
                  <option value="cajas">Cajas</option>
                  <option value="pares">Pares</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Borrar?')) handleDelete(editingItem.id);
                      setModalOpen(false);
                    }}
                    className="flex-1 py-4 rounded-2xl border border-red-100 text-red-500 font-black text-[12px] uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    <FiTrash2 className="inline mr-2" /> Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  <FiSave className="inline mr-2" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
