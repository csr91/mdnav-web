import { NextRequest, NextResponse } from "next/server";

const PAGO24_PROXY_URL = "https://pago24.com.ar/api/proxy";
const PAGO24_TARGET_URL = "https://mt-cm01-prd.paytec.com.ar/giftcards/balance";

interface Pago24Balance {
  status: boolean;
  message: string;
  balance: {
    availablePurchase: number;
    availableAdvance: number;
    availableDollarPurchase: number;
    availableDollarAdvance: number;
    balancePeso: number;
    balanceDollar: number;
  };
}

interface TrebleWebhookEvent {
  // TODO: confirmar contra el payload real de Treble.
  // Estos son los campos que necesitamos: el número de tarjeta capturado
  // como variable, y el identificador de conversación/contacto para responder.
  contact_id?: string;
  conversation_id?: string;
  variables?: {
    nro_tarjeta?: string;
  };
}

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function isFromTreble(request: NextRequest) {
  const secret = process.env.TREBLE_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }

  const candidate = request.headers.get("x-treble-secret");
  return candidate === secret;
}

async function fetchPago24Balance(cardNumber: string): Promise<Pago24Balance> {
  const url = `${PAGO24_PROXY_URL}?url=${encodeURIComponent(PAGO24_TARGET_URL)}&authRequired=false`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardNumber })
  });

  if (!response.ok) {
    throw new Error(`pago24 respondió ${response.status}`);
  }

  return response.json();
}

async function replyToTreble(conversationId: string, text: string) {
  // TODO: confirmar contra la Messages API real de Treble
  // (URL, auth header, y el nombre del campo destinatario).
  const url = process.env.TREBLE_SEND_MESSAGE_URL;
  const apiKey = process.env.TREBLE_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Falta configurar TREBLE_SEND_MESSAGE_URL / TREBLE_API_KEY");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      text
    })
  });

  if (!response.ok) {
    throw new Error(`Treble Messages API respondió ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  if (!isFromTreble(request)) {
    return unauthorized();
  }

  const rawBody = await request.text();
  // TODO: sacar este log una vez que confirmemos el shape real del payload de Treble.
  console.log("[treble-webhook] raw payload:", rawBody);

  let event: TrebleWebhookEvent;
  try {
    event = JSON.parse(rawBody) as TrebleWebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const cardNumber = event.variables?.nro_tarjeta;
  const conversationId = event.conversation_id ?? event.contact_id;

  if (!cardNumber || !conversationId) {
    return NextResponse.json({ ok: true, note: "logged_only_missing_fields" });
  }

  const { balance } = await fetchPago24Balance(cardNumber);
  await replyToTreble(conversationId, `Tu saldo es $${balance.balancePeso}`);

  return NextResponse.json({ ok: true });
}
