/**
 * Project Generation Tool
 *
 * This tool generates complete ZIMSEC School-Based Projects (SBPs)
 * following the official marking guide structure.
 * 
 * Projects are saved as PDFs and stored in the database.
 * 
 * CRITICAL: Mark allocation determines content depth!
 * - [1 mark] = 1-2 sentences
 * - [2 marks] = 3-5 sentences OR 2 detailed points
 * - [6 marks] = 3 detailed sections (2 marks each)
 * - [10 marks] = Thorough presentation with multiple elements
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Ensure uploads directory exists
const UPLOADS_DIR = process.env.PDF_UPLOADS_DIR || "./uploads/pdfs";

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

/**
 * Project Stage Schema — Matches ZIMSEC Marking Guide
 * 
 * MARK ALLOCATION GUIDE:
 * [1 mark] = Brief, 1-2 sentences
 * [2 marks] = Moderate detail, 3-5 sentences
 * [3 marks] = Multiple items (1 mark each)
 * [6 marks] = Comprehensive (3 items × 2 marks)
 * [10 marks] = Thorough presentation
 */
const ProjectStageSchema = z.object({
  // ============================================
  // STAGE 1: PROBLEM IDENTIFICATION [5 marks]
  // ============================================
  stage1: z.object({
    problemDescription: z.string().describe(
      "[1 mark] Clear, concise description of the problem, innovation, or identified gap. " +
      "DEPTH: 1-2 sentences stating the core issue."
    ),
    statementOfIntent: z.string().describe(
      "[2 marks] Statement of intent that links directly to the problem. " +
      "DEPTH: 3-5 sentences explaining what the project aims to achieve and how it addresses the problem."
    ),
    specifications: z.array(z.string()).min(2).describe(
      "[2 marks] At least 2 design/project specifications or parameters. " +
      "DEPTH: Each specification should be specific and measurable."
    ),
  }),
  
  // ============================================
  // STAGE 2: INVESTIGATION OF RELATED IDEAS [10 marks]
  // ============================================
  stage2: z.object({
    relatedIdeas: z.array(z.object({
      title: z.string().describe("Clear, descriptive title of the existing idea/solution"),
      description: z.string().describe(
        "[1 mark per idea] Evidence/description of the existing solution. " +
        "DEPTH: 2-3 sentences explaining what it is and how it works."
      ),
      merits: z.array(z.string()).min(2).describe(
        "[1 mark per idea] Advantages/strengths of this idea. " +
        "DEPTH: 2-3 specific advantages."
      ),
      demerits: z.array(z.string()).min(2).describe(
        "[1 mark per idea] Disadvantages/weaknesses of this idea. " +
        "DEPTH: 2-3 specific disadvantages."
      ),
    })).length(3).describe(
      "[10 marks total] EXACTLY 3 related existing ideas with full analysis. " +
      "Each idea: description (1 mark) + merits (1 mark) + demerits (1 mark) + presentation (1 mark)."
    ),
  }),
  
  // ============================================
  // STAGE 3: GENERATION OF POSSIBLE SOLUTIONS [9 marks]
  // ============================================
  stage3: z.object({
    possibleSolutions: z.array(z.object({
      title: z.string().describe("Clear, descriptive title of YOUR proposed solution"),
      description: z.string().describe(
        "[1 mark per solution] YOUR original solution description. " +
        "DEPTH: 2-3 sentences explaining your proposed idea."
      ),
      merits: z.array(z.string()).min(2).describe(
        "[1 mark per solution] Advantages/strengths of your solution. " +
        "DEPTH: 2-3 specific advantages."
      ),
      demerits: z.array(z.string()).min(2).describe(
        "[1 mark per solution] Disadvantages/weaknesses of your solution. " +
        "DEPTH: 2-3 specific disadvantages."
      ),
    })).length(3).describe(
      "[9 marks total] EXACTLY 3 original possible solutions with full analysis. " +
      "These must be YOUR OWN ideas, not copied from Stage 2!"
    ),
  }),
  
  // ============================================
  // STAGE 4: DEVELOPMENT/REFINEMENT [10 marks] — CRITICAL STAGE!
  // ============================================
  stage4: z.object({
    chosenSolution: z.string().describe(
      "[1 mark] Clearly state which solution from Stage 3 was chosen. " +
      "DEPTH: 1 clear sentence identifying the selection."
    ),
    justification: z.array(z.string()).min(2).describe(
      "[2 marks] At least 2 strong points justifying why this solution is best. " +
      "DEPTH: Each point should be 2-3 sentences with reasoning."
    ),
    refinements: z.array(z.object({
      title: z.string().describe("Clear title for this refinement/development"),
      description: z.string().describe(
        "[2 marks per refinement] DETAILED description of how you're improving the solution. " +
        "DEPTH: 4-6 sentences explaining the development, why it's needed, and how it enhances the solution. " +
        "THIS IS CRITICAL — refinements carry the most weight!"
      ),
    })).length(3).describe(
      "[6 marks total] EXACTLY 3 developments/refinements at 2 marks each. " +
      "This is the MOST IMPORTANT part — show real development of the idea!"
    ),
  }),
  
  // ============================================
  // STAGE 5: PRESENTATION OF RESULTS [10 marks]
  // ============================================
  stage5: z.object({
    presentationType: z.enum(["artifact", "service", "product"]).describe(
      "Type of final presentation: 'artifact' (tangible item), 'service' (intangible offering), or 'product' (non-artifact product)"
    ),
    description: z.string().describe(
      "[Part of 10 marks] Full description of the final solution/presentation. " +
      "DEPTH: 4-6 sentences describing what was created and how it works."
    ),
    features: z.array(z.string()).min(4).describe(
      "[Part of 10 marks] Key features of the final solution. " +
      "DEPTH: At least 4-5 specific features that make this solution effective."
    ),
    implementation: z.string().describe(
      "[Part of 10 marks] How the solution was/would be implemented. " +
      "DEPTH: 4-6 sentences covering the implementation process and standards met."
    ),
  }),
  
  // ============================================
  // STAGE 6: EVALUATION AND RECOMMENDATIONS [5 marks]
  // ============================================
  stage6: z.object({
    relevanceToIntent: z.string().describe(
      "[2 marks] How does the solution address the original problem from Stage 1? " +
      "DEPTH: 3-5 sentences showing clear connection back to the statement of intent."
    ),
    challenges: z.array(z.string()).min(2).describe(
      "[1 mark] Honest challenges encountered during the project. " +
      "DEPTH: 2-3 specific challenges faced."
    ),
    recommendations: z.array(z.string()).min(2).describe(
      "[2 marks] Future improvements and recommendations. " +
      "DEPTH: 2-3 specific suggestions for scaling or enhancing the solution."
    ),
  }),
});

