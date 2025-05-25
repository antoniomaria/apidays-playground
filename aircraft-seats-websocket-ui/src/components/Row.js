import React from 'react';
import Seat from './Seat';

const Row = ({ letters, rowNumber, showRowNumber }) => {

  return (
    <div
      className={`seats-triple ${rowNumber === 1 ? 'first-line' : ''}`}
      {...(showRowNumber ? { 'data-line': rowNumber } : {})}
    >
      {letters.map((letter, index) => (
        <Seat key={index} rowNumber={rowNumber} letter={letter} />
      ))}
    </div>
  );
};

export default Row;