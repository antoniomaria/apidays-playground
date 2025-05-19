import React from 'react';
import Row from './Row';

const RightWingSeats = () => {
  const rowCount = 35; // Total number of rows
  const letters = ['F', 'E', 'D']; // Letters for the seats

  return (
    <div className="seats">
      {Array.from({ length: rowCount }, (_, index) => (
        <Row
          key={index + 1}
          letters={letters}
          rowNumber={index + 1}
        />
      ))}
    </div>
  );
};

export default RightWingSeats;