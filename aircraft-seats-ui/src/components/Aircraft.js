import React from 'react';
import LeftWingSeats from './LeftWingSeats';
import RightWingSeats from './RightWingSeats';

const Aircraft = () => {
  return (
    <div className="aircraft">
  <div className="aircraft-body">
    <div className="top-left-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" />
    </div>
    <div className="top-right-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" />
    </div>
    <RightWingSeats />
    <LeftWingSeats />
    
    <div className="bottom-left-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" />
    </div>
    <div className="bottom-right-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" />
    </div>
    <div className="aircraft-top-wing">
      <div className="exists">
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" /></div>
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" /></div>
      </div>
    </div>
    <div className="aircraft-bottom-wing">
      <div className="exists">
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" /></div>
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png" alt="" /></div>
      </div>
    </div>
    <div className="aircraft-head">
      <div className="aircraft-head-body">
        <div className="windows">
          <img src="https://i.ibb.co/F5hp29L/windows.png" alt="" />
        </div>
        <div className="front-lavatory">
          <img src="https://i.ibb.co/NVT4SZ1/lavatory.png" alt="" />
        </div>
      </div>

    </div>
    <div className="aircraft-tail">
      <div className="aircraft-tail-body">
        <div className="back-lavatory">
          <img src="https://i.ibb.co/NVT4SZ1/lavatory.png" alt="" />

          <img src="https://i.ibb.co/NVT4SZ1/lavatory.png" alt="" />
        </div>
      </div>
    </div>
  </div>

</div>

  );
};

export default Aircraft;