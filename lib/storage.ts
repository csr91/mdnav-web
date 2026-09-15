import { Collection, Db, Document, MongoClient } from "mongodb";
import "server-only";

export type ShareKind = "mermaid" | "html" | "text" | "log" | "csv" | "json" | "diff";

const MAX_CONTENT_LENGTH = 1_000_000;

export type DiagramRecord = {
  hash: string;
  kind: ShareKind;
  content: string;
  title?: string;
  description?: string;
  filename?: string;
  createdAt: string;
  expiresAt: string;
};

type DiagramDocument = {
  hash: string;
  kind: ShareKind;
  content: string;
  title?: string;
  description?: string;
  filename?: string;
  createdAt: Date;
  expiresAt: Date;
} & Document;

export type DiagramRecordInput = {
  kind?: ShareKind;
  content?: string;
  // Legacy fields, kept for CLIs older than the generalized share endpoint.
  mermaid?: string;
  html?: string;
  title?: string;
  description?: string;
  filename?: string;
  ttlSeconds?: number;
};

let clientPromise: Promise<MongoClient> | null = null;
let collectionPromise: Promise<Collection<DiagramDocument>> | null = null;

export function sanitizeHash(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 120);
}

export function mongoEnabled() {
  return Boolean(process.env.MONGO_URI);
}

function databaseName() {
  return process.env.MONGO_DB_NAME || "mdnav";
}

async function getClient() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGO_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(databaseName());
}

async function getCollection() {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const db = await getDb();
      const collection = db.collection<DiagramDocument>("shares");
      await collection.createIndex({ hash: 1 }, { unique: true });
      await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      return collection;
    })();
  }

  return collectionPromise;
}

function resolveExpiration(ttlSeconds?: number) {
  const bounded = Math.min(Math.max(ttlSeconds ?? 3600, 60), 60 * 60 * 24 * 7);
  return new Date(Date.now() + bounded * 1000);
}

/**
 * Normalizes the request body into a {kind, content} pair. Accepts the
 * generalized shape directly, and falls back to the legacy mermaid/html
 * fields for CLIs built before the share endpoint was generalized.
 */
export function normalizeShareInput(
  input: DiagramRecordInput
): { kind: ShareKind; content: string } | null {
  if (input.kind && input.content?.trim()) {
    return { kind: input.kind, content: input.content };
  }
  if (input.html?.trim()) {
    return { kind: "html", content: input.html };
  }
  if (input.mermaid?.trim()) {
    return { kind: "mermaid", content: input.mermaid };
  }
  return null;
}

export async function peekDiagram(hash: string): Promise<DiagramRecord | null> {
  const safeHash = sanitizeHash(hash);
  if (!safeHash) {
    return null;
  }

  const collection = await getCollection();
  const doc = await collection.findOne({
    hash: safeHash,
    expiresAt: { $gt: new Date() }
  });

  return doc ? toRecord(doc) : null;
}

export async function consumeDiagram(hash: string): Promise<DiagramRecord | null> {
  const safeHash = sanitizeHash(hash);
  if (!safeHash) {
    return null;
  }

  const collection = await getCollection();
  const result = await collection.findOneAndDelete({
    hash: safeHash,
    expiresAt: { $gt: new Date() }
  });

  return result ? toRecord(result) : null;
}

export async function putDiagram(hash: string, input: DiagramRecordInput): Promise<DiagramRecord> {
  const safeHash = sanitizeHash(hash);
  if (!safeHash) {
    throw new Error("Invalid hash");
  }

  const normalized = normalizeShareInput(input);
  if (!normalized) {
    throw new Error("Either kind+content, html or mermaid is required");
  }
  if (normalized.content.length > MAX_CONTENT_LENGTH) {
    throw new Error("Content too large");
  }

  const expiresAt = resolveExpiration(input.ttlSeconds);
  const record: DiagramRecord = {
    hash: safeHash,
    kind: normalized.kind,
    content: normalized.content,
    title: input.title?.trim() || undefined,
    description: input.description?.trim() || undefined,
    filename: input.filename?.trim() || undefined,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  const document: DiagramDocument = {
    hash: record.hash,
    kind: record.kind,
    content: record.content,
    title: record.title,
    description: record.description,
    filename: record.filename,
    createdAt: new Date(record.createdAt),
    expiresAt
  };

  const collection = await getCollection();
  await collection.updateOne(
    { hash: safeHash },
    { $set: document },
    { upsert: true }
  );

  return record;
}

function toRecord(doc: DiagramDocument): DiagramRecord {
  return {
    hash: doc.hash,
    kind: doc.kind,
    content: doc.content,
    title: doc.title,
    description: doc.description,
    filename: doc.filename,
    createdAt: doc.createdAt.toISOString(),
    expiresAt: doc.expiresAt.toISOString()
  };
}
