import validator from "validator";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { findAvailableTables } from "../../../../services/restaurant/findAvailableTables";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { slug, day, time, partySize } = req.query as {
      slug: string;
      day: string;
      time: string;
      partySize: string;
    };

    const {
      bookerFirstName,
      bookerLastName,
      bookerEmail,
      bookerPhone,
      bookerOccasion,
      bookerRequest,
    } = req.body;

    const errors: string[] = [];

    const validatorSchema = [
      {
        valid: validator.isLength(bookerFirstName, { min: 1, max: 20 }),
        errorMessage: "First Name is invalid",
      },
      {
        valid: validator.isLength(bookerLastName, { min: 1, max: 20 }),
        errorMessage: "Last Name is invalid",
      },
      {
        valid: validator.isEmail(bookerEmail),
        errorMessage: "Email is invalid",
      },
      {
        valid: validator.isMobilePhone(bookerPhone),
        errorMessage: "Phone is invalid",
      },
    ];

    validatorSchema.forEach(check => {
      if (!check.valid) {
        errors.push(check.errorMessage);
      }
    });

    if (errors.length) {
      console.log(errors);
      return res.status(400).json({ errorMessage: errors[0] });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        open_time: true,
        close_time: true,
        tables: true,
      },
    });

    if (!restaurant) {
      return res.status(400).json({
        errorMessage: "Restaurant is not found",
      });
    }

    if (
      new Date(`${day}T${time}`) < new Date(`${day}T${restaurant.open_time}`) ||
      new Date(`${day}T${time}`) > new Date(`${day}T${restaurant.close_time}`)
    ) {
      return res.status(400).json({
        errorMessage: "Restaurant is not open at that time",
      });
    }

    const searchTimesWithTables = await findAvailableTables({
      day,
      time,
      res,
      restaurant,
    });

    if (!searchTimesWithTables) {
      return res.status(400).json({
        errorMessage: "Invalid data provided",
      });
    }

    const searchTimeWithTables = searchTimesWithTables.find(t => {
      return (
        t.datetime.toISOString() === new Date(`${day}T${time}`).toISOString()
      );
    });

    if (!searchTimeWithTables) {
      return res.status(400).json({
        errorMessage: "No availability, cannot book",
      });
    }

    const tablesCount: { 2: number[]; 4: number[] } = {
      2: [],
      4: [],
    };
    searchTimeWithTables.tables.map(table => {
      if (table.seats === 2) {
        tablesCount[2].push(table.id);
      } else {
        tablesCount[4].push(table.id);
      }
    });

    const tablesToBook: number[] = [];
    let seatsRemaining = parseInt(partySize);

    while (seatsRemaining > 0) {
      if (seatsRemaining >= 3) {
        if (tablesCount[4].length) {
          tablesToBook.push(tablesCount[4][0]);
          tablesCount[4].shift();
          seatsRemaining -= 4;
        } else {
          tablesToBook.push(tablesCount[2][0]);
          tablesCount[2].shift();
          seatsRemaining -= 2;
        }
      } else {
        if (tablesCount[2].length) {
          tablesToBook.push(tablesCount[2][0]);
          tablesCount[2].shift();
          seatsRemaining -= 2;
        } else {
          tablesToBook.push(tablesCount[4][0]);
          tablesCount[4].shift();
          seatsRemaining -= 4;
        }
      }
    }

    const booking = await prisma.booking.create({
      data: {
        number_of_people: parseInt(partySize),
        booking_time: new Date(`${day}T${time}`),
        booker_first_name: bookerFirstName,
        booker_last_name: bookerLastName,
        booker_email: bookerEmail,
        booker_phone: bookerPhone,
        booker_occasion: bookerOccasion,
        booker_request: bookerRequest,
        restaurant_id: restaurant.id,
      },
    });

    const bookingsOnTablesData = tablesToBook.map(table_id => {
      return {
        booking_id: booking.id,
        table_id,
      };
    });

    await prisma.bookingsOnTables.createMany({
      data: bookingsOnTablesData,
    });

    return res.json({ booking });
  }
}
