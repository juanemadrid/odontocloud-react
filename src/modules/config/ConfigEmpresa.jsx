import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FiSave, FiUpload, FiImage, FiMapPin, FiPhone, FiMail, FiBriefcase, FiFileText, FiGlobe } from "react-icons/fi";
import Input from "../../components/ui/Input";
import { uploadImage } from "../../services/FirebaseStorageService";

export default function ConfigEmpresa() {
    const { userProfile } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nit: "",
        razonSocial: "",
        nombreComercial: "",
        direccion: "",
        telefono: "",
        celular: "",
        email: "",
        website: "",
        agendamientoUrl: "",
        regimen: "Responsable de IVA",
        moneda: "COP",
        zonaHoraria: "America/Bogota",
        cuentaContable: "",
        esIps: false,
        sisproUsuario: "",
        sisproTipoDoc: "CC",
        sisproPassword: "",
        codigoPrestador: "",
        logoUrl: "", // En el futuro se puede integrar con upload real
        ciudad: "",
        codigoPostal: ""
    });

    useEffect(() => {
        if (userProfile?.inquilino) {
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
                setFormData(prev => ({
                    ...prev,
                    nit: data.nit || "",
                    razonSocial: data.razonSocial || "",
                    nombreComercial: data.name || data.nombreComercial || "",
                    direccion: data.address || data.direccion || "",
                    telefono: data.phone || data.telefono || "",
                    celular: data.celular || "",
                    email: data.email || "",
                    website: data.website || "",
                    agendamientoUrl: data.agendamientoUrl || "",
                    regimen: data.regimen || "Responsable de IVA",
                    moneda: data.moneda || "COP",
                    zonaHoraria: data.zonaHoraria || "America/Bogota",
                    cuentaContable: data.cuentaContable || "",
                    esIps: data.esIps || false,
                    sisproUsuario: data.sisproUsuario || "",
                    sisproTipoDoc: data.sisproTipoDoc || "CC",
                    sisproPassword: data.sisproPassword || "",
                    codigoPrestador: data.codigoPrestador || "",
                    logoUrl: data.logo || "",
                    ciudad: data.ciudad || "",
                    codigoPostal: data.codigoPostal || ""
                }));
            }
        } catch (error) {
            console.error("Error cargando datos de empresa:", error);
            toast.error("Error al cargar información");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docRef = doc(db, "tenants", userProfile.inquilino);
            await setDoc(docRef, {
                ...formData, // Actualizamos campos planos
                name: formData.nombreComercial, // Mantener compatibilidad con campo 'name' existente
                address: formData.direccion,
                phone: formData.telefono,
                logo: formData.logoUrl,
                updatedAt: serverTimestamp(),
                updatedBy: userProfile.uid
            }, { merge: true });

            toast.success("Información de empresa actualizada");
        } catch (error) {
            console.error("Error guardando empresa:", error);
            toast.error("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    // Carga de logo real
    const handleLogoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error("Por favor seleccione una imagen (JPG, PNG o WEBP)");
            return;
        }

        // Validar tamaño (máx 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen es demasiado grande (máximo 2MB)");
            return;
        }

        setUploading(true);
        try {
            const logoPath = `tenants/${userProfile.inquilino}/logo_${Date.now()}`;
            const downloadUrl = await uploadImage(file, logoPath);
            setFormData(prev => ({ ...prev, logoUrl: downloadUrl }));
            toast.success("Logo cargado temporalmente. Guarde cambios para confirmar.");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cargando empresa...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32">

            {/* Header */}
            <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-200">
                    <FiBriefcase size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Datos Básicos</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Información legal y contacto de la clínica</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />

                {/* Logo y Nombre Principal */}
                <div className="bg-white rounded-[40px] border border-slate-200/50 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group cursor-pointer" onClick={handleLogoClick}>
                        <div className="w-40 h-40 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:bg-blue-50 relative">
                            {uploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Subiendo...</span>
                                </div>
                            ) : formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <FiImage size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sin Logo</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
                            <FiUpload size={18} />
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Comercial</label>
                            <Input
                                value={formData.nombreComercial}
                                onChange={e => setFormData({ ...formData, nombreComercial: e.target.value })}
                                placeholder="Ej. OdontoCloud Dental Spa"
                                className="h-16 text-xl font-bold bg-slate-50 border-slate-100 focus:border-blue-500 rounded-2xl px-6"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">NIT / Identificación</label>
                                <Input
                                    value={formData.nit}
                                    onChange={e => setFormData({ ...formData, nit: e.target.value })}
                                    placeholder="Ej. 900.123.456-7"
                                    className="h-14 font-bold bg-slate-50 border-slate-100 rounded-2xl px-5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Razón Social</label>
                                <Input
                                    value={formData.razonSocial}
                                    onChange={e => setFormData({ ...formData, razonSocial: e.target.value })}
                                    placeholder="Ej. Servicios Odontológicos SAS"
                                    className="h-14 font-bold bg-slate-50 border-slate-100 rounded-2xl px-5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalles de Contacto y Ubicación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Tarjeta Contacto */}
                    <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <FiPhone size={20} />
                            </div>
                            <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Contacto</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Fijo</label>
                                <Input
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Celular / WhatsApp</label>
                                <Input
                                    value={formData.celular}
                                    onChange={e => setFormData({ ...formData, celular: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sitio Web</label>
                                <Input
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta Ubicación y Legal */}
                    <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FiMapPin size={20} />
                            </div>
                            <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Ubicación y Legal</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Principal</label>
                                <Input
                                    value={formData.direccion}
                                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad</label>
                                    <Input
                                        value={formData.ciudad}
                                        onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Régimen</label>
                                    <select
                                        value={formData.regimen}
                                        onChange={e => setFormData({ ...formData, regimen: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                    >
                                        <option value="Responsable de IVA">Responsable de IVA</option>
                                        <option value="No Responsable de IVA">No Responsable de IVA</option>
                                        <option value="Régimen Simple">Régimen Simple</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moneda</label>
                                    <select
                                        value={formData.moneda}
                                        onChange={e => setFormData({ ...formData, moneda: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                    >
                                        <option value="COP">Pesos colombianos (COP)</option>
                                        <option value="USD">Dólares (USD)</option>
                                        <option value="EUR">Euros (EUR)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zona Horaria</label>
                                    <select
                                        value={formData.zonaHoraria}
                                        onChange={e => setFormData({ ...formData, zonaHoraria: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                    >
                                        <option value="America/Bogota">Hora de Colombia</option>
                                        <option value="America/Mexico_City">Hora de México</option>
                                        <option value="America/New_York">Hora del Este (ET)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuración Adicional (Full Width) */}
                <div className="w-full bg-white rounded-[32px] border border-slate-200/50 shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <FiFileText size={20} />
                        </div>
                        <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Configuración Adicional y SISPRO</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agendamiento Online</label>
                                <Input
                                    value={formData.agendamientoUrl}
                                    onChange={e => setFormData({ ...formData, agendamientoUrl: e.target.value })}
                                    placeholder="URL para agendamiento externo"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cuenta Contable</label>
                                <Input
                                    value={formData.cuentaContable}
                                    onChange={e => setFormData({ ...formData, cuentaContable: e.target.value })}
                                    placeholder="Buscar Item..."
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[12px] font-bold text-slate-600">¿Es una institución prestadora de salud (IPS)?</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.esIps}
                                        onChange={(e) => setFormData(prev => ({ ...prev, esIps: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario SISPRO</label>
                                <Input
                                    value={formData.sisproUsuario}
                                    onChange={e => setFormData({ ...formData, sisproUsuario: e.target.value })}
                                    placeholder="Número de documento"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo Documento SISPRO</label>
                                <select
                                    value={formData.sisproTipoDoc}
                                    onChange={e => setFormData({ ...formData, sisproTipoDoc: e.target.value })}
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-600 text-sm outline-none focus:border-blue-500 transition-all"
                                >
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="NIT">NIT</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña SISPRO</label>
                                <Input
                                    type="password"
                                    value={formData.sisproPassword}
                                    onChange={e => setFormData({ ...formData, sisproPassword: e.target.value })}
                                    placeholder="**********"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de Prestador</label>
                                <Input
                                    value={formData.codigoPrestador}
                                    onChange={e => setFormData({ ...formData, codigoPrestador: e.target.value })}
                                    placeholder="Ej. 7000189557"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Save Button */}
                <div className="fixed bottom-10 right-10 z-50">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] text-[13px] font-black uppercase tracking-widest flex items-center gap-3 shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition-all active:scale-95 hover:-translate-y-1"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FiSave size={20} />
                        )}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>

            </form>
        </div>
    );
}
