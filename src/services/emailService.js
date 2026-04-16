import emailjs from '@emailjs/browser';

// ⚠️ IMPORTANT: Replace these with your actual EmailJS keys
// You can get them from https://dashboard.emailjs.com/
const SERVICE_ID = 'service_eutjmxs';
const TEMPLATE_ID = 'template_0weh3nm';
const PUBLIC_KEY = 'IBVjEWC0W6IPvZ4gf';

/**
 * Sends an appointment confirmation email.
 * @param {Object} appointmentData - The appointment details
 * @param {Object} patientData - The patient details (name, email)
 */
export const sendAppointmentEmail = async (appointmentData, patientData) => {
    // Check if keys are still placeholders
    if (SERVICE_ID.includes('YOUR_') || TEMPLATE_ID.includes('YOUR_') || PUBLIC_KEY.includes('YOUR_')) {
        console.warn("⚠️ EmailJS has not been configured yet.");
        alert("⚠️ FALTA CONFIGURACIÓN DE CORREO ⚠️\n\nPara que los correos funcionen, necesitas crear una cuenta gratuita en EmailJS.com y poner tus llaves en src/services/emailService.js");
        return false;
    }

    if (!patientData.email) {
        console.warn("No email provided for patient, skipping notification.");
        return false;
    }

    try {
        const templateParams = {
            to_name: patientData.nombre,
            to_email: patientData.email,
            doctor_name: appointmentData.doctorName,
            date: new Date(appointmentData.start).toLocaleDateString(),
            time: new Date(appointmentData.start).toLocaleTimeString(),
            consultorio: appointmentData.consultorioName,
            message: appointmentData.comentario || "Sin comentarios adicionales."
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        console.log('SUCCESS!', response.status, response.text);
        return true;

    } catch (err) {
        console.error('FAILED...', err);
        return false;
    }
};
