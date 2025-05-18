import React from 'react';

const Row = ({ letters, rowNumber }) => {
  return (
    <div
      className={`seats-triple ${rowNumber === 1 ? 'first-line' : ''}`}
      data-line={rowNumber}
    >
      {letters.map((letter, index) => (
        <div
          key={index}
          data-letter={letter}
          className={`${letter === 'A' || letter === 'B' || letter === 'C' ? 'active' : 'empty'} seat`}
        ></div>
      ))}
    </div>
  );
};

export default Row;