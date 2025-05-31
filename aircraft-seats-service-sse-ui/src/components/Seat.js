import React, { useEffect, useState } from 'react';
import { gql, useSubscription, useMutation } from '@apollo/client';

// GraphQL subscription for seat status updates
const SEAT_STATUS_SUBSCRIPTION = gql`
  subscription Subscription {
    seatStatusUpdated {
      seatLetter
      rowNumber
      occupied
    }
  }
`;

// GraphQL mutation for updating seat status
const UPDATE_SEAT_STATUS_MUTATION = gql`
  mutation UpdateSeatStatus($rowNumber: Int!, $seatLetter: String!, $occupied: Boolean!) {
    updateSeatStatus(rowNumber: $rowNumber, seatLetter: $seatLetter, occupied: $occupied)
  }
`;

const Seat = ({ rowNumber, letter }) => {
  const [isOccupied, setIsOccupied] = useState(false);

  // Subscription to listen for seat status updates
  const { loading, error, data } = useSubscription(SEAT_STATUS_SUBSCRIPTION);

  // Mutation to update seat status
  const [updateSeatStatus] = useMutation(UPDATE_SEAT_STATUS_MUTATION);

  useEffect(() => {
    if (loading) return;
    if (error) {
      console.error('Error in subscription:', error);
      return;
    }
    if (
      data &&
      data.seatStatusUpdated &&
      data.seatStatusUpdated.rowNumber === rowNumber &&
      data.seatStatusUpdated.seatLetter === letter
    ) {
      setIsOccupied(data.seatStatusUpdated.occupied);
    }
  }, [data, rowNumber, letter, loading, error]);

  // Handle seat click
  const handleSeatClick = () => {
    updateSeatStatus({
      variables: {
        rowNumber,
        seatLetter: letter,
        occupied: !isOccupied, // Toggle the occupied status
      },
    })
      .then(() => {
        console.log(`Seat ${letter}${rowNumber} status updated successfully.`);
        setIsOccupied(!isOccupied); // Optimistically update the UI
      })
      .catch((err) => {
        console.error('Error updating seat status:', err);
      });
  };

  return (
    <div
      {...(rowNumber === 1 && { 'data-letter': letter })} // Conditionally add data-letter
      className={`${isOccupied ? 'active' : 'empty'} seat`}
      onClick={handleSeatClick} // Add click handler
    ></div>
  );
};

export default Seat;