import { NextRequest, NextResponse } from "next/server";

import { peekDiagram, putDiagram, sanitizeHash, type DiagramRecordInput } from "@/lib/storage";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function hasWriteAccess(request: NextRequest) {
  const secret = process.env.MDNAV_WEB_WRITE_TOKEN;
  if (!secret) {
    return true;
  }

  const candidate = request.headers.get("x-mdnav-token");
  return candidate === secret;
}

export async function GET(_: NextRequest, context: { params: Promise<{ hash: string }> }) {
  if (!hasWriteAccess(_)) {
    return unauthorized();
  }

  const { hash } = await context.params;
  const safeHash = sanitizeHash(hash);
  const record = await peekDiagram(safeHash);

  if (!record) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function POST(request: NextRequest, context: { params: Promise<{ hash: string }> }) {
  if (!hasWriteAccess(request)) {
    return unauthorized();
  }

  const { hash } = await context.params;
  const safeHash = sanitizeHash(hash);

  let body: DiagramRecordInput;
  try {
    body = (await request.json()) as DiagramRecordInput;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body?.mermaid?.trim() && !body?.html?.trim()) {
    return NextResponse.json({ error: "missing_payload" }, { status: 400 });
  }

  const stored = await putDiagram(safeHash, body);
  return NextResponse.json({
    ok: true,
    hash: safeHash,
    url: `${request.nextUrl.origin}/${safeHash}`,
    diagram: stored
  });
}
