type SendEventRegistrationTemplateInput = {
  to: unknown;
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  location: string;
};

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v22.0";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_TEMPLATE_NAME =
  process.env.WHATSAPP_TEMPLATE_NAME || "event_details_reminder_1";
const WHATSAPP_TEMPLATE_LANGUAGE =
  process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";

const getWhatsAppUrl = () => {
  return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
};

const extractPhoneValue = (phone: unknown): string => {
  if (typeof phone === "string") {
    return phone;
  }

  if (phone && typeof phone === "object" && "phone" in phone) {
    const nestedPhone = (phone as { phone?: unknown }).phone;
    return typeof nestedPhone === "string" ? nestedPhone : "";
  }

  return "";
};

const normalizePhone = (phone: unknown) => {
  return extractPhoneValue(phone).replace(/[^\d]/g, "");
};

export const isWhatsAppConfigured = () => {
  return Boolean(WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_TOKEN);
};

export const sendEventRegistrationTemplate = async (
  input: SendEventRegistrationTemplateInput
) => {
  if (!isWhatsAppConfigured()) {
    return { sent: false, reason: "WhatsApp no configurado" };
  }

  const to = normalizePhone(input.to);

  if (!to) {
    return { sent: false, reason: "Telefono invalido" };
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: {
        code: WHATSAPP_TEMPLATE_LANGUAGE,
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: input.attendeeName },
            { type: "text", text: input.eventTitle },
            { type: "text", text: input.eventDate },
            { type: "text", text: input.location },
          ],
        },
      ],
    },
  };

  console.log("Enviando WhatsApp con payload:", payload);

  const response = await fetch(getWhatsAppUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return { sent: true, data };
};