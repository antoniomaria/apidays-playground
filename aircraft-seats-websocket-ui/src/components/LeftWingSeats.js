import React from 'react';
import Row from './Row';

const LeftWingSeats = () => {
  const rowCount = 35; // Total number of rows
  const letters = ['A', 'B', 'C']; // Letters for the seats

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

export default LeftWingSeats;