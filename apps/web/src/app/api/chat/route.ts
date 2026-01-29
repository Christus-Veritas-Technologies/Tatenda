import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { tatendaFreeAgent } from "@tatenda/mastra";
import prisma from "@tatenda/db";
import { DEFAULT_TEMPLATES } from "@tatenda/db/templates";

// Structured response types
export type MessageType = 
  | "normal" 
  | "pdf" 
  | "normal-with-pdf" 
  | "project" 
  | "normal-with-project"
  | "templates"           // Show template picker
  | "normal-with-templates"; // Text + template picker

export interface TemplateOption {
  id: string;
  name: string;
  description: string | null;
  previewColor: string;
}

export interface ChatResponse {
  messageType: MessageType;
  text: string | null;
  pdf: {
    url: string;
    name: string;
    size: string;
  } | null;
  project: {
    id: string;
    url: string;
    name: string;
    size: string;
    title: string;
    subject: string;
  } | null;
  templates: TemplateOption[] | null; // For template selection
}

export async function POST(request: Request) {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
        throw: true,
      },
    });

    if (!session?.user) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, userName, userEmail, threadId } = body as { 
      message: string; 
      userName: string; 
      userEmail: string;
      threadId: string;
    };

    if (!message) {
      return Response.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    if (!threadId) {
      return Response.json(
        { message: "Thread ID is required" },
        { status: 400 }
      );
    }

    console.log("[Chat] User:", userName, userEmail);
    console.log("[Chat] Thread ID:", threadId);
    console.log("[Chat] Message:", message);

    // Increment message count
    await fetch(`${request.url.split('/api/')[0]}/api/threads/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(err => console.error("[Chat] Failed to increment message count:", err));

    // Generate response with memory context (non-streaming for reliability)
    const response = await tatendaFreeAgent.generate(message, {
      memory: {
        thread: threadId,
        resource: session.user.id,
      },
    });

    console.log("[Chat] Response received:", {
      textLength: response.text?.length,
      toolCallsCount: response.toolCalls?.length || 0,
      toolResultsCount: (response as any).toolResults?.length || 0,
    });

    // Check for tool results
    let pdfResult: any = null;
    let projectResult: any = null;
    let showTemplates = false;
    const toolResults = (response as any).toolResults;
    
    if (toolResults && Array.isArray(toolResults)) {
      for (const item of toolResults) {
        const toolName = item.payload?.toolName;
        const result = item.payload?.result;
        
        console.log("[Chat] Checking tool result:", { toolName, success: result?.success });
        
        // Check for PDF generation
        if ((toolName === 'generatePDF' || toolName === 'generate-pdf') && result?.success) {
          pdfResult = result;
          console.log("[Chat] PDF generated:", pdfResult);
        }
        
        // Check for template selection trigger
        if ((toolName === 'showTemplates' || toolName === 'show-templates') && result?.success) {
          showTemplates = true;
          console.log("[Chat] Templates requested");
        }
        
        // Check for Project editing
        if ((toolName === 'editProject' || toolName === 'edit-project') && result?.success) {
          console.log("[Chat] Project edit requested");
          
          try {
            // Deduct 1 credit for editing
            await prisma.user.update({
              where: { id: session.user.id },
              data: { credits: { decrement: 1 } },
            });
            console.log("[Chat] Credit deducted for project editing");
          } catch (dbError) {
            console.error("[Chat] Failed to deduct credit for editing:", dbError);
          }
        }
        
        // Check for Project regeneration with new template
        if ((toolName === 'regenerateProject' || toolName === 'regenerate-project') && result?.success) {
          console.log("[Chat] Project regeneration requested");
          
          try {
            // Deduct 1 credit for regeneration
            await prisma.user.update({
              where: { id: session.user.id },
              data: { credits: { decrement: 1 } },
            });
            console.log("[Chat] Credit deducted for project regeneration");
            
            // Increment template usage if one was specified
            const templateId = item.payload?.args?.templateId;
            if (templateId) {
              await prisma.template.update({
                where: { id: templateId },
                data: { usageCount: { increment: 1 } },
              }).catch(() => {});
            }
          } catch (dbError) {
            console.error("[Chat] Failed to process regeneration:", dbError);
          }
        }
        
        // Check for Project generation
        if ((toolName === 'generateProject' || toolName === 'generate-project') && result?.success) {
          projectResult = result;
          console.log("[Chat] Project generated:", projectResult);
          
          // Extract project args
          const projectArgs = item.payload?.args;
          
          // Save project to database with all metadata
          try {
            const savedProject = await prisma.project.create({
              data: {
                id: projectResult.projectId,
                title: projectArgs?.title || "Untitled Project",
                description: projectArgs?.stage1?.statementOfIntent || null,
                subject: projectArgs?.subject || null,
                level: projectArgs?.level || null,
                author: projectArgs?.author || session.user.name || null,
                school: projectArgs?.school || null,
                fileName: projectResult.fileName,
                downloadUrl: projectResult.downloadUrl,
                fileSize: projectResult.fileSize,
                templateId: projectArgs?.templateId || null,
                content: JSON.stringify({
                  createdAt: projectResult.createdAt,
                  stages: {
                    stage1: projectArgs?.stage1,
                    stage2: projectArgs?.stage2,
                    stage3: projectArgs?.stage3,
                    stage4: projectArgs?.stage4,
                    stage5: projectArgs?.stage5,
                    stage6: projectArgs?.stage6,
                  },
                }),
                userId: session.user.id,
              },
            });
            console.log("[Chat] Project saved to DB:", savedProject.id);
            
            // Deduct 1 credit for project generation
            await prisma.user.update({
              where: { id: session.user.id },
              data: { credits: { decrement: 1 } },
            });
            console.log("[Chat] Credit deducted for project generation");
            
            // Increment template usage if one was used
            if (projectArgs?.templateId) {
              await prisma.template.update({
                where: { id: projectArgs.templateId },
                data: { usageCount: { increment: 1 } },
              }).catch(() => {}); // Ignore if template doesn't exist
            }
          } catch (dbError) {
            console.error("[Chat] Failed to save project to DB:", dbError);
          }
        }
      }
    }
    
    // Check if AI response mentions picking a template (heuristic detection)
    const responseText = response.text?.toLowerCase() || '';
    const templateKeywords = ['pick a template', 'choose a template', 'select a template', 'which template'];
    if (templateKeywords.some(keyword => responseText.includes(keyword))) {
      showTemplates = true;
    }

    // Format file size helper
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    // Get templates if needed
    let templates: TemplateOption[] | null = null;
    if (showTemplates) {
      templates = DEFAULT_TEMPLATES.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        previewColor: t.previewColor,
      }));
    }

    // Determine message type
    let messageType: MessageType = "normal";
    if (projectResult) {
      messageType = response.text ? "normal-with-project" : "project";
    } else if (pdfResult) {
      messageType = response.text ? "normal-with-pdf" : "pdf";
    } else if (showTemplates) {
      messageType = response.text ? "normal-with-templates" : "templates";
    }

    // Build structured response
    const chatResponse: ChatResponse = {
      messageType,
      text: response.text || null,
      pdf: pdfResult ? {
        url: pdfResult.downloadUrl,
        name: pdfResult.fileName,
        size: formatFileSize(pdfResult.fileSize),
      } : null,
      project: projectResult ? {
        id: projectResult.projectId,
        url: projectResult.downloadUrl,
        name: projectResult.fileName,
        size: formatFileSize(projectResult.fileSize),
        title: (toolResults?.find((t: any) => t.payload?.toolName === 'generateProject')?.payload?.args?.title) || "Project",
        subject: (toolResults?.find((t: any) => t.payload?.toolName === 'generateProject')?.payload?.args?.subject) || "General",
      } : null,
      templates,
    };

    console.log("[Chat] Sending response:", {
      messageType: chatResponse.messageType,
      hasText: !!chatResponse.text,
      hasPdf: !!chatResponse.pdf,
      hasProject: !!chatResponse.project,
      hasTemplates: !!chatResponse.templates,
    });

    return Response.json(chatResponse);

  } catch (error) {
    console.error("[Chat] Error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return error as structured response
    const errorResponse: ChatResponse = {
      messageType: "normal",
      text: "We couldn't process your message. Please try again.",
      pdf: null,
      project: null,
      templates: null,
    };

    return Response.json(errorResponse, { status: 500 });
  }
}