/**
 * Generate Project Tool
 *
 * Creates a complete ZIMSEC SBP project document with all 6 stages.
 * This is Tatenda's PRIMARY tool for generating full projects!
 */
export const generateProjectTool = createTool({
  id: "generate-project",
  description: `Generate a complete ZIMSEC School-Based Project (SBP) document as a PDF.

USE THIS TOOL when a student asks Tatenda to:
- "Generate/create/write a project on..."
- "Make a complete SBP about..."
- "I need a full project for Heritage Studies/Computer Science/etc."

THE 6 STAGES (45 marks total):
================================
Stage 1: Problem Identification [5 marks]
  - Problem description [1 mark] → 1-2 sentences
  - Statement of intent [2 marks] → 3-5 sentences
  - Specifications [2 marks] → At least 2 specific parameters

Stage 2: Investigation of Related Ideas [10 marks]
  - 3 existing ideas [3 marks] → 1 mark each
  - Merits per idea [3 marks] → 2-3 advantages each
  - Demerits per idea [3 marks] → 2-3 disadvantages each
  - Presentation quality [1 mark]

Stage 3: Generation of Possible Solutions [9 marks]
  - 3 ORIGINAL solutions [3 marks] → 1 mark each
  - Merits per solution [3 marks]
  - Demerits per solution [3 marks]

Stage 4: Development/Refinement [10 marks] ← MOST IMPORTANT!
  - Choice indication [1 mark] → 1 sentence
  - Justification [2 marks] → 2+ strong reasons
  - 3 Refinements [6 marks] → 2 marks EACH, detailed!
  - Presentation [1 mark]

Stage 5: Presentation of Results [10 marks]
  - Full description of final solution
  - Key features (4-5 minimum)
  - Implementation details

Stage 6: Evaluation and Recommendations [5 marks]
  - Relevance to intent [2 marks] → Connect back to Stage 1
  - Challenges [1 mark] → 2-3 honest challenges
  - Recommendations [2 marks] → Future improvements

DEPTH RULE: More marks = more detail. 1 mark = brief, 6 marks = comprehensive!

The project PDF is automatically saved to the student's account and costs 1 credit.`,
  
  inputSchema: z.object({
    title: z.string().describe("The project title"),
    subject: z.string().describe("The subject (e.g., Computer Science, Heritage Studies, Agriculture, Physics)"),
    author: z.string().describe("Student's name"),
    candidateNumber: z.string().optional().describe("Candidate/exam number if available"),
    school: z.string().optional().describe("School name"),
    formGrade: z.string().optional().describe("Form or Grade (e.g., Form 4, Lower 6)"),
    level: z.enum(["O-Level", "A-Level"]).describe("Academic level"),
    userId: z.string().describe("The user ID for database storage"),
    ...ProjectStageSchema.shape,
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    projectId: z.string().describe("Database ID of the created project"),
    fileName: z.string(),
    filePath: z.string(),
    fileSize: z.number(),
    downloadUrl: z.string(),
    createdAt: z.string(),
    message: z.string(),
  }),
  
  execute: async (input) => {
    try {
      await ensureUploadsDir();

      const {
        title, subject, author, candidateNumber, school, formGrade, level,
        stage1, stage2, stage3, stage4, stage5, stage6
      } = input;

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

      // Document metadata
      pdfDoc.setTitle(title);
      pdfDoc.setAuthor(author);
      pdfDoc.setSubject(`${subject} - ${level} School-Based Project`);
      pdfDoc.setCreationDate(new Date());

      // Page settings
      const pageWidth = 595.28; // A4
      const pageHeight = 841.89;
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let yPosition = pageHeight - margin;
      let pageNumber = 1;

      // Colors
      const brandColor = rgb(0.44, 0.29, 0.99); // #7148FC
      const headingColor = rgb(0.1, 0.1, 0.1);
      const textColor = rgb(0.2, 0.2, 0.2);
      const mutedColor = rgb(0.5, 0.5, 0.5);
      const dividerColor = rgb(0.8, 0.8, 0.8);

      // Helper: Add page number
      const addPageNumber = () => {
        page.drawText(`Page ${pageNumber}`, {
          x: pageWidth / 2 - 20,
          y: 25,
          size: 10,
          font: timesRoman,
          color: mutedColor,
        });
      };

      // Helper: Add new page
      const addNewPage = () => {
        addPageNumber();
        pageNumber++;
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      };

      // Helper: Check and add new page if needed
      const checkPageBreak = (neededSpace: number = 100) => {
        if (yPosition < margin + neededSpace) {
          addNewPage();
        }
      };

      // Helper: Add text with word wrap and pagination
      const addText = (
        text: string,
        fontSize: number,
        font: PDFFont,
        color = textColor,
        lineHeight = 1.5,
        indent = 0
      ): number => {
        const effectiveWidth = contentWidth - indent;
        const words = text.split(" ");
        let line = "";
        const lines: string[] = [];

        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > effectiveWidth) {
            if (line) lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) lines.push(line);

        for (const l of lines) {
          checkPageBreak(fontSize * 2);
          
          page.drawText(l, {
            x: margin + indent,
            y: yPosition,
            size: fontSize,
            font,
            color,
          });
          
          yPosition -= fontSize * lineHeight;
        }

        return yPosition;
      };

      // Helper: Add horizontal divider
      const addDivider = (thickness = 1, color = dividerColor) => {
        yPosition -= 10;
        checkPageBreak(20);
        page.drawLine({
          start: { x: margin, y: yPosition },
          end: { x: pageWidth - margin, y: yPosition },
          thickness,
          color,
        });
        yPosition -= 15;
      };

      // Helper: Add section heading with underline
      const addSectionHeading = (text: string, marks: string) => {
        yPosition -= 20;
        checkPageBreak(80);
        
        // Draw background bar
        page.drawRectangle({
          x: margin,
          y: yPosition - 5,
          width: contentWidth,
          height: 28,
          color: rgb(0.95, 0.94, 1), // Light purple
        });
        
        // Section title (marks parameter kept for compatibility but not displayed)
        page.drawText(text, {
          x: margin + 10,
          y: yPosition + 2,
          size: 14,
          font: timesRomanBold,
          color: brandColor,
        });
        
        // Underline
        yPosition -= 28;
        page.drawLine({
          start: { x: margin, y: yPosition + 23 },
          end: { x: pageWidth - margin, y: yPosition + 23 },
          thickness: 2,
          color: brandColor,
        });
        
        yPosition -= 15;
      };

      // Helper: Add subsection heading
      const addSubsection = (label: string, marks: string) => {
        yPosition -= 12;
        checkPageBreak(50);
        
        // Subsection (marks parameter kept for compatibility but not displayed)
        addText(`${label}`, 11, timesRomanBold, headingColor, 1.3);
        
        yPosition -= 5;
      };

      // Helper: Add bullet point
      const addBullet = (text: string, indent = 15) => {
        addText(`•  ${text}`, 11, timesRoman, textColor, 1.4, indent);
      };

      // Helper: Add numbered item
      const addNumbered = (num: number, text: string, indent = 15) => {
        addText(`${num}.  ${text}`, 11, timesRoman, textColor, 1.4, indent);
      };

      // ===== TITLE PAGE =====
      yPosition -= 80;
      
      // School name (centered, uppercase)
      if (school) {
        const schoolText = school.toUpperCase();
        const schoolWidth = timesRomanBold.widthOfTextAtSize(schoolText, 16);
        page.drawText(schoolText, {
          x: (pageWidth - schoolWidth) / 2,
          y: yPosition,
          size: 16,
          font: timesRomanBold,
          color: headingColor,
        });
        yPosition -= 40;
      }
      
      // Divider
      page.drawLine({
        start: { x: margin + 50, y: yPosition },
        end: { x: pageWidth - margin - 50, y: yPosition },
        thickness: 2,
        color: brandColor,
      });
      yPosition -= 40;
      
      // Student details
      addText(`Candidate Name: ${author}`, 12, timesRoman, textColor, 2);
      if (candidateNumber) {
        addText(`Candidate Number: ${candidateNumber}`, 12, timesRoman, textColor, 2);
      }
      addText(`Learning Area: ${subject}`, 12, timesRoman, textColor, 2);
      addText(`Level: ${level}`, 12, timesRoman, textColor, 2);
      if (formGrade) {
        addText(`Form/Grade: ${formGrade}`, 12, timesRoman, textColor, 2);
      }
      
      yPosition -= 40;
      
      // Project Title (prominent)
      page.drawLine({
        start: { x: margin + 50, y: yPosition },
        end: { x: pageWidth - margin - 50, y: yPosition },
        thickness: 1,
        color: dividerColor,
      });
      yPosition -= 30;
      
      addText("PROJECT TITLE:", 12, timesRomanBold, mutedColor, 1.5);
      yPosition -= 10;
      addText(title, 18, timesRomanBold, brandColor, 1.6);
      
      yPosition -= 30;
      page.drawLine({
        start: { x: margin + 50, y: yPosition },
        end: { x: pageWidth - margin - 50, y: yPosition },
        thickness: 1,
        color: dividerColor,
      });
      
      // Date
      yPosition -= 40;
      addText(`Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 11, timesRomanItalic, mutedColor, 1.5);
      
      // Add page number and start new page
      addNewPage();

      // ===== STAGE 1: Problem Identification (5 marks) =====
      addSectionHeading("STAGE 1: PROBLEM IDENTIFICATION", "[5 marks]");
      
      addSubsection("1.1 Description of Problem/Innovation/Identified Gap", "[1 mark]");
      addText(stage1.problemDescription, 11, timesRoman, textColor, 1.5, 10);
      yPosition -= 10;
      
      addSubsection("1.2 Statement of Intent", "[2 marks]");
      addText(stage1.statementOfIntent, 11, timesRoman, textColor, 1.5, 10);
      yPosition -= 10;
      
      addSubsection("1.3 Design/Project Specifications", "[2 marks]");
      for (const spec of stage1.specifications) {
        addBullet(spec);
      }

      addDivider();

      // ===== STAGE 2: Investigation of Related Ideas (10 marks) =====
      addSectionHeading("STAGE 2: INVESTIGATION OF RELATED IDEAS", "[10 marks]");
      
      for (let i = 0; i < stage2.relatedIdeas.length; i++) {
        const idea = stage2.relatedIdeas[i]!;
        addSubsection(`2.${i + 1} Related Idea ${i + 1}: ${idea.title}`, "[1 mark]");
        addText(idea.description, 11, timesRoman, textColor, 1.5, 10);
        yPosition -= 8;
        
        addText("Merits/Advantages:", 10, timesRomanBold, headingColor, 1.3, 10);
        for (const merit of idea.merits) {
          addBullet(merit, 20);
        }
        
        yPosition -= 5;
        addText("Demerits/Disadvantages:", 10, timesRomanBold, headingColor, 1.3, 10);
        for (const demerit of idea.demerits) {
          addBullet(demerit, 20);
        }
        yPosition -= 12;
      }

      addDivider();

      // ===== STAGE 3: Generation of Possible Solutions (9 marks) =====
      addSectionHeading("STAGE 3: GENERATION OF POSSIBLE SOLUTIONS", "[9 marks]");
      
      for (let i = 0; i < stage3.possibleSolutions.length; i++) {
        const solution = stage3.possibleSolutions[i]!;
        addSubsection(`3.${i + 1} Possible Solution ${i + 1}: ${solution.title}`, "[1 mark]");
        addText(solution.description, 11, timesRoman, textColor, 1.5, 10);
        yPosition -= 8;
        
        addText("Merits/Advantages:", 10, timesRomanBold, headingColor, 1.3, 10);
        for (const merit of solution.merits) {
          addBullet(merit, 20);
        }
        
        yPosition -= 5;
        addText("Demerits/Disadvantages:", 10, timesRomanBold, headingColor, 1.3, 10);
        for (const demerit of solution.demerits) {
          addBullet(demerit, 20);
        }
        yPosition -= 12;
      }

      addDivider();

      // ===== STAGE 4: Development/Refinement (10 marks) =====
      addSectionHeading("STAGE 4: DEVELOPMENT/REFINEMENT OF CHOSEN IDEA", "[10 marks]");
      
      addSubsection("4.1 Chosen Solution", "[1 mark]");
      addText(stage4.chosenSolution, 11, timesRoman, textColor, 1.5, 10);
      yPosition -= 10;
      
      addSubsection("4.2 Justification of Choice", "[2 marks]");
      for (let i = 0; i < stage4.justification.length; i++) {
        addNumbered(i + 1, stage4.justification[i]!, 10);
      }
      yPosition -= 10;
      
      addSubsection("4.3 Developments/Refinements", "[6 marks]");
      for (let i = 0; i < stage4.refinements.length; i++) {
        const ref = stage4.refinements[i]!;
        yPosition -= 5;
        addText(`${i + 1}. ${ref.title}`, 11, timesRomanBold, headingColor, 1.4, 10);
        addText(ref.description, 11, timesRoman, textColor, 1.5, 20);
        yPosition -= 8;
      }

      addDivider();

      // ===== STAGE 5: Presentation of Results (10 marks) =====
      addSectionHeading("STAGE 5: PRESENTATION OF RESULTS/FINAL SOLUTION", "[10 marks]");
      
      const presentationLabel = stage5.presentationType === "artifact" ? "Artifact" :
                                stage5.presentationType === "service" ? "Service" : "Product";
      addSubsection(`5.1 Presentation Type: ${presentationLabel}`, "[10 marks]");
      addText(stage5.description, 11, timesRoman, textColor, 1.5, 10);
      yPosition -= 10;
      
      addText("Key Features:", 10, timesRomanBold, headingColor, 1.3, 10);
      for (const feature of stage5.features) {
        addBullet(feature, 20);
      }
      yPosition -= 10;
      
      addText("Implementation:", 10, timesRomanBold, headingColor, 1.3, 10);
      addText(stage5.implementation, 11, timesRoman, textColor, 1.5, 10);

      addDivider();

      // ===== STAGE 6: Evaluation and Recommendations (5 marks) =====
      addSectionHeading("STAGE 6: EVALUATION AND RECOMMENDATIONS", "[5 marks]");
      
      addSubsection("6.1 Relevance to Statement of Intent", "[2 marks]");
      addText(stage6.relevanceToIntent, 11, timesRoman, textColor, 1.5, 10);
      yPosition -= 10;
      
      addSubsection("6.2 Challenges Encountered", "[1 mark]");
      for (const challenge of stage6.challenges) {
        addBullet(challenge);
      }
      yPosition -= 10;
      
      addSubsection("6.3 Recommendations", "[2 marks]");
      for (const rec of stage6.recommendations) {
        addBullet(rec);
      }

      // Add final page number
      addPageNumber();

      // Generate filename
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40);
      const uniqueId = crypto.randomBytes(8).toString("hex");
      const fileName = `PROJECT_${sanitizedTitle}_${uniqueId}.pdf`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      // Get file stats
      const stats = await fs.stat(filePath);

      // Generate project ID for database
      const projectId = `proj_${uniqueId}`;

      // Download URL
      const downloadUrl = `/api/files/${fileName}`;

      return {
        success: true,
        projectId,
        fileName,
        filePath,
        fileSize: stats.size,
        downloadUrl,
        createdAt: new Date().toISOString(),
        message: `Project "${title}" has been generated successfully! Your complete ZIMSEC SBP with all 6 stages is ready for download.`,
      };
    } catch (error) {
      console.error("[Project Generator] Error:", error);
      return {
        success: false,
        projectId: "",
        fileName: "",
        filePath: "",
        fileSize: 0,
        downloadUrl: "",
        createdAt: new Date().toISOString(),
        message: `Failed to generate project: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
