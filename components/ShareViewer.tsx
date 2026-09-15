import MermaidViewer from "@/components/MermaidViewer";
import { sanitizeStoredHtml } from "@/lib/html";
import type { ShareKind } from "@/lib/storage";

type ShareViewerProps = {
  hash: string;
  kind: ShareKind | undefined;
  content: string;
};

export default function ShareViewer({ hash, kind, content }: ShareViewerProps) {
  switch (kind) {
    case "mermaid":
      return <MermaidViewer id={`diagram-${hash}`} source={content} />;
    case "html":
      return (
        <div
          className="mermaid"
          dangerouslySetInnerHTML={{ __html: sanitizeStoredHtml(content) }}
        />
      );
    case "diff":
      return <DiffView content={content} />;
    case "csv":
      return <CsvView content={content} />;
    case "json":
      return <pre className="code">{formatJson(content)}</pre>;
    case "log":
      return <LogView content={content} />;
    default:
      return <pre className="code">{content}</pre>;
  }
}

function formatJson(content: string) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

function DiffView({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  return (
    <pre className="code diff">
      {lines.map((line, i) => {
        let cls = "";
        if (line.startsWith("+++") || line.startsWith("---")) cls = "diff-meta";
        else if (line.startsWith("+")) cls = "diff-add";
        else if (line.startsWith("-")) cls = "diff-del";
        else if (line.startsWith("@@")) cls = "diff-hunk";
        return (
          <div key={i} className={cls}>
            {line || " "}
          </div>
        );
      })}
    </pre>
  );
}

function LogView({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  return (
    <pre className="code log">
      {lines.map((line, i) => {
        let cls = "";
        if (/\berror\b/i.test(line)) cls = "log-error";
        else if (/\bwarn(ing)?\b/i.test(line)) cls = "log-warn";
        return (
          <div key={i} className={cls}>
            {line || " "}
          </div>
        );
      })}
    </pre>
  );
}

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const cells: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inQuotes) {
          if (c === '"') {
            if (line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            cur += c;
          }
        } else if (c === '"') {
          inQuotes = true;
        } else if (c === ",") {
          cells.push(cur);
          cur = "";
        } else {
          cur += c;
        }
      }
      cells.push(cur);
      return cells;
    });
}

function CsvView({ content }: { content: string }) {
  const rows = parseCsv(content);
  if (!rows.length) {
    return <p className="error">Empty CSV.</p>;
  }
  const [header, ...body] = rows;
  return (
    <div className="csv-wrap">
      <table className="csv-table">
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
