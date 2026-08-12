
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="footer">

            <div className="footer-container">

                {/* Brand */}
                <div className="footer-section footer-brand">

                    <h2>
                        <span>YAZHL</span> Crafts
                    </h2>

                    <p>
                        Discover beautiful handcrafted products made
                        with creativity, care and love.
                    </p>

                    <div className="footer-social">

                        <a href="#" aria-label="Instagram">
                            <i className="bi bi-instagram"></i>
                        </a>

                        <a href="#" aria-label="Facebook">
                            <i className="bi bi-facebook"></i>
                        </a>

                        <a href="#" aria-label="YouTube">
                            <i className="bi bi-youtube"></i>
                        </a>

                        <a href="#" aria-label="LinkedIn">
                            <i className="bi bi-linkedin"></i>
                        </a>

                    </div>

                </div>


                {/* Quick Links */}
                <div className="footer-section">

                    <h3>Quick Links</h3>

                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>

                        <li>
                            <Link to="/products">All Products</Link>
                        </li>

                        <li>
                            <Link to="/category">Categories</Link>
                        </li>

                        <li>
                            <Link to="/cart">My Cart</Link>
                        </li>

                        <li>
                            <Link to="/orders">My Orders</Link>
                        </li>
                    </ul>

                </div>


                {/* Customer Support */}
                <div className="footer-section">

                    <h3>Customer Support</h3>

                    <ul>
                        <li>
                            <Link to="/about">About Us</Link>
                        </li>

                        <li>
                            <Link to="/contact">Contact Us</Link>
                        </li>

                        <li>
                            <Link to="/shipping">
                                Shipping & Delivery
                            </Link>
                        </li>

                        <li>
                            <Link to="/returns">
                                Returns & Refunds
                            </Link>
                        </li>

                        <li>
                            <Link to="/privacy">
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>

                </div>


                {/* Contact */}
                <div className="footer-section footer-contact">

                    <h3>Contact Us</h3>

                    <p>
                        <i className="bi bi-geo-alt-fill"></i>
                        <span>Tamil Nadu, India</span>
                    </p>

                    <p>
                        <i className="bi bi-telephone-fill"></i>
                        <span>+91 xxxxxxxxxx</span>
                    </p>

                    <p>
                        <i className="bi bi-envelope-fill"></i>
                        <span>support@yazhlcrafts.com</span>
                    </p>

                </div>

            </div>


            {/* Bottom Footer */}
            <div className="footer-bottom">

                <p>
                    © 2026 YAZHL Crafts. All Rights Reserved.
                </p>

                <div className="footer-bottom-links">

                    <Link >
                        Terms & Conditions
                    </Link>

                    <span>|</span>

                    <Link >
                        Privacy Policy
                    </Link>

                </div>

            </div>

        </footer>
    );
}
