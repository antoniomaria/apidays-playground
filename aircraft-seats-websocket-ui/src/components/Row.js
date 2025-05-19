import React from 'react';
import Seat from './Seat';

const Row = ({ letters, rowNumber }) => {
  return (
    <div
      className={`seats-triple ${rowNumber === 1 ? 'first-line' : ''}`}
      data-line={rowNumber}
    >
      {letters.map((letter, index) => (
        <Seat key={index} rowNumber={index} seatLetter={letter} />
      ))}
    </div>
  );
};

export default Row;