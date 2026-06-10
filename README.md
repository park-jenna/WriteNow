# WriteNow

WriteNow is a web app that generates a tailored cover letter using:

- your resume (pulled from **Google Drive**)
- a short **company research** summary (Anthropic)
- optional job description and personal note

It saves the generated letter back to Google Drive and logs a record to Notion.

## Screenshots

**Input form**
![Input form](docs/screenshots/input.png)

**Generation in progress**
![Generation progress](docs/screenshots/generating.png)

**Generated cover letter**
![Result](docs/screenshots/result.png)

## Live demo

There is a deployed instance at [write-now.vercel.app](https://write-now.vercel.app), but **Google OAuth access is restricted to approved test users** (Google "testing" mode). If you don't have access, run locally instead — setup takes about 10 minutes.

## How it works

1. **Sign in with Google** (NextAuth).
2. **One-time setup**: paste a Google Drive share link to your resume (`/setup`).
3. Enter a job title, company name, and optional job description on the home form.
4. `POST /api/generate` runs the following pipeline:
   - Resume fetch and company research run **concurrently** with `Promise.allSettled` to reduce latency.
   - Cover letter generation runs after both complete.
   - Drive save and Notion logging run as **soft failures**: the user always receives the generated letter even if secondary integrations fail, with per-step warnings returned to the client.
5. The result page shows the letter with an option to open it in Drive.

**Design decisions**
- Resume file reference is stored in Supabase and accessed only in server-side handlers, keeping Drive tokens out of the client.
- Hard failures (no letter produced) are separated from soft failures (Drive save, Notion log) so the core output is always delivered.
- The generation prompt includes grounding rules to prevent the model from inventing experience not present in the resume.

## Tech stack

- **Next.js App Router** (Node runtime for server routes)
- **NextAuth** (Google OAuth)
- **Anthropic SDK** (company research + cover letter generation)
- **Google Drive API** (read resume, write letter)
- **Supabase** (per-user resume file reference, server-side only)
- **Notion API** (optional run logging)

## Local development

### 1) Install

```bash
npm install
```

### 2) Environment variables

Create `.env.local` (do not commit it). Use `.env.example` as a template.

Required:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (local: `http://localhost:3000`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (enables Notion logging):

- `NOTION_MCP_TOKEN`
- `NOTION_DATABASE_ID`

Optional (model override):

- `ANTHROPIC_MODEL`

### 3) Google OAuth setup

In Google Cloud Console:

- Configure OAuth consent screen.
- Create an OAuth client for a web application.
- Add redirect URL: `http://localhost:3000/api/auth/callback/google`
- Ensure the app can request Drive scopes (configured in `lib/auth.ts`).

### 4) Supabase table

Create a `users` table with at least:

- `email` (text, unique)
- `resume_file_id` (text, nullable)

### 5) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Notion logging (optional)

If `NOTION_MCP_TOKEN` and `NOTION_DATABASE_ID` are set, each generation creates a Notion page with:

- Job Title, Company, Email, Date, Status, Drive Link

The app accepts `NOTION_DATABASE_ID` as a UUID, 32-char hex id, or pasted Notion URL.

## Notes and limitations

- **OAuth restriction**: the deployed instance is in Google "testing" mode. Run locally to test with your own credentials.
- **Token lifecycle**: Drive requests use the Google OAuth access token. Long-lived sessions may need refresh-token handling.
- **Resume formats**: Google Docs export to plain text is preferred; PDFs are downloaded and parsed best-effort.
- **Privacy**: resume text is fetched at generation time and not persisted. Avoid verbose server logs in production.

## License

All rights reserved. Not licensed for redistribution or commercial use.