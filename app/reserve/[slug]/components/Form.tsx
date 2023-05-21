"use client";

import { ChangeEvent, useEffect, useState } from "react";
import useReservation from "../../../../hooks/useReservation";
import { CircularProgress } from "@mui/material";

export default function ({
  date,
  partySize,
  slug,
}: {
  date: string;
  partySize: string;
  slug: string;
}) {
  const [inputs, setInputs] = useState({
    bookerFirstName: "",
    bookerLastName: "",
    bookerEmail: "",
    bookerPhone: "",
    bookerOccasion: "",
    bookerRequest: "",
  });

  const [disabled, setDisabled] = useState(true);

  const [didBook, setDidBook] = useState(false);

  const [day, time] = date.split("T");

  const { loading, error, createReservation } = useReservation();

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  const handleClick = () => {
    createReservation({
      day,
      time,
      partySize,
      slug,
      bookerFirstName: inputs.bookerFirstName,
      bookerLastName: inputs.bookerLastName,
      bookerEmail: inputs.bookerEmail,
      bookerPhone: inputs.bookerPhone,
      bookerOccasion: inputs.bookerOccasion,
      bookerRequest: inputs.bookerRequest,
      setDidBook,
    });
  };

  useEffect(() => {
    if (
      inputs.bookerFirstName &&
      inputs.bookerLastName &&
      inputs.bookerEmail &&
      inputs.bookerPhone
    ) {
      return setDisabled(false);
    }
    return setDisabled(true);
  }, [inputs]);

  return (
    <div className="mt-10 flex flex-wrap justify-between w-[660px]">
      {didBook ? (
        <div>
          <h1>You are all booked up</h1>
          <p>Enjoy your reservation</p>
        </div>
      ) : (
        <>
          <input
            type="text"
            className="border rounded p-3 w-80 mb-4"
            placeholder="First name"
            name="bookerFirstName"
            onChange={handleChangeInput}
          />
          <input
            type="text"
            className="border rounded p-3 w-80 mb-4"
            placeholder="Last name"
            name="bookerLastName"
            onChange={handleChangeInput}
          />
          <input
            type="text"
            className="border rounded p-3 w-80 mb-4"
            placeholder="Phone number"
            name="bookerPhone"
            onChange={handleChangeInput}
          />
          <input
            type="text"
            className="border rounded p-3 w-80 mb-4"
            placeholder="Email"
            name="bookerEmail"
            onChange={handleChangeInput}
          />
          <input
            type="text"
            className="border rounded p-3 w-80 mb-4"
            placeholder="Occasion (optional)"
            name="bookerOccasion"
            onChange={handleChangeInput}
          />
          <input
            type="text"
            className="border rounded p-3 w-80 mb-4"
            placeholder="Requests (optional)"
            name="bookerRequest"
            onChange={handleChangeInput}
          />
          <button
            className="bg-red-600 w-full p-3 text-white font-bold rounded disabled:bg-gray-300"
            disabled={disabled || loading}
            onClick={handleClick}
          >
            {loading ? (
              <CircularProgress color="inherit" />
            ) : (
              "Complete reservation"
            )}
          </button>
          <p className="mt-4 text-sm">
            By clicking “Complete reservation” you agree to the OpenTable Terms
            of Use and Privacy Policy. Standard text message rates may apply.
            You may opt out of receiving text messages at any time.
          </p>
        </>
      )}
    </div>
  );
}
