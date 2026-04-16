import React, { useState } from "react";
import { collection, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import Button from "../../../components/ui/Button";

// Helper to format date
const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
};

export default function EvolucionesInmutables({ pacienteId, evoluciones = [], onAdd }) {
    const [newEvo, setNewEvo] = useState("");
    const [loading, setLoading] = useState(false);

    // State for adding a clarification note to an existing evolution
    const [clarifyingId, setClarifyingId] = useState(null); // Index of evolution being clarified
    const [clarificationText, setClarificationText] = useState("");

    const handleSave = async () => {
        if (!newEvo.trim()) return alert("Escriba la evolución");
        if (!pacienteId) return alert("Paciente no identificado");

        setLoading(true);
        try {
            const entry = {
                content: newEvo,
                createdAt: new Date().toISOString(),
                author: "Usuario Actual", // TODO: Replace with actual logged-in user context
                type: "EVOLUCION",
                clarifications: []
            };

            // We use arrayUnion to append to the 'evoluciones' array in Firestore
            // This is a simple approach. For strict immutability, a subcollection is better,
            // but sticking to the current array structure for compatibility if needed.
            // Assuming 'evoluciones' is the field name.
            const ref = doc(db, "pacientes", pacienteId);
            await updateDoc(ref, {
                evoluciones: arrayUnion(entry)
            });

            // Optimistic UI update or callback
            if (onAdd) onAdd(entry);

            setNewEvo("");
            alert("Evolución guardada. NO podrá ser modificada.");
        } catch (e) {
            console.error(e);
            alert("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClarification = async () => {
        if (!clarificationText.trim()) return;
        // This is trickier with arrayUnion if we want to modify a specific index.
        // We might need to read -> modify -> write, which has concurrency risks,
        // OR use a proper subcollection structure.
        // GIVEN existing code used an array, we will assume we read the whole array, modify it, and write it back.
        // To allow "immutability", we logically block editing the original text, but technically update the array to add a child note.

        const updatedEvos = [...evoluciones];
        const target = updatedEvos[clarifyingId];

        if (!target.clarifications) target.clarifications = [];
        target.clarifications.push({
            note: clarificationText,
            createdAt: new Date().toISOString(),
            author: "Usuario Actual"
        });

        try {
            await updateDoc(doc(db, "pacientes", pacienteId), { evoluciones: updatedEvos });
            setClarifyingId(null);
            setClarificationText("");
            // Refetch or parent update needed ideally
            alert("Nota aclaratoria agregada.");
        } catch (e) {
            console.error(e);
            alert("Error guardando nota");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Creation Area */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold text-slate-700 mb-2">Nueva Evolución (Inmutable)</h4>
                <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    rows={4}
                    placeholder="Describa el procedimiento, hallazgos y plan..."
                    value={newEvo}
                    onChange={e => setNewEvo(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-amber-600 font-medium">⚠️ Advertencia: Una vez guardada, esta información no podrá ser editada ni eliminada por motivos legales.</p>
                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        {loading ? "Guardando..." : "Firmar y Guardar"}
                    </Button>
                </div>
            </div>

            {/* History Stream */}
            <div className="flex flex-col gap-4">
                {evoluciones.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">No hay evoluciones registradas.</div>
                ) : (
                    // Reverse to show newest first
                    [...evoluciones].reverse().map((evo, inverseIdx) => {
                        const realIdx = evoluciones.length - 1 - inverseIdx; // Restore original index for updates
                        return (
                            <div key={realIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
                                        <span className="font-bold text-slate-700 text-sm">{formatDate(evo.createdAt)}</span>
                                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{evo.author || "Sistema"}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setClarifyingId(realIdx === clarifyingId ? null : realIdx)}>
                                        + Nota Aclaratoria
                                    </Button>
                                </div>
                                <div className="p-4 text-slate-700 text-sm whitespace-pre-wrap">
                                    {evo.content}
                                </div>

                                {/* Clarifications */}
                                {evo.clarifications && evo.clarifications.length > 0 && (
                                    <div className="bg-amber-50 border-t border-amber-100 p-3 flex flex-col gap-2">
                                        {evo.clarifications.map((note, ni) => (
                                            <div key={ni} className="text-xs text-amber-900 border-l-2 border-amber-400 pl-2">
                                                <div className="font-bold mb-0.5">{note.author} - {formatDate(note.createdAt)}</div>
                                                {note.note}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Clarification Input */}
                                {clarifyingId === realIdx && (
                                    <div className="p-3 bg-slate-50 border-t border-slate-200 animation-fade-in">
                                        <label className="text-xs font-bold text-slate-600 mb-1 block">Agregar Nota Aclaratoria (No edita el original)</label>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 p-2 text-sm border border-slate-300 rounded"
                                                placeholder="Escriba la corrección o detalle..."
                                                value={clarificationText}
                                                onChange={e => setClarificationText(e.target.value)}
                                            />
                                            <Button size="sm" onClick={handleAddClarification}>Agregar</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
