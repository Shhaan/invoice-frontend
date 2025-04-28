import React, { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa"; // Import additional icons
import style from "./Footer.module.css";

function Footer() {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <footer
      className={`${style.footer} container-fluid`}
      style={{ position: "relative", bottom: "0" }}
    >
      {/* Main Footer Content */}
      <div className="row py-2">
        {/* Contact Section */}
        <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
          <h6
            style={{
              fontSize: viewportWidth < 400 ? "14px" : "16px",
              fontWeight: "bold",
            }}
          >
            Contact Us
          </h6>
          <p
            style={
              viewportWidth < 400 ? { fontSize: "10px" } : { fontSize: "14px" }
            }
          >
            <FaMapMarkerAlt style={{ color: "green" }} /> Al Furjan Market,
            No:34, Shop No. 11 Near Al Thumama, Stadium, Doha-Qatar P.O.Box:
            21580
          </p>
          <p
            style={
              viewportWidth < 400 ? { fontSize: "10px" } : { fontSize: "14px" }
            }
          >
            <FaPhoneAlt style={{ color: "green" }} /> +97430162002 |{" "}
            <FaEnvelope style={{ color: "red" }} /> ssstradingqatar@gmail.com
          </p>
        </div>

        {/* Social Media Links */}
        <div className="col-12 col-md-6 text-center text-md-end">
          <a
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              backgroundColor: "#f0f6f6",
              borderRadius: "5px",
              textAlign: "center",
              lineHeight: "40px",
              fontSize: viewportWidth < 400 ? "15px" : "20px",
              color: "blue",
            }}
            href="https://www.facebook.com/profile.php?id=100064014914279&mibextid=ZbWKwL"
            target="_blank"
            rel="noopener noreferrer"
            className={`${style.footerLink} me-3`}
            title="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              backgroundColor: "#f0f6f6",
              borderRadius: "5px",
              textAlign: "center",
              lineHeight: "40px",
              fontSize: viewportWidth < 400 ? "15px" : "20px",
              color: "purple",
            }}
            href="https://www.instagram.com/sssfresh.qa/profilecard/?igsh=dnZhcHBmYWlicGJy"
            target="_blank"
            rel="noopener noreferrer"
            className={`${style.footerLink} me-3`}
            title="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              backgroundColor: "#f0f6f6",
              borderRadius: "5px",
              textAlign: "center",
              lineHeight: "40px",
              fontSize: viewportWidth < 400 ? "15px" : "20px",
              color: "green",
            }}
            href="https://maps.app.goo.gl/qotnRqHcgmkBAB2Z9"
            target="_blank"
            rel="noopener noreferrer"
            className={`${style.footerLink}`}
            title="Google Maps"
          >
            <FaMapMarkerAlt />
          </a>
        </div>
        <div className="col-12  text-center   mt-2 mb-md-0">
          <p
            className="mb-0"
            style={
              viewportWidth < 400 ? { fontSize: "6px" } : { fontSize: "10px" }
            }
          >
            © SSS Fresh chicken & meat - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
