import React from 'react';
import Seat from './Seat';

const Row = ({ letters, rowNumber }) => {
  return (
    <div
      className={`seats-triple ${rowNumber === 1 ? 'first-line' : ''}`}
      data-line={rowNumber}
    >
      {letters.map((letter, index) => (
        <Seat key={index} seatNumber={index} letter={letter} />
      ))}
    </div>
  );
};

export default Row;