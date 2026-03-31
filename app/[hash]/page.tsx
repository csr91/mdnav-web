import { notFound } from "next/navigation";

import MermaidViewer from "@/components/MermaidViewer";
import { sanitizeStoredHtml } from "@/lib/html";
import { consumeDiagram } from "@/lib/storage";

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

  return (
    <main className="shell">
      <div className="meta">
        <span className="badge">hash: {hash}</span>
        <span className="badge">created: {new Date(diagram.createdAt).toLocaleString()}</span>
      </div>

      <section className="card">
        <h1>{diagram.title ?? "Shared Mermaid"}</h1>
        {diagram.description ? <p className="subtitle">{diagram.description}</p> : null}
        <div className="viewer">
          {diagram.html ? (
            <div
              className="mermaid"
              dangerouslySetInnerHTML={{ __html: sanitizeStoredHtml(diagram.html) }}
            />
          ) : diagram.mermaid ? (
            <MermaidViewer id={`diagram-${hash}`} source={diagram.mermaid} />
          ) : (
            <p className="error">Stored payload is empty.</p>
          )}
        </div>
      </section>

      {diagram.mermaid ? (
        <section className="card">
          <h2>Source</h2>
          <pre className="code">{diagram.mermaid}</pre>
        </section>
      ) : null}
    </main>
  );
}
