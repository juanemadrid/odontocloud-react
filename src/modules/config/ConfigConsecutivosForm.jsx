
import React, { useState, useEffect } from "react";
import { FiSave, FiX, FiCheck } from "react-icons/fi";
import Input from "../../components/ui/Input";

export default function ConfigConsecutivosForm({ onClose, initialData = null }) {
    const [formData, setFormData] = useState({
        nombre: "",
        contReciboCaja: 0,
        contNotaCredito: 0,
        contNotaDebito: 0,
        contEgresos: 0,
        contPresupuestos: 0,
        contPlanTratamiento: 0,
        contOrdenesCompra: 0,
        contCuentasPorCobrar: 0,
        contUsoSaldoFavor: 0,
        contUsoNotasCredito: 0,
        contRipsAutomaticos: 0,
        numRips: 0,
        datosManuales: false,
        facturaCompra: false,
        facturaVenta: false,
        facturacionElectronica: false,
        // Manual Info Fields
        manualNombre: "",
        manualPais: "",
        manualCiudad: "",
        manualTipoDoc: "",
        manualNumDoc: "",
        manualTipoPersona: "",
        manualTelefono: "",
        manualEmail: "",
        manualWebsite: "",
        manualDireccion: "",
        manualCodigoPostal: "",

        // Documento Soporte Fields
        docSoporteElectronico: false,
        dsReferencia: "Resolucion propia",
        dsNumFormulario: "",
        dsNombre: "",
        dsPrefijoDoc: "",
        dsPrefijoNota: "",
        dsNumActual: 0,
        dsNumInicial: 0,
        dsNumFinal: 0,
        dsFechaInicio: "",
        dsFechaFinal: "",
        dsTextoResolucion: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Saving consecutivo:", formData);
        // Here you would call an API/Firebase to save
        onClose();
    };

    const ToggleSwitch = ({ label, checked, onChange }) => (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
            </label>
        </div>
    );

    return (
        <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {initialData ? "Editar Consecutivo" : "Nuevo Consecutivo"}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Configura los contadores de documentos
                    </p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-all">
                    <FiX size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4 max-w-3xl mx-auto">

                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre *</label>
                        <Input
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Nombre del consecutivo"
                            className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-700"
                            required
                        />
                    </div>

                    {/* Contadores Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {[
                            { label: "Cont. Recibo de caja", key: "contReciboCaja" },
                            { label: "Cont. Nota crédito", key: "contNotaCredito" },
                            { label: "Cont. Nota débito", key: "contNotaDebito" },
                            { label: "Cont. Egresos", key: "contEgresos" },
                            { label: "Cont. Presupuestos", key: "contPresupuestos" },
                            { label: "Cont. Plan de tratamiento", key: "contPlanTratamiento" },
                            { label: "Cont. Órdenes de compra", key: "contOrdenesCompra" },
                            { label: "Cont. Cuentas por cobrar", key: "contCuentasPorCobrar" },
                            { label: "Cont. Uso saldo a favor", key: "contUsoSaldoFavor" },
                            { label: "Cont. Uso notas crédito", key: "contUsoNotasCredito" },
                            { label: "Cont. RIPS automáticos", key: "contRipsAutomaticos" },
                            { label: "Num. RIPS (Res 2275)", key: "numRips" },
                        ].map((field) => (
                            <div key={field.key} className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                <Input
                                    type="number"
                                    value={formData[field.key]}
                                    onChange={(e) => setFormData({ ...formData, [field.key]: parseInt(e.target.value) || 0 })}
                                    className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3 pt-6">
                        <ToggleSwitch
                            label="¿Datos manuales consecutivo?"
                            checked={formData.datosManuales}
                            onChange={(val) => setFormData({ ...formData, datosManuales: val })}
                        />
                        <ToggleSwitch
                            label="Factura de compra"
                            checked={formData.facturaCompra}
                            onChange={(val) => {
                                setFormData(prev => ({
                                    ...prev,
                                    facturaCompra: val,
                                    // Auto-activate docSoporte if activating compra
                                    docSoporteElectronico: val ? true : prev.docSoporteElectronico
                                }));
                            }}
                        />

                        {/* Conditional Toggle: Documento soporte electrónico */}
                        {formData.facturaCompra && (
                            <ToggleSwitch
                                label="Documento soporte electrónico"
                                checked={formData.docSoporteElectronico}
                                onChange={(val) => setFormData({ ...formData, docSoporteElectronico: val })}
                            />
                        )}

                        <ToggleSwitch
                            label="Factura de venta"
                            checked={formData.facturaVenta}
                            onChange={(val) => setFormData({ ...formData, facturaVenta: val })}
                        />
                        <ToggleSwitch
                            label="Facturación electrónica"
                            checked={formData.facturacionElectronica}
                            onChange={(val) => setFormData({ ...formData, facturacionElectronica: val })}
                        />
                    </div>

                    {/* Documento Soporte DIAN (Condicional) */}
                    {formData.docSoporteElectronico && (
                        <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Documento soporte Dian</h3>

                            <div className="space-y-4">
                                {/* Consecutivo de referencia */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consecutivo de referencia</label>
                                    <select
                                        value={formData.dsReferencia}
                                        onChange={(e) => setFormData({ ...formData, dsReferencia: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                    >
                                        <option value="Resolucion propia">Resolución propia</option>
                                        <option value="Facturacion electronica">Facturación electrónica</option>
                                    </select>
                                </div>

                                {/* Número formulario */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número formulario</label>
                                    <div className="relative">
                                        <Input
                                            value={formData.dsNumFormulario}
                                            onChange={(e) => setFormData({ ...formData, dsNumFormulario: e.target.value })}
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600 pr-12"
                                        />
                                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-lime-500 text-white rounded-lg flex items-center justify-center shadow-md shadow-lime-200">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Nombre Resolución */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre *</label>
                                    <Input
                                        value={formData.dsNombre}
                                        onChange={(e) => setFormData({ ...formData, dsNombre: e.target.value })}
                                        placeholder="Nombre resolución de facturación"
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>

                                {/* Prefijos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prefijo documento soporte</label>
                                        <Input
                                            value={formData.dsPrefijoDoc}
                                            onChange={(e) => setFormData({ ...formData, dsPrefijoDoc: e.target.value })}
                                            placeholder="Pref. resolución"
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prefijo nota de ajuste</label>
                                        <Input
                                            value={formData.dsPrefijoNota}
                                            onChange={(e) => setFormData({ ...formData, dsPrefijoNota: e.target.value })}
                                            placeholder="Prefijo nota de ajuste"
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                        />
                                    </div>
                                </div>

                                {/* Rangos */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número actual ⓘ</label>
                                    <Input
                                        type="number"
                                        value={formData.dsNumActual}
                                        onChange={(e) => setFormData({ ...formData, dsNumActual: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número Inicial *</label>
                                    <Input
                                        type="number"
                                        value={formData.dsNumInicial}
                                        onChange={(e) => setFormData({ ...formData, dsNumInicial: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número Final</label>
                                    <Input
                                        type="number"
                                        value={formData.dsNumFinal}
                                        onChange={(e) => setFormData({ ...formData, dsNumFinal: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>

                                {/* Fechas */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de inicio de la autorización</label>
                                    <Input
                                        type="date"
                                        value={formData.dsFechaInicio}
                                        onChange={(e) => setFormData({ ...formData, dsFechaInicio: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de final de la autorización</label>
                                    <Input
                                        type="date"
                                        value={formData.dsFechaFinal}
                                        onChange={(e) => setFormData({ ...formData, dsFechaFinal: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>

                                {/* Texto Resolución */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto resolución *</label>
                                    <textarea
                                        value={formData.dsTextoResolucion}
                                        onChange={(e) => setFormData({ ...formData, dsTextoResolucion: e.target.value })}
                                        placeholder="Ingrese la resolución"
                                        className="w-full h-24 bg-slate-50 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información Manual (Condicional) */}
                    {formData.datosManuales && (
                        <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Información Manual</h3>

                            <div className="space-y-4">
                                {/* Nombre */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre *</label>
                                    <Input
                                        value={formData.manualNombre}
                                        onChange={(e) => setFormData({ ...formData, manualNombre: e.target.value })}
                                        placeholder="Nombre"
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-700"
                                    />
                                </div>

                                {/* País y Ciudad */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">País *</label>
                                        <select
                                            value={formData.manualPais}
                                            onChange={(e) => setFormData({ ...formData, manualPais: e.target.value })}
                                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="Colombia">Colombia</option>
                                            {/* Add more countries if needed */}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad de domicilio *</label>
                                        <select
                                            value={formData.manualCiudad}
                                            onChange={(e) => setFormData({ ...formData, manualCiudad: e.target.value })}
                                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="Bogota">Bogotá</option>
                                            <option value="Medellin">Medellín</option>
                                            <option value="Cali">Cali</option>
                                            {/* Add more cities if needed */}
                                        </select>
                                    </div>
                                </div>

                                {/* Doc Type and Number */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo documento *</label>
                                        <select
                                            value={formData.manualTipoDoc}
                                            onChange={(e) => setFormData({ ...formData, manualTipoDoc: e.target.value })}
                                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="CC">Cédula de Ciudadanía</option>
                                            <option value="NIT">NIT</option>
                                            <option value="CE">Cédula de Extranjería</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de documento *</label>
                                        <Input
                                            value={formData.manualNumDoc}
                                            onChange={(e) => setFormData({ ...formData, manualNumDoc: e.target.value })}
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                        />
                                    </div>
                                </div>

                                {/* Person Type */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de persona *</label>
                                    <select
                                        value={formData.manualTipoPersona}
                                        onChange={(e) => setFormData({ ...formData, manualTipoPersona: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Natural">Natural</option>
                                        <option value="Juridica">Jurídica</option>
                                    </select>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono fijo *</label>
                                    <Input
                                        value={formData.manualTelefono}
                                        onChange={(e) => setFormData({ ...formData, manualTelefono: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo electrónico *</label>
                                    <Input
                                        value={formData.manualEmail}
                                        onChange={(e) => setFormData({ ...formData, manualEmail: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sitio web</label>
                                    <Input
                                        value={formData.manualWebsite}
                                        onChange={(e) => setFormData({ ...formData, manualWebsite: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección *</label>
                                    <Input
                                        value={formData.manualDireccion}
                                        onChange={(e) => setFormData({ ...formData, manualDireccion: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Codigo postal *</label>
                                    <Input
                                        value={formData.manualCodigoPostal}
                                        onChange={(e) => setFormData({ ...formData, manualCodigoPostal: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4 sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 -mx-8 -mb-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider text-xs"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-lime-200 transition-all active:scale-95"
                    >
                        <FiSave size={18} />
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
}
