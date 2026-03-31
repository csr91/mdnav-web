import { Collection, Db, Document, MongoClient } from "mongodb";
import "server-only";

export type DiagramRecord = {
  hash: string;
  mermaid?: string;
  html?: string;
  title?: string;
  description?: string;
  createdAt: string;
  expiresAt: string;
};

type DiagramDocument = {
  hash: string;
  mermaid?: string;
  html?: string;
  title?: string;
  description?: string;
  createdAt: Date;
  expiresAt: Date;
} & Document;

export type DiagramRecordInput = {
  mermaid?: string;
  html?: string;
  title?: string;
  description?: string;
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

  if (!input.html?.trim() && !input.mermaid?.trim()) {
    throw new Error("Either html or mermaid is required");
  }

  const expiresAt = resolveExpiration(input.ttlSeconds);
  const record: DiagramRecord = {
    hash: safeHash,
    mermaid: input.mermaid?.trim() || undefined,
    html: input.html?.trim() || undefined,
    title: input.title?.trim() || undefined,
    description: input.description?.trim() || undefined,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  const document: DiagramDocument = {
    hash: record.hash,
    mermaid: record.mermaid,
    html: record.html,
    title: record.title,
    description: record.description,
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
    mermaid: doc.mermaid,
    html: doc.html,
    title: doc.title,
    description: doc.description,
    createdAt: doc.createdAt.toISOString(),
    expiresAt: doc.expiresAt.toISOString()
  };
}
