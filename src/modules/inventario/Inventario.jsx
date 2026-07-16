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
  where
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { subscribeToCategories } from "../../services/resourceService";
import { toast } from "sonner";
import { 
  FiBox, FiAlertTriangle, FiMinus, FiPlus, 
  FiSettings, FiHelpCircle, FiChevronRight 
} from "react-icons/fi";

// Sub-modules
import ProductosList from "./components/ProductosList";
import ProductoForm from "./components/ProductoForm";
import RecepcionProducto from "./components/RecepcionProducto";
import SalidaProducto from "./components/SalidaProducto";
import ListadoInventario from "./components/ListadoInventario";
import MovimientosInventario from "./components/MovimientosInventario";
import AjustesInventario from "./components/AjustesInventario";

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
  const { userProfile } = useAuth();
  const inquilino = userProfile?.inquilino || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriasList, setCategoriasList] = useState([]);

  // Submodule navigation
  const [currentModule, setCurrentModule] = useState("productos"); // productos, gestion, recepcion, salida, listado, movimientos, ajustes
  const [showForm, setShowForm] = useState(false);
  const [activeFormItem, setActiveFormItem] = useState(null);

  // Load categories
  useEffect(() => {
    if (!inquilino) return;
    const unsubscribe = subscribeToCategories(inquilino, (data) => {
      setCategoriasList(data);
    });
    return () => unsubscribe();
  }, [inquilino]);

  // Load items
  useEffect(() => {
    if (!inquilino) return;
    const q = query(
      collection(db, "inventario"), 
      where("inquilino", "==", inquilino)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [inquilino]);

  const handleStockChange = async (item, delta) => {
    const newQty = Math.max(0, (item.cantidad || 0) + delta);
    try {
      await updateDoc(doc(db, "inventario", item.id), { 
        cantidad: newQty,
        actualizado: new Date()
      });
    } catch (e) {
      console.error("Error setting stock delta:", e);
    }
  };

  const handleSaveProduct = async (data) => {
    try {
      if (activeFormItem) {
        await updateDoc(doc(db, "inventario", activeFormItem.id), {
          ...data,
          actualizado: new Date()
        });
        toast.success("Producto modificado correctamente.");
      } else {
        await addDoc(collection(db, "inventario"), {
          ...data,
          inquilino,
          creado: new Date(),
          actualizado: new Date()
        });
        toast.success("Producto creado correctamente.");
      }
      setShowForm(false);
      setActiveFormItem(null);
    } catch (e) {
      console.error("Error saving product data:", e);
      toast.error("Error al guardar el producto.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "inventario", id));
      toast.success("Producto eliminado.");
    } catch (e) {
      console.error("Error deleting product:", e);
      toast.error("Error al eliminar el producto.");
    }
  };

  // Standard backup categories if empty
  const standardCategories = [
    { id: "cat-meds", nombre: "Medicamentos" },
    { id: "cat-insumos", nombre: "Insumos Clínicos" },
    { id: "cat-desinf", nombre: "Desinfectantes" },
    { id: "cat-equipos", nombre: "Equipos" },
    { id: "cat-lab", nombre: "Material de Laboratorio" },
    { id: "cat-oficina", nombre: "Oficina" }
  ];
  const categoriesToDisplay = categoriasList.length > 0 ? categoriasList : standardCategories;

  // Filter items for quick stock adjustments in "Gestión inventario" view
  const filteredQuickList = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return items.filter(i =>
      (i.nombre || "").toLowerCase().includes(t) ||
      (i.descripcion || "").toLowerCase().includes(t) ||
      (i.referencia || "").toLowerCase().includes(t)
    );
  }, [items, searchTerm]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full p-4 md:p-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Left sub-navigation sidebar */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-50 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información general</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Tab: Productos */}
            <div className="relative group/tooltip">
              <button
                onClick={() => {
                  setCurrentModule("productos");
                  setShowForm(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                  currentModule === "productos" && !showForm
                    ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span>Productos</span>
                <FiChevronRight size={14} className={currentModule === "productos" ? "opacity-100" : "opacity-0"} />
              </button>
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-56 p-3 bg-slate-800 text-white text-[10px] font-medium leading-relaxed rounded-xl shadow-xl border border-slate-700/50 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50">
                Son los productos que ofrece la empresa, para la venta y/o compra. Estos también pueden ser de consumo interno.
              </div>
            </div>

            {/* Tab: Gestión inventario */}
            <button
              onClick={() => {
                setCurrentModule("gestion");
                setShowForm(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                currentModule === "gestion" && !showForm
                  ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>Gestión inventario</span>
              <FiChevronRight size={14} className={currentModule === "gestion" ? "opacity-100" : "opacity-0"} />
            </button>

            {/* Tab: Recepción producto */}
            <button
              onClick={() => {
                setCurrentModule("recepcion");
                setShowForm(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                currentModule === "recepcion" && !showForm
                  ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>Recepción producto</span>
              <FiChevronRight size={14} className={currentModule === "recepcion" ? "opacity-100" : "opacity-0"} />
            </button>

            {/* Tab: Salida producto */}
            <button
              onClick={() => {
                setCurrentModule("salida");
                setShowForm(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                currentModule === "salida" && !showForm
                  ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>Salida producto</span>
              <FiChevronRight size={14} className={currentModule === "salida" ? "opacity-100" : "opacity-0"} />
            </button>

            {/* Tab: Listado de inventario */}
            <button
              onClick={() => {
                setCurrentModule("listado");
                setShowForm(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                currentModule === "listado" && !showForm
                  ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>Listado de inventario</span>
              <FiChevronRight size={14} className={currentModule === "listado" ? "opacity-100" : "opacity-0"} />
            </button>

            {/* Tab: Listado de movimientos */}
            <button
              onClick={() => {
                setCurrentModule("movimientos");
                setShowForm(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                currentModule === "movimientos" && !showForm
                  ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>Listado de movimientos</span>
              <FiChevronRight size={14} className={currentModule === "movimientos" ? "opacity-100" : "opacity-0"} />
            </button>

            {/* Tab: Ajustes de inventario */}
            <button
              onClick={() => {
                setCurrentModule("ajustes");
                setShowForm(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${
                currentModule === "ajustes" && !showForm
                  ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>Ajustes de inventario</span>
              <FiChevronRight size={14} className={currentModule === "ajustes" ? "opacity-100" : "opacity-0"} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Right Module Content Area */}
      <div className="flex-1 min-w-0">
        {showForm ? (
          <ProductoForm 
            item={activeFormItem}
            categories={categoriesToDisplay}
            inquilino={inquilino}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setActiveFormItem(null);
            }}
          />
        ) : (
          <>
            {/* Products (Price list) */}
            {currentModule === "productos" && (
              <ProductosList 
                items={items}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onNew={() => {
                  setActiveFormItem(null);
                  setShowForm(true);
                }}
                onEdit={(item) => {
                  setActiveFormItem(item);
                  setShowForm(true);
                }}
                onDelete={handleDeleteProduct}
              />
            )}

            {/* Gestión inventario (Quick adjustments card grid) */}
            {currentModule === "gestion" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative w-full max-w-md">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o referencia..."
                      className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-5 py-2">
                    <div className="w-2 h-2 rounded-full bg-[#8cc33f]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Total: {items.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="col-span-full py-20 text-center font-bold text-slate-400">Cargando gestión...</div>
                  ) : filteredQuickList.length === 0 ? (
                    <div className="col-span-full py-20 text-center font-bold text-slate-400">No hay productos registrados</div>
                  ) : (
                    filteredQuickList.map(item => {
                      const isLow = (item.cantidad || 0) <= (item.minimo || 5);
                      return (
                        <div key={item.id} className={`bg-white rounded-[28px] p-6 border ${isLow ? 'border-rose-100' : 'border-slate-100'} shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between`}>
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <UnidadBadge unidad={item.unidad} />
                              {isLow && (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-rose-100">
                                  <FiAlertTriangle className="inline mr-1" size={10} /> Bajo Stock
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight mb-1">{item.nombre}</h4>
                            <p className="text-[11px] text-slate-400 font-semibold">{item.marca ? `MARCA: ${item.marca}` : "Sin marca"}</p>
                          </div>

                          <div className="pt-4 border-t border-slate-50 space-y-4">
                            <div className="flex items-end justify-between">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock Actual</span>
                                <span className={`text-[28px] font-black leading-none mt-1 font-mono ${isLow ? 'text-rose-500' : 'text-slate-800'}`}>
                                  {item.cantidad}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mínimo</span>
                                <span className="text-[13px] font-black text-slate-600 mt-1 font-mono">{item.minimo || 5}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleStockChange(item, -1)}
                                className="py-2 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-500 border border-slate-100 hover:border-rose-100 text-slate-400 transition-all active:scale-95 flex items-center justify-center"
                              >
                                <FiMinus size={15} />
                              </button>
                              <button
                                onClick={() => handleStockChange(item, 1)}
                                className="py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-500 border border-slate-100 hover:border-emerald-100 text-slate-400 transition-all active:scale-95 flex items-center justify-center"
                              >
                                <FiPlus size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Recepción producto */}
            {currentModule === "recepcion" && (
              <RecepcionProducto items={items} />
            )}

            {/* Salida producto */}
            {currentModule === "salida" && (
              <SalidaProducto items={items} />
            )}

            {/* Listado de inventario */}
            {currentModule === "listado" && (
              <ListadoInventario 
                items={items}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            )}

            {/* Listado de movimientos */}
            {currentModule === "movimientos" && (
              <MovimientosInventario />
            )}

            {/* Ajustes de inventario */}
            {currentModule === "ajustes" && (
              <AjustesInventario items={items} />
            )}
          </>
        )}
      </div>

    </div>
  );
}
