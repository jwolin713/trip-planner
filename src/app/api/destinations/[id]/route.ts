import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

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

    const updated = await prisma.destination.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update destination." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.destination.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete destination." },
      { status: 500 }
    );
  }
}
