import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const destinations = await prisma.destination.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(destinations);
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
      nightlyCostTotalUsd,
      nightlyCostPerPersonUsd,
      distanceFromHoustonMiles,
      flightDurationHours
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
        nightlyCostTotalUsd:
          typeof nightlyCostTotalUsd === "number"
            ? nightlyCostTotalUsd
            : nightlyCostTotalUsd
            ? parseFloat(nightlyCostTotalUsd)
            : null,
        nightlyCostPerPersonUsd:
          typeof nightlyCostPerPersonUsd === "number"
            ? nightlyCostPerPersonUsd
            : nightlyCostPerPersonUsd
            ? parseFloat(nightlyCostPerPersonUsd)
            : null,
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
