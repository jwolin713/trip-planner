import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const voterId = searchParams.get("voterId");

  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        votes: voterId ? {
          where: { voterId },
          select: { id: true }
        } : false,
        _count: {
          select: { votes: true, comments: true }
        }
      }
    });

    // Transform the response to include voteCount, commentCount, and hasVoted
    const destinationsWithVotes = destinations.map(dest => ({
      ...dest,
      voteCount: dest._count.votes,
      commentCount: dest._count.comments,
      hasVoted: voterId ? dest.votes.length > 0 : false,
      // Remove the internal fields
      votes: undefined,
      _count: undefined,
    }));

    return NextResponse.json(destinationsWithVotes);
  } catch (error) {
    // Fallback: If Vote table doesn't exist yet, return destinations without vote data
    console.error("Error fetching with votes, falling back to simple query:", error);

    const destinations = await prisma.destination.findMany({
      orderBy: { createdAt: "desc" }
    });

    // Add default vote and comment data
    const destinationsWithDefaults = destinations.map(dest => ({
      ...dest,
      voteCount: 0,
      commentCount: 0,
      hasVoted: false,
    }));

    return NextResponse.json(destinationsWithDefaults);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      type,
      imageUrl,
      propertyUrl,
      notes,
      airportCode,
      distanceFromAirportMiles,
      driveTimeFromAirportMin,
      avgHighTempF,
      avgLowTempF,
      weatherSummary,
      priceRange,
      distanceFromHoustonMiles,
      flightDurationHours,
      distanceFromBostonMiles,
      flightDurationFromBostonHours,
      bedrooms,
      bathrooms
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required." },
        { status: 400 }
      );
    }

    if (!["RESORT", "VACATION_RENTAL"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid destination type." },
        { status: 400 }
      );
    }

    const created = await prisma.destination.create({
      data: {
        name,
        type,
        imageUrl: imageUrl || null,
        propertyUrl: propertyUrl || null,
        notes: notes || null,
        airportCode: airportCode || null,
        distanceFromAirportMiles:
          typeof distanceFromAirportMiles === "number"
            ? distanceFromAirportMiles
            : distanceFromAirportMiles
            ? parseFloat(distanceFromAirportMiles)
            : null,
        driveTimeFromAirportMin:
          typeof driveTimeFromAirportMin === "number"
            ? driveTimeFromAirportMin
            : driveTimeFromAirportMin
            ? parseInt(driveTimeFromAirportMin, 10)
            : null,
        avgHighTempF:
          typeof avgHighTempF === "number"
            ? avgHighTempF
            : avgHighTempF
            ? parseFloat(avgHighTempF)
            : null,
        avgLowTempF:
          typeof avgLowTempF === "number"
            ? avgLowTempF
            : avgLowTempF
            ? parseFloat(avgLowTempF)
            : null,
        weatherSummary: weatherSummary || null,
        priceRange: priceRange || null,
        distanceFromHoustonMiles:
          typeof distanceFromHoustonMiles === "number"
            ? distanceFromHoustonMiles
            : distanceFromHoustonMiles
            ? parseFloat(distanceFromHoustonMiles)
            : null,
        flightDurationHours:
          typeof flightDurationHours === "number"
            ? flightDurationHours
            : flightDurationHours
            ? parseFloat(flightDurationHours)
            : null,
        distanceFromBostonMiles:
          typeof distanceFromBostonMiles === "number"
            ? distanceFromBostonMiles
            : distanceFromBostonMiles
            ? parseFloat(distanceFromBostonMiles)
            : null,
        flightDurationFromBostonHours:
          typeof flightDurationFromBostonHours === "number"
            ? flightDurationFromBostonHours
            : flightDurationFromBostonHours
            ? parseFloat(flightDurationFromBostonHours)
            : null,
        bedrooms:
          typeof bedrooms === "number"
            ? bedrooms
            : bedrooms
            ? parseInt(bedrooms, 10)
            : null,
        bathrooms:
          typeof bathrooms === "number"
            ? bathrooms
            : bathrooms
            ? parseInt(bathrooms, 10)
            : null
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create destination." },
      { status: 500 }
    );
  }
}
