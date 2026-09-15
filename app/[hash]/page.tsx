import { notFound } from "next/navigation";

import ShareViewer from "@/components/ShareViewer";
import { consumeDiagram, type ShareKind } from "@/lib/storage";

const DEFAULT_TITLES: Record<ShareKind, string> = {
  mermaid: "Shared Mermaid",
  html: "Shared HTML",
  text: "Shared text",
  log: "Shared log",
  csv: "Shared CSV",
  json: "Shared JSON",
  diff: "Shared diff"
};

export default async function DiagramPage({
  params
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const diagram = await consumeDiagram(hash);

  if (!diagram) {
    notFound();
  }

  // Legacy records (stored before the share endpoint was generalized) may
  // not have kind/content set — fall back to their old mermaid/html fields.
  const legacy = diagram as typeof diagram & { mermaid?: string; html?: string };
  const kind: ShareKind = diagram.kind ?? (legacy.html ? "html" : "mermaid");
  const content = diagram.content ?? legacy.html ?? legacy.mermaid ?? "";

  return (
    <main className="shell">
      <div className="meta">
        <span className="badge">hash: {hash}</span>
        <span className="badge">created: {new Date(diagram.createdAt).toLocaleString()}</span>
        {diagram.filename ? <span className="badge">{diagram.filename}</span> : null}
      </div>

      <section className="card">
        <h1>{diagram.title ?? DEFAULT_TITLES[kind]}</h1>
        {diagram.description ? <p className="subtitle">{diagram.description}</p> : null}
        <div className="viewer">
          {content ? (
            <ShareViewer hash={hash} kind={kind} content={content} />
          ) : (
            <p className="error">Stored payload is empty.</p>
          )}
        </div>
      </section>
    </main>
  );
}
