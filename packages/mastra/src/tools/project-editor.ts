/**
 * Project Editor Tool
 *
 * This tool allows Tatenda to edit existing projects.
 * It regenerates the PDF with updated content while keeping
 * the project's database record.
 * 
 * Editing a project costs 1 credit.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// The same stage schema as project-generator but all fields optional
const EditableStageSchema = z.object({
  stage1: z.object({
    problemDescription: z.string().optional().describe("Updated problem description [1 mark]"),
    statementOfIntent: z.string().optional().describe("Updated statement of intent [2 marks]"),
    specifications: z.array(z.string()).optional().describe("Updated specifications [2 marks]"),
  }).optional(),
  
  stage2: z.object({
    relatedIdeas: z.array(z.object({
      title: z.string(),
      description: z.string(),
      merits: z.array(z.string()),
      demerits: z.array(z.string()),
    })).optional().describe("Updated related ideas [10 marks]"),
  }).optional(),
  
  stage3: z.object({
    possibleSolutions: z.array(z.object({
      title: z.string(),
      description: z.string(),
      merits: z.array(z.string()),
      demerits: z.array(z.string()),
    })).optional().describe("Updated possible solutions [9 marks]"),
  }).optional(),
  
  stage4: z.object({
    chosenSolution: z.string().optional(),
    justification: z.array(z.string()).optional(),
    refinements: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })).optional(),
    presentationNote: z.string().optional(),
  }).optional(),
  
  stage5: z.object({
    finalSolutionDescription: z.string().optional(),
    presentationType: z.string().optional(),
    keyFeatures: z.array(z.string()).optional(),
    implementationDetails: z.string().optional(),
    screenshots: z.array(z.object({
      caption: z.string(),
      description: z.string(),
    })).optional(),
  }).optional(),
  
  stage6: z.object({
    relevanceToIntent: z.string().optional(),
    challenges: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  }).optional(),
});

export const editProjectTool = createTool({
  id: "editProject",
  description: `
    Edit an existing ZIMSEC project. Use this when the user wants to:
    - Modify specific sections of their project
    - Fix errors or typos in their project
    - Improve certain stages based on feedback
    - Update project information (title, author, etc.)
    
    The tool will regenerate the PDF with the changes while keeping the same project ID.
    Only include the fields that need to be changed - unchanged fields will keep their original values.
    
    COSTS 1 CREDIT per edit.
  `,
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to edit"),
    userId: z.string().describe("The user's ID for verification"),
    
    // Editable metadata
    title: z.string().optional().describe("New project title"),
    subject: z.string().optional().describe("New subject"),
    author: z.string().optional().describe("New author name"),
    school: z.string().optional().describe("New school name"),
    candidateNumber: z.string().optional().describe("New candidate number"),
    formGrade: z.string().optional().describe("New form/grade"),
    templateId: z.string().optional().describe("New template style to use"),
    
    // Editable stages
    ...EditableStageSchema.shape,
    
    editReason: z.string().optional().describe("Reason for the edit (for audit log)"),
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    projectId: z.string(),
    fileName: z.string(),
    downloadUrl: z.string(),
    fileSize: z.number(),
    editedAt: z.string(),
    message: z.string(),
    changedSections: z.array(z.string()).describe("List of sections that were modified"),
  }),
  
  execute: async (input) => {
    // Note: Actual editing logic happens in the API route
    // This tool validates the request and signals intent
    const { projectId, userId, editReason, ...updates } = input;
    
    // Determine which sections have changes
    const changedSections: string[] = [];
    
    if (updates.title) changedSections.push("title");
    if (updates.subject) changedSections.push("subject");
    if (updates.author) changedSections.push("author");
    if (updates.school) changedSections.push("school");
    if (updates.stage1) changedSections.push("Stage 1: Problem Identification");
    if (updates.stage2) changedSections.push("Stage 2: Investigation of Related Ideas");
    if (updates.stage3) changedSections.push("Stage 3: Generation of Solutions");
    if (updates.stage4) changedSections.push("Stage 4: Development/Refinement");
    if (updates.stage5) changedSections.push("Stage 5: Presentation of Results");
    if (updates.stage6) changedSections.push("Stage 6: Evaluation");
    if (updates.templateId) changedSections.push("template style");
    
    return {
      success: true,
      projectId,
      fileName: "", // Will be filled by API
      downloadUrl: "", // Will be filled by API
      fileSize: 0,
      editedAt: new Date().toISOString(),
      message: `Project edit requested for ${changedSections.length} section(s)`,
      changedSections,
    };
  },
});

export const regenerateProjectTool = createTool({
  id: "regenerateProject",
  description: `
    Regenerate an existing project's PDF with a new template style.
    The content stays the same, only the visual style changes.
    
    Use this when the user wants to:
    - Change the template/style of their project
    - Get a fresh PDF with updated formatting
    - Apply a different color scheme
    
    COSTS 1 CREDIT per regeneration.
  `,
  inputSchema: z.object({
    projectId: z.string().describe("The ID of the project to regenerate"),
    userId: z.string().describe("The user's ID for verification"),
    templateId: z.string().describe("The ID of the new template to use"),
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    projectId: z.string(),
    fileName: z.string(),
    downloadUrl: z.string(),
    fileSize: z.number(),
    regeneratedAt: z.string(),
    templateUsed: z.string(),
    message: z.string(),
  }),
  
  execute: async (input) => {
    const { projectId, templateId } = input;
    
    return {
      success: true,
      projectId,
      fileName: "", // Will be filled by API
      downloadUrl: "", // Will be filled by API
      fileSize: 0,
      regeneratedAt: new Date().toISOString(),
      templateUsed: templateId,
      message: `Project PDF will be regenerated with template ${templateId}`,
    };
  },
});
