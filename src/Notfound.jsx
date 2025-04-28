import React from "react";
import Adminheader from "./Components/Adminheader/Adminheader";
import Footer from "./Components/Footer/Footer";
import { Link } from "react-router-dom";
const Notfound = () => {
  return (
    <React.Fragment>
      <Adminheader />
      <div
        className="container text-center"
        style={{ marginTop: "100px", marginBottom: "100px" }}
      >
        <h1 className="display-1">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to={"/"} className="btn btn-outline-dark mt-3">
          Go to Home
        </Link>
      </div>
      <Footer />
    </React.Fragment>
  );
};

export default Notfound;
