import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { commentId } = params;
    const body = await request.json();
    const { content, authorName } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required." },
        { status: 400 }
      );
    }

    // Verify the comment exists and belongs to this author
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    if (existingComment.authorName !== authorName) {
      return NextResponse.json(
        { error: "You can only edit your own comments." },
        { status: 403 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content }
    });

    return NextResponse.json(updatedComment);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update comment." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { commentId } = params;
    const { searchParams } = new URL(request.url);
    const authorName = searchParams.get("authorName");

    if (!authorName) {
      return NextResponse.json(
        { error: "Author name is required." },
        { status: 400 }
      );
    }

    // Verify the comment exists and belongs to this author
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    if (existingComment.authorName !== authorName) {
      return NextResponse.json(
        { error: "You can only delete your own comments." },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete comment." },
      { status: 500 }
    );
  }
}
