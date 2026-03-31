# mdnav-web

Minimal Vercel web companion for `mdnav`.

## What it does

- Receives HTML and/or Mermaid on `POST /api/diagrams/[hash]`
- Stores it by `hash`
- Serves it on `GET /[hash]`
- Consumes the link once on browser open

This is useful for a future `mdnav` share mode where the CLI generates a browser URL like:

```text
https://mdnav-web.vercel.app/abc123
```

## Local development

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## API

### Create or replace a diagram

```bash
curl -X POST http://localhost:3000/api/diagrams/test123 \
  -H "Content-Type: application/json" \
  -d "{\"html\":\"<div class='mermaid'>flowchart TD\\nA[Start] --> B[End]</div>\",\"mermaid\":\"flowchart TD\nA[Start] --> B[End]\",\"title\":\"Example\"}"
```

Optional auth header:

```text
x-mdnav-token: <MDNAV_WEB_WRITE_TOKEN>
```

If `MDNAV_WEB_WRITE_TOKEN` is not configured, writes are open.

### Open the diagram

```text
http://localhost:3000/test123
```

The first successful browser open consumes the link. Refreshing the same URL after that should return not found.

## Vercel deployment

Configure:

- `MONGO_URI`
- `MONGO_DB_NAME=mdnav`

Optional write protection:

- `MDNAV_WEB_WRITE_TOKEN`

## Deploy checklist

1. Push this folder as its own Git repository.
2. Import the repo into Vercel as a Next.js project.
3. Add the environment variables from `.env.example`.
4. Deploy.

After deploy, test:

1. `POST /api/diagrams/[hash]`
2. Open `https://your-domain/[hash]`
3. Refresh once to confirm the link was consumed.
