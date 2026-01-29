import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { authClient } from "@/lib/auth-client";
import prisma from "@tatenda/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return Response.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    return Response.json({
      template: {
        ...template,
        colorScheme: JSON.parse(template.colorScheme),
        structure: JSON.parse(template.structure),
      },
    });
  } catch (error) {
    console.error("[Templates] Error fetching template:", error);
    return Response.json(
      { message: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, colorScheme, structure, isPublic } = body;

    // Find the template
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return Response.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Check ownership (only owner can edit, unless it's a system template)
    if (template.userId && template.userId !== session.user.id) {
      return Response.json(
        { message: "Not authorized to edit this template" },
        { status: 403 }
      );
    }

    // System templates cannot be edited
    if (template.isDefault) {
      return Response.json(
        { message: "System templates cannot be edited" },
        { status: 403 }
      );
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(colorScheme && { colorScheme: JSON.stringify(colorScheme) }),
        ...(structure && { structure: JSON.stringify(structure) }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return Response.json({
      template: {
        ...updated,
        colorScheme: JSON.parse(updated.colorScheme),
        structure: JSON.parse(updated.structure),
      },
    });
  } catch (error) {
    console.error("[Templates] Error updating template:", error);
    return Response.json(
      { message: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Find the template
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return Response.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (template.userId && template.userId !== session.user.id) {
      return Response.json(
        { message: "Not authorized to delete this template" },
        { status: 403 }
      );
    }

    // System templates cannot be deleted
    if (template.isDefault) {
      return Response.json(
        { message: "System templates cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.template.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Templates] Error deleting template:", error);
    return Response.json(
      { message: "Failed to delete template" },
      { status: 500 }
    );
  }
}
