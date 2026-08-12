import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Category from "./Category";
import Allproducts from "../Products/Allproducts";

export default function Header() {

    const [search, setSearch] = useState("");
    const [showResults, setShowResults] = useState(false);

    // Location popup
    const [showLocation, setShowLocation] = useState(false);

    const [location, setLocation] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const navigate = useNavigate();


    // SEARCH
    const filteredProducts = Allproducts.filter((product) => {

        const searchText = search.toLowerCase();

        return (
            product.name?.toLowerCase().includes(searchText) ||
            product.productname?.toLowerCase().includes(searchText) ||
            product.category?.toLowerCase().includes(searchText)
        );

    });


    const handleProductClick = (product) => {

        setSearch("");
        setShowResults(false);

        navigate(`/product/${product.id}`);

    };


    // LOCATION INPUT
    const handleLocationChange = (e) => {

        setLocation({
            ...location,
            [e.target.name]: e.target.value
        });

    };


    // SAVE LOCATION
    const handleLocationSubmit = (e) => {

        e.preventDefault();

        localStorage.setItem(
            "deliveryLocation",
            JSON.stringify(location)
        );

        setShowLocation(false);

    };


    return (
        <>
            <header className="header">

                {/* LOGO */}
                <Link to="/" className="logo">
                    <span>YAZHL</span> Crafts
                </Link>


                {/* SEARCH */}
                <div className="search-box">

                    <input
                        type="text"
                        value={search}
                        placeholder="Search for products..."
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowResults(true);
                        }}
                    />

                    <button>
                        <i className="bi bi-search"></i>
                    </button>


                    {showResults && search.trim() !== "" && (

                        <div className="search-results">

                            {filteredProducts.length > 0 ? (

                                filteredProducts
                                    .slice(0, 6)
                                    .map((product) => (

                                        <div
                                            className="search-result-item"
                                            key={product.id}
                                            onClick={() =>
                                                handleProductClick(product)
                                            }
                                        >

                                            <img
                                                src={
                                                    product.image?.[0] ||
                                                    product.photo?.[0]
                                                }
                                                alt={
                                                    product.name ||
                                                    product.productname
                                                }
                                            />

                                            <div className="search-result-details">

                                                <h4>
                                                    {product.name ||
                                                        product.productname}
                                                </h4>

                                                <p>
                                                    ₹
                                                    {Number(
                                                        product.price
                                                    ).toLocaleString("en-IN")}
                                                </p>

                                            </div>

                                        </div>

                                    ))

                            ) : (

                                <div className="no-results">
                                    No products found
                                </div>

                            )}

                        </div>

                    )}

                </div>


                {/* HEADER ACTIONS */}
                <div className="header-actions">


                    {/* DELIVERY LOCATION */}
                    <button
                        className="action"
                        onClick={() => setShowLocation(true)}
                    >

                        <i className="bi bi-geo-alt"></i>

                        <div>
                            <small>Deliver to</small>
                            <span>
                                {location.city || "Location"}
                            </span>
                        </div>

                    </button>


                    {/* CART */}
                    <Link
                        to="/cart"
                        className="action"
                    >

                        <i className="bi bi-cart3"></i>

                        <div>
                            <small>My</small>
                            <span>Cart</span>
                        </div>

                    </Link>


                    {/* LOGIN */}
                    <Link
                        to="/login"
                        className="action"
                    >

                        <i className="bi bi-person-circle"></i>

                        <div>
                            <small>Hii</small>
                            <span>Login</span>
                        </div>

                    </Link>

                </div>

            </header>


            <Category />


            {/* LOCATION POPUP */}
            {showLocation && (

                <div
                    className="location-overlay"
                    onClick={() => setShowLocation(false)}
                >

                    <div
                        className="location-popup"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}
                        <div className="location-popup-header">

                            <div>
                                <h2>Delivery Location</h2>

                                <p>
                                    Enter your delivery address
                                </p>
                            </div>

                            <button
                                className="location-close"
                                onClick={() =>
                                    setShowLocation(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleLocationSubmit}>

                            {/* NAME + PHONE */}
                            <div className="location-row">

                                <div className="location-field">

                                    <label>Name</label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={location.name}
                                        onChange={handleLocationChange}
                                        required
                                    />

                                </div>


                                <div className="location-field">

                                    <label>Phone Number</label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter phone number"
                                        value={location.phone}
                                        onChange={handleLocationChange}
                                        required
                                    />

                                </div>

                            </div>


                            {/* ADDRESS */}
                            <div className="location-field">

                                <label>Address</label>

                                <textarea
                                    name="address"
                                    placeholder="House / Street / Area"
                                    value={location.address}
                                    onChange={handleLocationChange}
                                    required
                                />

                            </div>


                            {/* CITY + STATE */}
                            <div className="location-row">

                                <div className="location-field">

                                    <label>City</label>

                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={location.city}
                                        onChange={handleLocationChange}
                                        required
                                    />

                                </div>


                                <div className="location-field">

                                    <label>State</label>

                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State"
                                        value={location.state}
                                        onChange={handleLocationChange}
                                        required
                                    />

                                </div>

                            </div>


                            {/* PINCODE */}
                            <div className="location-field">

                                <label>Pincode</label>

                                <input
                                    type="text"
                                    name="pincode"
                                    placeholder="Enter pincode"
                                    value={location.pincode}
                                    onChange={handleLocationChange}
                                    maxLength="6"
                                    required
                                />

                            </div>


                            <button
                                type="submit"
                                className="save-location-btn"
                            >
                                Save Delivery Location
                            </button>

                        </form>

                    </div>

                </div>

            )}

        </>
    );
}