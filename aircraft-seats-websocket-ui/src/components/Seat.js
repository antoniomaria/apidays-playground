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

const Seat = ({ rowNumber, seatLetter }) => {
  const [isOccupied, setIsOccupied] = useState(false);

  const { loading, error, data } = useSubscription(SEAT_STATUS_SUBSCRIPTION);

  useEffect(() => {
    console.log('Subscription data:', data);
    console.log('Row number:', rowNumber);
    console.log('Seat letter:', seatLetter);
    if (
      data &&
      data.seatStatusUpdated &&
      data.seatStatusUpdated.rowNumber === rowNumber &&
      data.seatStatusUpdated.seatLetter === seatLetter
    ) {
      setIsOccupied(data.seatStatusUpdated.occupied);
    }
  }, [data, rowNumber, seatLetter]);

  return (
    <div
      data-letter={seatLetter}
      className={`${isOccupied ? 'active' : 'empty'} seat`}
    ></div>
  );
};

export default Seat;