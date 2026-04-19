import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/** Override with ANTHROPIC_MODEL in .env.local (e.g. claude-sonnet-4-6). */
const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929"

export async function researchCompany(companyName: string): Promise<string> {
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are researching a company for a job application.
Company: ${companyName}

Return a brief summary (3-5 sentences) covering:
- What the company does
- Their mission or focus area
- Anything notable about their culture or recent work

Return plain text only. No headers or bullet points.`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== "text") throw new Error("Unexpected response type from Claude")
  return block.text
}

export async function generateCoverLetter({
  jobTitle,
  companyName,
  companyResearch,
  resumeText,
  jobDescription,
  personalNote,
}: {
  jobTitle: string
  companyName: string
  companyResearch: string
  resumeText: string
  jobDescription: string
  personalNote: string
}): Promise<string> {
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are writing a professional cover letter.

        IMPORTANT RULES:
        - Only mention experiences, skills, and projects that appear in the resume
        - Never invent or assume anything not in the resume
        - If direct experience is missing, look for transferable skills:
            * Relevant coursework or academic projects
            * Personal or side projects using similar technologies
            * Soft skills demonstrated through any experience (teamwork, problem solving, etc.)
            * Internships or part-time work showing work ethic or initiative
        - If the applicant is a student or early-career, frame the letter around potential and eagerness to contribute rather than years of experience

Job Title: ${jobTitle}
Company: ${companyName}
Company Research: ${companyResearch}
Resume: ${resumeText}
Job Description: ${jobDescription || "Not provided"}
Personal Note from applicant: ${personalNote || "Not provided"}

Write a cover letter that:
- Opens with a specific reason for interest in this company based on the research
- Highlights 2-3 relevant experiences from the resume
- Incorporates the personal note naturally if provided
- Closes with a clear call to action
- Uses a professional but conversational tone
- Is 3-4 paragraphs, no longer
- Use the company research to explain why the applicant is interested in this specific company

Start your response directly with "Dear Hiring Manager," and nothing before it.

Format:
Dear Hiring Manager,

[Body]

Thank you for your consideration,`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== "text") throw new Error("Unexpected response type from Claude")
  return block.text
}
