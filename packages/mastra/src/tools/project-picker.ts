/**
 * Project Picker Tool
 *
 * This tool allows Tatenda to fetch and present existing projects
 * from the database for the user to edit or download again.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const pickProjectTool = createTool({
  id: "pickProject",
  description: `
    Fetch existing projects from the database for the current user.
    Use this tool when the user wants to:
    - See their previous projects
    - Edit an existing project
    - Download a project again
    - Work on a project they started before
    
    Returns a list of the user's projects with their details.
    After calling this, present the projects to the user and let them choose.
  `,
  inputSchema: z.object({
    userId: z.string().describe("The user's ID to fetch their projects"),
    subject: z.string().optional().describe("Filter by subject (e.g., 'Computer Science')"),
    limit: z.number().optional().default(10).describe("Maximum number of projects to return"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    projects: z.array(z.object({
      id: z.string(),
      title: z.string(),
      subject: z.string().nullable(),
      level: z.string().nullable(),
      author: z.string().nullable(),
      school: z.string().nullable(),
      downloadUrl: z.string().nullable(),
      createdAt: z.string(),
    })),
    message: z.string(),
  }),
  execute: async (input) => {
    // Note: Actual database call happens in the API route
    // This tool just signals the intent and validates the request
    const { userId, subject, limit } = input;
    
    return {
      success: true,
      projects: [], // Will be populated by the API
      message: `Fetching up to ${limit} projects for user${subject ? ` filtered by ${subject}` : ''}`,
    };
  },
});

export const showTemplatesTool = createTool({
  id: "showTemplates",
  description: `
    Show the available project templates to the user.
    Use this tool when:
    - The user is ready to generate a project and needs to pick a template style
    - The user asks about templates or document styles
    - After collecting all project details and before generating the PDF
    
    This triggers the frontend to display the template picker UI.
  `,
  inputSchema: z.object({
    message: z.string().optional().describe("Optional message to accompany the template picker"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async (input) => {
    return {
      success: true,
      message: input.message || "Please select a template style for your project",
    };
  },
});
