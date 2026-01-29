import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import prisma from "@tatenda/db";
import { DEFAULT_TEMPLATES } from "@tatenda/db/templates";

export interface TemplateResponse {
  id: string;
  name: string;
  description: string | null;
  previewColor: string;
  isDefault: boolean;
  isPublic: boolean;
  usageCount: number;
}

export async function GET(request: Request) {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });

    // Fetch templates from database
    const dbTemplates = await prisma.template.findMany({
      where: {
        OR: [
          { isPublic: true },
          { userId: session?.user?.id },
        ],
      },
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
      ],
    });

    // If no templates in DB, return the default ones
    if (dbTemplates.length === 0) {
      const defaultTemplates: TemplateResponse[] = DEFAULT_TEMPLATES.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        previewColor: t.previewColor,
        isDefault: true,
        isPublic: true,
        usageCount: 0,
      }));
      return Response.json({ templates: defaultTemplates });
    }

    // Map DB templates with preview colors from defaults
    const templates: TemplateResponse[] = dbTemplates.map(t => {
      const defaultMatch = DEFAULT_TEMPLATES.find(d => d.id === t.id);
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        previewColor: defaultMatch?.previewColor || '#7148FC',
        isDefault: t.isDefault,
        isPublic: t.isPublic,
        usageCount: t.usageCount,
      };
    });

    return Response.json({ templates });
  } catch (error) {
    console.error("[Templates] Error:", error);
    return Response.json(
      { message: "Failed to fetch templates" },
      { status: 500 }
    );
  }
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
    const { name, description, colorScheme, structure } = body;

    if (!name || !colorScheme || !structure) {
      return Response.json(
        { message: "Name, colorScheme, and structure are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        colorScheme: JSON.stringify(colorScheme),
        structure: JSON.stringify(structure),
        isDefault: false,
        isPublic: false, // User templates are private by default
        userId: session.user.id,
      },
    });

    return Response.json({ template });
  } catch (error) {
    console.error("[Templates] Error creating template:", error);
    return Response.json(
      { message: "Failed to create template" },
      { status: 500 }
    );
  }
}
