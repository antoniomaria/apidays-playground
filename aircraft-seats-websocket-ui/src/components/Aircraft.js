import React from 'react';
import LeftWingSeats from './LeftWingSeats';
import RightWingSeats from './RightWingSeats';

const Aircraft = () => {
  return (
    <div className="aircraft">
  <div className="aircraft-body">
    <div className="top-left-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png"/>
    </div>
    <div className="top-right-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png"/>
    </div>
    <RightWingSeats />
    <LeftWingSeats />
    
    <div className="bottom-left-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png"/>
    </div>
    <div className="bottom-right-exists">
      <img src="https://i.ibb.co/ftwgLCL/exist.png"/>
    </div>
    <div className="aircraft-top-wing">
      <div className="exists">
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png"/></div>
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png"/></div>
      </div>
    </div>
    <div className="aircraft-bottom-wing">
      <div className="exists">
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png"/></div>
        <div><img src="https://i.ibb.co/ftwgLCL/exist.png"/></div>
      </div>
    </div>
    <div className="aircraft-head">
      <div className="aircraft-head-body">
        <div className="windows">
          <img src="https://i.ibb.co/F5hp29L/windows.png"/>
        </div>
        <div className="front-lavatory">
          <img src="https://i.ibb.co/NVT4SZ1/lavatory.png"/>
        </div>
      </div>

    </div>
    <div className="aircraft-tail">
      <div className="aircraft-tail-body">
        <div className="back-lavatory">
          <img src="https://i.ibb.co/NVT4SZ1/lavatory.png"/>

          <img src="https://i.ibb.co/NVT4SZ1/lavatory.png"/>
        </div>
      </div>
    </div>
  </div>

</div>

  );
};

export default Aircraft;