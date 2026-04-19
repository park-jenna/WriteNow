# Project Setup Guide

## Prerequisites

- Node.js 18+
- A Google Cloud project with OAuth credentials
- An Anthropic API key
- A Notion account and integration token
- A Supabase project

---

## Step 1: Create the Next.js Project

```bash
npx create-next-app@latest cover-letter-gen --typescript --tailwind --app
cd cover-letter-gen
npm install next-auth @auth/supabase-adapter @supabase/supabase-js
```

---

## Step 2: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use an existing one
3. Enable the Google Drive API
4. Go to Credentials and create an OAuth 2.0 Client ID
5. Set authorized redirect URI to `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

Scopes needed:
```
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.file
```

---

## Step 3: Supabase Setup

1. Create a new Supabase project
2. Run this SQL in the Supabase SQL editor:

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  resume_file_id text,
  created_at timestamp with time zone default now()
);
```

3. Copy the project URL and service role key to `.env.local`

---

## Step 4: Notion Setup

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration and copy the token
3. Create a new Notion database with these fields:
   - Job Title (title field)
   - Company (text)
   - Email (email)
   - Date (date)
   - Drive Link (URL)
   - Status (select)
4. Share the database with your integration
5. Copy the database ID from the URL (the part after the workspace name and before the `?`)

---

## Step 5: Environment Variables

Create a `.env.local` file in the project root:

```env
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

ANTHROPIC_API_KEY=your-anthropic-api-key

NOTION_MCP_TOKEN=your-notion-integration-token
NOTION_DATABASE_ID=your-notion-database-id

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Generate a NEXTAUTH_SECRET with:
```bash
openssl rand -base64 32
```

---

## Step 6: Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`. You should see the login screen.

---

## Step 7: Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under Project Settings > Environment Variables.

Update the Google OAuth redirect URI to your production URL:
```
https://your-app.vercel.app/api/auth/callback/google
```

---

## File Structure

```
/app
  /api
    /auth/[...nextauth]/route.ts   NextAuth handler
    /setup/route.ts                Save resume file ID
    /generate/route.ts             Main workflow endpoint
  /setup/page.tsx                  Setup screen
  /generate/page.tsx               Progress and output screen
  /page.tsx                        Input form
  layout.tsx
/lib
  /supabase.ts                     Supabase client
  /anthropic.ts                    Anthropic API calls
  /mcp.ts                          MCP tool wrappers
/types
  index.ts
```

---

## Common Issues

**OAuth redirect mismatch**
Make sure the redirect URI in Google Cloud Console exactly matches what NextAuth is using. In development this is `http://localhost:3000/api/auth/callback/google`.

**Notion database not found**
The integration must be explicitly shared with the database. Open the database in Notion, click the three dots menu, go to Connections, and add your integration.

**Drive file not accessible**
The OAuth scope must include `drive.readonly` for reading the resume and `drive.file` for saving the generated cover letter.

**Supabase row not found on first generate**
If the user skips the setup screen somehow, `/api/generate` will return a 400 with `"No resume file configured"`. The frontend should catch this and redirect to `/setup`.
