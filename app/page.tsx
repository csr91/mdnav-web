import { configPathLabel, mongoEnabled } from "@/lib/env";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="kicker">mdnav web</div>
        <h1 className="title">Render Mermaid From A Share Link</h1>
        <p className="subtitle">
          This mini app is designed for mdnav. A client can push Mermaid text to an API endpoint and
          later open <code>/hash</code> in a browser to render the diagram.
        </p>
      </section>

      <section className="grid">
        <div className="card">
          <h2>How it works</h2>
        <div className="meta">
            <span className="badge">Route: /[hash]</span>
            <span className="badge">POST: /api/diagrams/[hash]</span>
            <span className="badge">{mongoEnabled() ? "Storage: MongoDB" : "Storage: missing MONGO_URI"}</span>
          </div>
          <p className="muted">
            POST a Mermaid payload to the API, then open the generated browser URL with the same hash.
          </p>
        </div>

        <div className="card">
          <h2>Example payload</h2>
          <pre className="code">{`POST /api/diagrams/abc123
Content-Type: application/json

{
  "mermaid": "flowchart TD\\nA[Start] --> B[Finish]"
}`}</pre>
        </div>

        <div className="card">
          <h2>Notes</h2>
          <p className="muted">
            This app expects a Mongo database. In production or local dev, set <code>MONGO_URI</code> and
            use database <code>mdnav</code>.
          </p>
          <p className="muted">Config source: {configPathLabel()}</p>
        </div>
      </section>
    </main>
  );
}
