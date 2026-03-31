"use client";

import { useEffect, useState } from "react";
import mermaid from "mermaid";

type MermaidViewerProps = {
  id: string;
  source: string;
};

let mermaidReady = false;

export default function MermaidViewer({ id, source }: MermaidViewerProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function render() {
      try {
        if (!mermaidReady) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose"
          });
          mermaidReady = true;
        }

        const result = await mermaid.render(id, source);
        if (!active) {
          return;
        }

        setSvg(result.svg);
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }

        setSvg("");
        setError(err instanceof Error ? err.message : "Unknown Mermaid render error");
      }
    }

    render();

    return () => {
      active = false;
    };
  }, [id, source]);

  if (error) {
    return <p className="error">Mermaid render error: {error}</p>;
  }

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
}
