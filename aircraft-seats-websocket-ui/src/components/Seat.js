import React, { useEffect, useState } from 'react';
import { gql, useSubscription } from '@apollo/client';

const SEAT_STATUS_SUBSCRIPTION = gql`
  subscription Subscription {
    seatStatusUpdated {
      seatLetter
      rowNumber
      occupied
    }
  }
`;

const Seat = ({ rowNumber, letter }) => {
  const [isOccupied, setIsOccupied] = useState(false);

  const { loading, error, data } = useSubscription(SEAT_STATUS_SUBSCRIPTION);

  useEffect(() => {
    console.log('Subscription data:', data);
    console.log('Row number:', rowNumber);
    console.log('Seat letter:', letter);
    if (
      data &&
      data.seatStatusUpdated &&
      data.seatStatusUpdated.rowNumber === rowNumber &&
      data.seatStatusUpdated.seatLetter === letter
    ) {
      setIsOccupied(data.seatStatusUpdated.occupied);
    }
  }, [data, rowNumber, letter]);

  return (
    <div
      {...(rowNumber === 1 && { 'data-letter': letter })} // Conditionally add data-letter
      className={`${isOccupied ? 'active' : 'empty'} seat`}
    ></div>
  );
};

export default Seat;