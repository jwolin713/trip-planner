import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const comments = await prisma.comment.findMany({
      where: { destinationId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(comments);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, authorName } = body;

    if (!content || !authorName) {
      return NextResponse.json(
        { error: "Content and author name are required." },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        destinationId: id,
        content,
        authorName
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create comment." },
      { status: 500 }
    );
  }
}
