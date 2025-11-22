import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// POST - Add or toggle vote
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { voterId } = body;

    if (!voterId) {
      return NextResponse.json(
        { error: "voterId is required" },
        { status: 400 }
      );
    }

    const destinationId = params.id;

    // Check if destination exists
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
    });

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        destinationId_voterId: {
          destinationId,
          voterId,
        },
      },
    });

    let hasVoted: boolean;

    if (existingVote) {
      // Toggle: Remove vote if already voted
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      hasVoted = false;
    } else {
      // Add new vote
      await prisma.vote.create({
        data: {
          destinationId,
          voterId,
        },
      });
      hasVoted = true;
    }

    // Get updated vote count
    const voteCount = await prisma.vote.count({
      where: { destinationId },
    });

    return NextResponse.json({
      voteCount,
      hasVoted,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}

// DELETE - Remove vote
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const voterId = searchParams.get("voterId");

    if (!voterId) {
      return NextResponse.json(
        { error: "voterId is required" },
        { status: 400 }
      );
    }

    const destinationId = params.id;

    // Find and delete the vote
    const vote = await prisma.vote.findUnique({
      where: {
        destinationId_voterId: {
          destinationId,
          voterId,
        },
      },
    });

    if (vote) {
      await prisma.vote.delete({
        where: { id: vote.id },
      });
    }

    // Get updated vote count
    const voteCount = await prisma.vote.count({
      where: { destinationId },
    });

    return NextResponse.json({
      voteCount,
      hasVoted: false,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    );
  }
}
