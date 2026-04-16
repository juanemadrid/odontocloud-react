/**
 * AutomationService.js
 * Centralized service to dispatch events to n8n webhooks or other automation platforms.
 */

// In production, this would typically come from environment variables or tenant settings in Firestore
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";

/**
 * Dispatches an event to the configured automation webhook.
 * @param {string} eventName - Type of event (e.g., 'APPOINTMENT_CREATED')
 * @param {Object} payload - Data associated with the event
 */
export const dispatchAutomationEvent = async (eventName, payload) => {
    if (!N8N_WEBHOOK_URL) {
        console.warn(`[AutomationService] No webhook URL configured. Event ${eventName} skipped.`);
        return { success: false, reason: "missing_webhook_url" };
    }

    try {
        console.log(`[AutomationService] Dispatching ${eventName}...`);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventName,
                timestamp: new Date().toISOString(),
                data: payload
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { success: true };
    } catch (error) {
        console.error(`[AutomationService] Error dispatching ${eventName}:`, error);
        return { success: false, error: error.message };
    }
};
