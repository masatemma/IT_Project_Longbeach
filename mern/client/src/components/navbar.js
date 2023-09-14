import React from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  // The current design (just /admin for website) makes this go back to the first page
  const goBack = () => {
    navigate(-1);
  };

  return (
    /* Can't comment inside so:
      Can put longbeach logo above
      The back button only shows when the link includes /admin
     */
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <NavLink className="navbar-brand" to="/">
          {/* Your logo here */}
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            {location.pathname.includes("admin") && (
              <li className="nav-item">
                <button 
                  className="btn btn-link nav-link" 
                  style={{ fontSize: '24px' }}
                  onClick={goBack}
                >
                  Back
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
}