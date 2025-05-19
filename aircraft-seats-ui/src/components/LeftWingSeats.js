import React from 'react';
import Row from './Row';

const LeftWingSeats = () => {
  const rowCount = 35; // Total number of rows
  const letters = ['C', 'B', 'A']; // Letters for the first row
  const rows = [];

  for (let i = 1; i <= rowCount; i++) {
    rows.push({ letters: i === 1 ? letters : [' ', ' ', ' '], rowNumber: i }); // Include letters only for the first row
  }

  return (
    <div className="seats">
      {rows.map((row, index) => (
        <Row
          key={index}
          letters={row.letters}
          rowNumber={row.rowNumber}
        />
      ))}
    </div>
  );
};

export default LeftWingSeats;