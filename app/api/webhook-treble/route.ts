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
  // Shape real confirmado en logs de Vercel el 2026-09-08.
  country_code?: string;
  cellphone?: string;
  business_scope_id?: string;
  conversation_id?: number;
  session_id?: string;
  user_session_keys?: Array<{ key: string; value: string; type: string | null }>;
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

async function updateTrebleSession(sessionId: string, key: string, value: string) {
  // Doc: https://help.treble.ai/es/api-reference/endpoints/session-update
  // Esto no "envía un mensaje" — actualiza una variable de sesión y Treble
  // continúa el flujo, que debe tener un bloque de mensaje mostrando {{key}}.
  const apiKey = process.env.TREBLE_API_KEY;

  if (!apiKey) {
    throw new Error("Falta configurar TREBLE_API_KEY");
  }

  const response = await fetch(`https://main.treble.ai/session/${sessionId}/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey
    },
    body: JSON.stringify({
      user_session_keys: [{ key, value }]
    })
  });

  if (!response.ok) {
    throw new Error(`Treble session-update respondió ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  if (!isFromTreble(request)) {
    return unauthorized();
  }

  const rawBody = await request.text();
  console.log("[treble-webhook] raw payload:", rawBody);

  let event: TrebleWebhookEvent;
  try {
    event = JSON.parse(rawBody) as TrebleWebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const cardNumber = event.user_session_keys?.find((k) => k.key === "nro_tarjeta")?.value;
  const sessionId = event.session_id;
  console.log("[treble-webhook] extracted:", { cardNumber, sessionId });

  if (!cardNumber || !sessionId) {
    return NextResponse.json({ ok: true, note: "missing_fields" });
  }

  const { balance } = await fetchPago24Balance(cardNumber);
  await updateTrebleSession(sessionId, "saldo", String(balance.balancePeso));

  return NextResponse.json({ ok: true });
}
