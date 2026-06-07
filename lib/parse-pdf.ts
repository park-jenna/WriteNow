// Worker must load before pdf-parse so DOMMatrix and other browser APIs are polyfilled in Node/Vercel.
import "pdf-parse/worker"
import { PDFParse } from "pdf-parse"

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer })
  try {
    const { text } = await parser.getText()
    return text
  } finally {
    await parser.destroy()
  }
}
