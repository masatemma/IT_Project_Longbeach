import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import TitleLogo from './TitleLogo';

export default function Navbar() {
  return (
    <div className="w-100"> 
      <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{ backgroundColor: 'blue' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <TitleLogo/>
        </div>
      </nav>
    </div>
  );
}
