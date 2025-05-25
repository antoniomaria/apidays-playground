import React from 'react';
import Row from './Row';

const WingSeats = ({ rowCount, letters, showRowNumber }) => {
  return (
    <div className="seats">
      {Array.from({ length: rowCount }, (_, index) => (
        <Row
          key={index + 1}
          letters={letters}
          rowNumber={index + 1}
          showRowNumber={showRowNumber}
        />
      ))}
    </div>
  );
};

export default WingSeats;