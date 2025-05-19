import React, { useState } from 'react';

const Seat = ({ seatNumber, letter }) => {
  const [isActive, setIsActive] = useState(false); // Initial state is false

  const toggleSeat = () => {
    setIsActive((prevState) => !prevState); // Toggle active state
  };

  return (    
    <div
      data-letter={letter}
      className={`${isActive ? 'active' : 'empty'} seat`}
      onClick={toggleSeat} // Toggle seat state on click
    ></div>
  );
};

export default Seat;