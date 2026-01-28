/**
 * PDF Generation Tool
 *
 * This tool allows the AI to generate PDF files from content.
 * Used for creating project documents, reports, and other files.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Ensure uploads directory exists
const UPLOADS_DIR = process.env.PDF_UPLOADS_DIR || "./uploads/pdfs";

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists or cannot be created
  }
}

/**
 * Generate PDF Tool
 *
 * Creates a PDF document from the provided content with proper formatting.
 */
export const generatePDFTool = createTool({
  id: "generate-pdf",
  description: `Generate a PDF document from content. Use this tool when the user asks you to create a project, report, essay, or any document that should be saved as a PDF file. 
    
The tool will:
1. Create a well-formatted PDF with title, content sections, and proper styling
2. Save the PDF to the server
3. Return the file information including download URL

Always use this tool when the user wants their work saved as a file.`,
  inputSchema: z.object({
    title: z.string().describe("The title of the document"),
    content: z.string().describe("The main content of the document. Can include multiple paragraphs separated by newlines."),
    author: z.string().optional().describe("The author name to display on the document"),
    subject: z.string().optional().describe("The subject or category of the document (e.g., 'Biology', 'History')"),
    sections: z.array(z.object({
      heading: z.string().describe("Section heading"),
      content: z.string().describe("Section content"),
    })).optional().describe("Optional sections with headings and content"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    fileName: z.string(),
    filePath: z.string(),
    fileSize: z.number(),
    downloadUrl: z.string(),
    createdAt: z.string(),
    message: z.string(),
  }),
  execute: async ({ title, content, author, subject, sections }) => {
    try {
      await ensureUploadsDir();

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      // Set document metadata
      pdfDoc.setTitle(title);
      if (author) pdfDoc.setAuthor(author);
      if (subject) pdfDoc.setSubject(subject);
      pdfDoc.setCreationDate(new Date());

      // Page dimensions
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let yPosition = pageHeight - margin;

      // Helper function to add text and handle pagination
      const addText = (
        text: string,
        fontSize: number,
        font: typeof timesRomanFont,
        color = rgb(0, 0, 0),
        lineHeight = 1.4
      ) => {
        const words = text.split(" ");
        let line = "";
        const lines: string[] = [];

        // Word wrap
        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > contentWidth) {
            if (line) lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) lines.push(line);

        // Draw lines
        for (const l of lines) {
          if (yPosition < margin + fontSize) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
          
          page.drawText(l, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font,
            color,
          });
          
          yPosition -= fontSize * lineHeight;
        }

        return yPosition;
      };

      // Add title
      const titleColor = rgb(0.44, 0.29, 0.99); // Brand color (#7148FC)
      addText(title, 24, timesRomanBoldFont, titleColor, 1.8);
      yPosition -= 10;

      // Add metadata line
      const metadataLines = [];
      if (author) metadataLines.push(`Author: ${author}`);
      if (subject) metadataLines.push(`Subject: ${subject}`);
      metadataLines.push(`Date: ${new Date().toLocaleDateString()}`);
      
      addText(metadataLines.join(" | "), 10, timesRomanFont, rgb(0.5, 0.5, 0.5), 1.5);
      yPosition -= 20;

      // Add horizontal line
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: pageWidth - margin, y: yPosition },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      yPosition -= 30;

      // Add main content
      if (content) {
        const paragraphs = content.split("\n\n");
        for (const paragraph of paragraphs) {
          if (paragraph.trim()) {
            addText(paragraph.trim(), 12, timesRomanFont, rgb(0, 0, 0), 1.6);
            yPosition -= 15;
          }
        }
      }

      // Add sections
      if (sections && sections.length > 0) {
        for (const section of sections) {
          yPosition -= 20;
          
          // Section heading
          addText(section.heading, 16, timesRomanBoldFont, rgb(0.2, 0.2, 0.2), 1.6);
          yPosition -= 10;
          
          // Section content
          const sectionParagraphs = section.content.split("\n\n");
          for (const paragraph of sectionParagraphs) {
            if (paragraph.trim()) {
              addText(paragraph.trim(), 12, timesRomanFont, rgb(0, 0, 0), 1.6);
              yPosition -= 10;
            }
          }
        }
      }

      // Generate filename
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
      const uniqueId = crypto.randomBytes(8).toString("hex");
      const fileName = `${sanitizedTitle}_${uniqueId}.pdf`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      // Get file stats
      const stats = await fs.stat(filePath);

      // Generate download URL (relative path for the frontend)
      const downloadUrl = `/api/files/${fileName}`;

      return {
        success: true,
        fileName,
        filePath,
        fileSize: stats.size,
        downloadUrl,
        createdAt: new Date().toISOString(),
        message: `PDF "${title}" has been generated successfully. You can download it using the link provided.`,
      };
    } catch (error) {
      console.error("[PDF Generator] Error:", error);
      return {
        success: false,
        fileName: "",
        filePath: "",
        fileSize: 0,
        downloadUrl: "",
        createdAt: new Date().toISOString(),
        message: `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
