// src/modules/odontograma/Odontograma.jsx
import React, { useState, useEffect } from "react";
import OdontogramaVisual from "./components/OdontogramaVisual";
import { TRATAMIENTOS } from "../../api/tratamientosCatalog";
import { db } from "../../firebase/firebaseConfig";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    getDoc,
    addDoc,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore";

export default function Odontograma() {
    // --- Estados de Lógica del Odontograma ---
    const [selectedToolId, setSelectedToolId] = useState("caries");
    const [odontogramaData, setOdontogramaData] = useState({});
    const [planTratamiento, setPlanTratamiento] = useState([]);

    // --- Estados de Paciente ---
    const [searchTerm, setSearchTerm] = useState("");
    const [patientResults, setPatientResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null); // { id, nombre, ... }
    const [loading, setLoading] = useState(false);

    // --- BUSCAR PACIENTES ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!searchTerm || searchTerm.length < 3) {
                setPatientResults([]);
                return;
            }

            try {
                // Búsqueda simple por nombre (idealmente usar Algolia o busqueda compuesta)
                // Aquí hacemos un parche simulando "starts with" o trayendo varios
                const q = query(
                    collection(db, "pacientes"),
                    where("nombreCompleto", ">=", searchTerm),
                    where("nombreCompleto", "<=", searchTerm + "\uf8ff")
                );

                const snapshot = await getDocs(q);
                const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setPatientResults(results);
            } catch (error) {
                console.error("Error buscando pacientes:", error);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // --- CARGAR DATOS DEL PACIENTE SELECCIONADO ---
    useEffect(() => {
        if (!selectedPatient) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Cargar Odontograma Visual (Documento único)
                const odoRef = doc(db, "pacientes", selectedPatient.id, "odontograma", "estado");
                const odoSnap = await getDoc(odoRef);
                if (odoSnap.exists()) {
                    setOdontogramaData(odoSnap.data().data || {});
                } else {
                    setOdontogramaData({});
                }

                // 2. Cargar Plan de Tratamientos (Subcolección)
                const tratRef = collection(db, "pacientes", selectedPatient.id, "tratamientos");
                const tratSnap = await getDocs(tratRef);
                const tratamientos = tratSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setPlanTratamiento(tratamientos);

            } catch (e) {
                console.error("Error cargando datos del paciente:", e);
                alert("Error cargando la historia clínica.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedPatient]);

    // --- MANEJADORES ---

    const handleSelectPatient = (paciente) => {
        setSelectedPatient(paciente);
        setSearchTerm("");
        setPatientResults([]);
    };

    const handleToothClick = (dienteId, zona) => {
        if (!selectedPatient) {
            alert("Primero selecciona un paciente.");
            return;
        }
        if (!selectedToolId) return;

        const tool = TRATAMIENTOS.find(t => t.id === selectedToolId);
        if (!tool) return;

        // Actualizar visual (Local)
        setOdontogramaData((prev) => {
            const dienteData = prev[dienteId] || {};
            let newData;

            if (tool.tipo === "diente") {
                newData = {
                    ...dienteData,
                    general: tool,
                    top: tool, bottom: tool, left: tool, right: tool, center: tool
                };
            } else if (tool.tipo === "superficie") {
                newData = {
                    ...dienteData,
                    [zona]: tool
                };
            } else {
                return prev;
            }
            return { ...prev, [dienteId]: newData };
        });

        // Agregar al plan (Local, se guarda al final o podríamos guardar directo)
        // Para UX rápida, lo agrugamos al estado y el usuario dará "Guardar" para persistir todo
        // Opcionalmente podemos guardar 1 a 1. Hagamóslo en lote con "Guardar" para evitar escrituras parciales.

        const nuevoItem = {
            _tempId: Date.now(), // ID temporal para UI
            diente: dienteId,
            zona: tool.tipo === "diente" ? "Completo" : zona,
            tratamiento: tool.label,
            precio: tool.precio,
            estado: "Planificado",
            fecha: new Date().toISOString()
        };

        setPlanTratamiento(prev => [...prev, nuevoItem]);
    };

    const handleGuardarCambios = async () => {
        if (!selectedPatient) return;
        setLoading(true);
        try {
            // 1. Guardar Odontograma Visual
            const odoRef = doc(db, "pacientes", selectedPatient.id, "odontograma", "estado");
            await setDoc(odoRef, {
                data: odontogramaData,
                updatedAt: serverTimestamp()
            });

            // 2. Guardar Tratamientos Nuevos (los que tienen _tempId)
            // Los que ya tienen ID de firebase no se tocan (a menos que editemos estado, pero eso es otra feature)
            const nuevosTratamientos = planTratamiento.filter(t => t._tempId);

            const batchPromises = nuevosTratamientos.map(async (t) => {
                const { _tempId, ...data } = t; // Eliminamos _tempId
                const docRef = await addDoc(collection(db, "pacientes", selectedPatient.id, "tratamientos"), {
                    ...data,
                    creado: serverTimestamp()
                });
                return { ...data, id: docRef.id };
            });

            const savedTratamientos = await Promise.all(batchPromises);

            // Actualizamos estado local quitando _tempId y poniendo ID real
            setPlanTratamiento(prev => {
                const old = prev.filter(t => !t._tempId);
                return [...old, ...savedTratamientos];
            });

            alert("✅ Cambios guardados correctamente.");

        } catch (e) {
            console.error("Error guardando:", e);
            alert("❌ Error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    const handleBorrarTratamiento = async (item) => {
        if (!window.confirm("¿Eliminar este tratamiento?")) return;

        if (item._tempId) {
            // Es local
            setPlanTratamiento(prev => prev.filter(t => t._tempId !== item._tempId));
        } else {
            // Es de firebase
            try {
                await deleteDoc(doc(db, "pacientes", selectedPatient.id, "tratamientos", item.id));
                setPlanTratamiento(prev => prev.filter(t => t.id !== item.id));

                // OJO: Esto no borra el dibujo visual, eso requeriría lógica inversa compleja.
                // Por ahora asumimos que el usuario arregla el visual manualmente "Obturado" -> "Sano" (Blanco)
                // (Sugerencia de mejora futura: botón "Borrador")
            } catch (e) {
                console.error("Error borrando:", e);
            }
        }
    };

    const handleGenerarFactura = async () => {
        if (!selectedPatient) return;
        const itemsParaFacturar = planTratamiento.filter(i => i.precio > 0);

        if (itemsParaFacturar.length === 0) {
            alert("No hay tratamientos con costo para facturar.");
            return;
        }

        if (!window.confirm(`¿Generar factura por $${totalPresupuesto.toLocaleString()}?`)) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "facturas"), {
                pacienteId: selectedPatient.id,
                pacienteNombre: selectedPatient.nombreCompleto,
                fecha: serverTimestamp(),
                monto: totalPresupuesto,
                estado: "Pendiente",
                descripcion: `Odontología: ${itemsParaFacturar.length} tratamientos`,
                items: itemsParaFacturar.map(i => ({
                    diente: i.diente,
                    tratamiento: i.tratamiento,
                    precio: i.precio
                }))
            });
            alert("✅ Factura generada en el módulo de Facturación.");
        } catch (e) {
            console.error(e);
            alert("Error generando factura.");
        } finally {
            setLoading(false);
        }
    };

    const totalPresupuesto = planTratamiento.reduce((acc, item) => acc + item.precio, 0);

    return (
        <div className="oc-split-view" style={{ fontFamily: "Segoe UI, sans-serif" }}>

            {/* COLUMNA IZQUIERDA: Herramientas + Visual */}
            <div className="oc-split-pane-main" style={{ position: "relative" }}>

                {loading && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(255,255,255,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 }}>Cargando...</div>}

                {/* --- SELECTOR DE PACIENTE --- */}
                <div style={{ marginBottom: "20px", position: "relative" }}>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Paciente:</label>
                    {selectedPatient ? (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eef", padding: "10px", borderRadius: "5px" }}>
                            <span style={{ fontSize: "1.1em" }}>👤 <strong>{selectedPatient.nombreCompleto}</strong> - {selectedPatient.nroDocumento}</span>
                            <button onClick={() => setSelectedPatient(null)} style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>Cambiar</button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="🔍 Buscar paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                            />
                            {patientResults.length > 0 && (
                                <ul style={{ position: "absolute", width: "100%", background: "#fff", border: "1px solid #ddd", listStyle: "none", margin: 0, padding: 0, zIndex: 100, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                                    {patientResults.map(p => (
                                        <li
                                            key={p.id}
                                            onClick={() => handleSelectPatient(p)}
                                            style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "0.95em" }}
                                            onMouseOver={(e) => e.target.style.background = "#f0f8ff"}
                                            onMouseOut={(e) => e.target.style.background = "white"}
                                        >
                                            {p.nombreCompleto} <small style={{ color: "gray" }}>({p.nroDocumento})</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>

                {/* --- HERRAMIENTAS --- */}
                <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", opacity: selectedPatient ? 1 : 0.5, pointerEvents: selectedPatient ? "auto" : "none" }}>
                    <strong>Herramientas:</strong>
                    {TRATAMIENTOS.filter(t => t.tipo !== 'general').map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedToolId(tool.id)}
                            style={{
                                padding: "6px 10px",
                                border: selectedToolId === tool.id ? "2px solid #333" : "1px solid #ccc",
                                borderRadius: "5px",
                                background: tool.color,
                                color: "#fff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
                                transform: selectedToolId === tool.id ? "scale(1.05)" : "scale(1)",
                                transition: "0.2s"
                            }}
                        >
                            {tool.label}
                        </button>
                    ))}
                    {/* Herramienta Borrador (Blanco) */}
                    <button
                        onClick={() => setSelectedToolId("borrador")}
                        style={{
                            padding: "6px 10px",
                            border: selectedToolId === "borrador" ? "2px solid #333" : "1px solid #ccc",
                            borderRadius: "5px",
                            background: "white",
                            color: "black",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        🧼 Borrador
                    </button>
                </div>

                {/* --- ODONTOGRAMA VISUAL --- */}
                <div style={{
                    background: "#f9f9f9",
                    padding: "40px",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    opacity: selectedPatient ? 1 : 0.5,
                    pointerEvents: selectedPatient ? "auto" : "none"
                }}>
                    <OdontogramaVisual
                        odontogramaData={odontogramaData}
                        onToothClick={(d, z) => {
                            if (selectedToolId === "borrador") {
                                // Lógica simple de borrado local
                                setOdontogramaData((prev) => {
                                    const dienteData = { ...prev[d] };
                                    if (dienteData[z]) delete dienteData[z];
                                    return { ...prev, [d]: dienteData };
                                });
                            } else {
                                handleToothClick(d, z);
                            }
                        }}
                    />
                </div>
            </div>

            {/* COLUMNA DERECHA: Plan de Tratamiento */}
            <div className="oc-split-pane-side">
                <h2 style={{ borderBottom: "2px solid #0a86d8", paddingBottom: "10px", color: "#0a86d8" }}>Plan de Tratamiento</h2>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {!selectedPatient ? (
                        <p style={{ color: "#aaa", textAlign: "center", marginTop: "20px" }}>Seleccione un paciente para comenzar.</p>
                    ) : planTratamiento.length === 0 ? (
                        <p style={{ color: "#aaa", textAlign: "center", marginTop: "20px" }}>No hay tratamientos agregados.</p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {planTratamiento.map((item, i) => (
                                <li key={item.id || item._tempId || i} style={{
                                    borderBottom: "1px solid #eee",
                                    padding: "10px 0",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <div>
                                        <div style={{ fontWeight: "bold" }}>Diente {item.diente} <span style={{ fontSize: "0.8em", color: "gray" }}>({item.zona})</span></div>
                                        <div style={{ fontSize: "0.9em", color: "#555" }}>{item.tratamiento} ({item.estado})</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: "bold", color: "#0a86d8" }}>
                                            ${item.precio.toLocaleString()}
                                        </div>
                                        <button
                                            onClick={() => handleBorrarTratamiento(item)}
                                            style={{
                                                fontSize: "0.7em",
                                                color: "red",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                textDecoration: "underline"
                                            }}>
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div style={{ marginTop: "20px", borderTop: "2px solid #333", paddingTop: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2em", fontWeight: "bold" }}>
                        <span>Total Presupuesto:</span>
                        <span>${totalPresupuesto.toLocaleString()}</span>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button
                            onClick={handleGuardarCambios}
                            disabled={!selectedPatient || loading}
                            style={{
                                flex: 1,
                                padding: "15px",
                                background: selectedPatient ? "#2ecc71" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: selectedPatient ? "pointer" : "not-allowed"
                            }}>
                            Guardar Cambios
                        </button>
                        <button
                            onClick={handleGenerarFactura}
                            disabled={!selectedPatient || loading}
                            style={{
                                flex: 1,
                                padding: "15px",
                                background: selectedPatient ? "#0a86d8" : "#ccc",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: selectedPatient ? "pointer" : "not-allowed"
                            }}>
                            🧾 Facturar
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

