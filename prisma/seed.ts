import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.destination.deleteMany();

  await prisma.destination.createMany({
    data: [
      {
        name: "Cancun All-Inclusive Resort",
        type: "RESORT",
        imageUrl: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg",
        propertyUrl: "https://example.com/cancun-resort",
        notes: "Beachfront, all-inclusive, easy flights from Houston.",
        airportCode: "CUN",
        distanceFromAirportMiles: 12,
        driveTimeFromAirportMin: 25,
        avgHighTempF: 90,
        avgLowTempF: 77,
        weatherSummary: "Hot and sunny in early August, typical of warm climate destinations.",
        nightlyCostTotalUsd: 2500,
        nightlyCostPerPersonUsd: 170,
        distanceFromHoustonMiles: 810,
        flightDurationHours: 2.1
      },
      {
        name: "Hill Country Ranch House",
        type: "VACATION_RENTAL",
        imageUrl: "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
        propertyUrl: "https://example.com/hill-country-ranch",
        notes: "Quiet ranch house with pool and fire pit.",
        airportCode: "AUS",
        distanceFromAirportMiles: 45,
        driveTimeFromAirportMin: 55,
        avgHighTempF: 98,
        avgLowTempF: 75,
        weatherSummary: "Hot and sunny in early August, typical of warm climate destinations.",
        nightlyCostTotalUsd: 1200,
        nightlyCostPerPersonUsd: 80,
        distanceFromHoustonMiles: 170,
        flightDurationHours: 0 // driving
      }
    ]
  });

  console.log("Seeded destinations.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
