/**
 * WhatsAppService.js
 * Servicio para envío de mensajes automáticos (Confirmaciones, Recordatorios).
 */

export const sendConfirmation = async (cita) => {
    // Simulación de envío
    await new Promise(resolve => setTimeout(resolve, 1500));

    const phone = cita.celularPaciente || cita.telefono || "573000000000";

    // Validar número
    if (phone.length < 10) throw new Error("Número de celular inválido");

    const message = `Hola ${cita.pacienteNombre}, confirmamos tu cita odontológica para el ${cita.fecha} a las ${cita.horaInicio}. Responde SI para confirmar. - OdontoCloud`;

    console.log("Enviando WhatsApp a:", phone, message);

    // En producción: fetch('https://graph.facebook.com/v17.0/PHONE_ID/messages', ...)

    return {
        success: true,
        message: "Mensaje enviado a " + phone,
        timestamp: new Date().toISOString()
    };
};
