# WriteNow

WriteNow is a web app that generates a tailored cover letter using:

-   your resume (pulled from **Google Drive**)
-   a short **company research** summary
-   optional job description + personal note

It can also save the generated letter back to Google Drive and log a lightweight record to Notion.

## Live demo

There is a deployed instance, but **Google OAuth access is restricted to approved test users** (Google “testing” mode / allowlist). If you don’t have access, run locally instead.

## How it works

1.  **Sign in with Google** (NextAuth).
2.  **One-time setup**: paste a Google Drive share link to your resume (`/setup`).
3.  Enter application details on the home form.
4.  `POST /api/generate` performs:
    -   fetch resume text from Drive (exports Google Docs to text; falls back to downloading + parsing PDFs)
    -   generate a short company research summary (Anthropic)
    -   generate a cover letter (Anthropic)
    -   save the letter to Drive (optional; best-effort)
    -   log the run to Notion (optional; best-effort)

## Tech stack

-   **Next.js App Router** (Node runtime for server routes)
-   **NextAuth** (Google OAuth)
-   **Anthropic SDK** (text generation)
-   **Google Drive API** (read resume / write letter)
-   **Supabase** (store per-user resume file id)
-   **Notion API** (optional logging)

## Local development

### 1) Install

``` bash
npm install
```

### 2) Environment variables

Create `.env.local` (do not commit it). Use `.env.example` as a template.

Required for core functionality:

-   `NEXTAUTH_SECRET`
-   `NEXTAUTH_URL` (for local dev: `http://localhost:3000`)
-   `GOOGLE_CLIENT_ID`
-   `GOOGLE_CLIENT_SECRET`
-   `ANTHROPIC_API_KEY`
-   `NEXT_PUBLIC_SUPABASE_URL`
-   `SUPABASE_SERVICE_ROLE_KEY`

Optional (enables Notion logging):

-   `NOTION_MCP_TOKEN`
-   `NOTION_DATABASE_ID`

Optional (model override):

-   `ANTHROPIC_MODEL`

### 3) Google OAuth setup (Drive access)

In Google Cloud Console:

-   Configure OAuth consent screen.
-   Create an OAuth client for a web application.
-   Add redirect URL:
    -   `http://localhost:3000/api/auth/callback/google`
-   Ensure the app can request Drive scopes (configured in `lib/auth.ts`).

### 4) Supabase table

Create a `users` table with at least:

-   `email` (text, unique)
-   `resume_file_id` (text, nullable)

WriteNow stores the resume’s Drive file id per user on `/setup`.

### 5) Run

``` bash
npm run dev
```

Open `http://localhost:3000`.

## Notion logging (optional)

If you set `NOTION_MCP_TOKEN` and `NOTION_DATABASE_ID`, each generation can create a Notion page in your database with:

-   Job Title (title)
-   Company (rich text)
-   Email (email)
-   Date (date)
-   Status (select)
-   Drive Link (url, optional)

The app accepts `NOTION_DATABASE_ID` as a UUID, a 32-char hex id, or a pasted Notion URL and normalizes it automatically.

## Notes & limitations

-   **Token lifecycle**: Drive requests use the Google OAuth access token. If you keep sessions around for a long time, you may need to add refresh-token handling for fully hands-off usage.
-   **Resume formats**: Google Docs export to text is preferred; PDFs are downloaded and parsed best-effort.
-   **Privacy**: the resume is fetched at generation time; avoid adding verbose server logs containing resume text in production.

## License

All rights reserved. This project is not licensed for redistribution or commercial use.
