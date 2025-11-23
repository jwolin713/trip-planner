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
        priceRange: "MODERATE",
        distanceFromHoustonMiles: 810,
        flightDurationHours: 2.1,
        distanceFromBostonMiles: 1550,
        flightDurationFromBostonHours: 4.2
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
        priceRange: "BUDGET",
        distanceFromHoustonMiles: 170,
        flightDurationHours: 0, // driving
        distanceFromBostonMiles: 1765,
        flightDurationFromBostonHours: 4.5
      },
      {
        name: "Kiawah Island",
        type: "RESORT",
        imageUrl: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg",
        propertyUrl: null,
        notes: "Luxury beach resort with world-class golf courses and pristine beaches.",
        airportCode: "CHS",
        distanceFromAirportMiles: 28,
        driveTimeFromAirportMin: 40,
        avgHighTempF: 88,
        avgLowTempF: 76,
        weatherSummary: "Warm and pleasant in early August, ideal for outdoor activities.",
        priceRange: "LUXURY",
        distanceFromHoustonMiles: 920,
        flightDurationHours: 2.4,
        distanceFromBostonMiles: 840,
        flightDurationFromBostonHours: 2.3
      },
      {
        name: "Riviera Maya",
        type: "RESORT",
        imageUrl: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg",
        propertyUrl: null,
        notes: "Beautiful Caribbean beaches, Mayan ruins, and all-inclusive resorts.",
        airportCode: "CUN",
        distanceFromAirportMiles: 35,
        driveTimeFromAirportMin: 50,
        avgHighTempF: 91,
        avgLowTempF: 78,
        weatherSummary: "Hot and sunny in early August, typical of warm climate destinations.",
        priceRange: "EXPENSIVE",
        distanceFromHoustonMiles: 850,
        flightDurationHours: 2.2,
        distanceFromBostonMiles: 1600,
        flightDurationFromBostonHours: 4.3
      },
      {
        name: "Palm Springs",
        type: "VACATION_RENTAL",
        imageUrl: "https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg",
        propertyUrl: null,
        notes: "Desert oasis with mid-century modern style, pools, and mountain views.",
        airportCode: "PSP",
        distanceFromAirportMiles: 5,
        driveTimeFromAirportMin: 15,
        avgHighTempF: 107,
        avgLowTempF: 82,
        weatherSummary: "Hot and sunny in early August, typical of warm climate destinations.",
        priceRange: "EXPENSIVE",
        distanceFromHoustonMiles: 1370,
        flightDurationHours: 3.4,
        distanceFromBostonMiles: 2600,
        flightDurationFromBostonHours: 6.2
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
