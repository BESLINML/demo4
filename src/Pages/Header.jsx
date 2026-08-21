import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Category from "./Category";
import { getProducts } from "../api/productApi";


export default function Header() {

    const navigate = useNavigate();


    // =========================================================
    // PRODUCTS FROM SPRING BOOT
    // =========================================================

    const [products, setProducts] = useState([]);


    // =========================================================
    // SEARCH
    // =========================================================

    const [search, setSearch] = useState("");

    const [showResults, setShowResults] =
        useState(false);


    // =========================================================
    // LOCATION
    // =========================================================

    const [showLocation, setShowLocation] =
        useState(false);


    const [location, setLocation] = useState({

        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""

    });


    // =========================================================
    // LOAD PRODUCTS FROM MYSQL
    // =========================================================

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

        try {

            const data = await getProducts();

            console.log(
                "Header products:",
                data
            );

            setProducts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading products in Header:",
                error
            );

        }

    };


    // =========================================================
    // GET LOGGED-IN USER
    // =========================================================

    const getLoggedUser = () => {

        try {

            const savedUser =
                localStorage.getItem("user");


            if (!savedUser) {
                return null;
            }


            return JSON.parse(
                savedUser
            );

        } catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

            return null;

        }

    };


    const user = getLoggedUser();


    // =========================================================
    // CHECK ADMIN
    // =========================================================

    const isAdmin =
        user?.role === "ADMIN";


    // =========================================================
    // GET UNIQUE CATEGORIES FROM MYSQL
    // =========================================================

    const allCategories = [

        ...new Set(

            products

                .map(
                    product =>
                        product.category
                )

                .filter(
                    category =>
                        category &&
                        category.trim() !== ""
                )

        )

    ];


    // =========================================================
    // GET UNIQUE SUBCATEGORIES FROM MYSQL
    // =========================================================

    const allSubcategories = [

        ...new Set(

            products

                .map(
                    product =>
                        product.subcategory
                )

                .filter(
                    subcategory =>
                        subcategory &&
                        subcategory.trim() !== ""
                )

        )

    ];


    // =========================================================
    // SEARCH TEXT
    // =========================================================

    const searchText =
        search.trim().toLowerCase();


    // =========================================================
    // CATEGORY SEARCH
    // =========================================================

    const categoryResults = searchText

        ? allCategories

            .filter(category =>

                category
                    .toLowerCase()
                    .includes(searchText)

            )

            .map(category => ({

                type: "category",

                name: category

            }))

        : [];


    // =========================================================
    // SUBCATEGORY SEARCH
    // =========================================================

    const subcategoryResults = searchText

        ? allSubcategories

            .filter(subcategory =>

                subcategory
                    .toLowerCase()
                    .includes(searchText)

            )

            .map(subcategory => ({

                type: "subcategory",

                name: subcategory

            }))

        : [];


    // =========================================================
    // PRODUCT SEARCH
    // =========================================================

    const productResults = searchText

        ? products

            .filter(product => {

                const name =
                    product.name?.toLowerCase() || "";


                const productname =
                    product.productname?.toLowerCase() || "";


                const category =
                    product.category?.toLowerCase() || "";


                const subcategory =
                    product.subcategory?.toLowerCase() || "";


                return (

                    name.includes(searchText) ||

                    productname.includes(searchText) ||

                    category.includes(searchText) ||

                    subcategory.includes(searchText)

                );

            })

            .map(product => ({

                type: "product",

                name:
                    product.name ||
                    product.productname ||
                    "Product",

                price:
                    product.offerprice ??
                    product.price,

                image:
                    getProductImage(product),

                data:
                    product

            }))

        : [];


    // =========================================================
    // GET PRODUCT IMAGE
    // =========================================================

    function getProductImage(product) {

        if (!product) {
            return "/placeholder.png";
        }


        // Array

        if (Array.isArray(product.image)) {

            return (
                product.image[0] ||
                "/placeholder.png"
            );

        }


        // JSON string array

        if (
            typeof product.image === "string"
        ) {

            try {

                const parsed =
                    JSON.parse(
                        product.image
                    );


                if (
                    Array.isArray(parsed)
                ) {

                    return (
                        parsed[0] ||
                        "/placeholder.png"
                    );

                }

            } catch {

                // Normal URL string

            }


            if (
                product.image.trim() !== ""
            ) {

                return product.image;

            }

        }


        // photo array fallback

        if (
            Array.isArray(product.photo)
        ) {

            return (
                product.photo[0] ||
                "/placeholder.png"
            );

        }


        return "/placeholder.png";

    }


    // =========================================================
    // COMBINE SEARCH RESULTS
    // =========================================================

    const searchResults = [

        ...categoryResults,

        ...subcategoryResults,

        ...productResults

    ];


    // =========================================================
    // CATEGORY CLICK
    // =========================================================

    const handleCategoryClick = (
        category
    ) => {

        setSearch("");

        setShowResults(false);


        navigate(
            `/category/${encodeURIComponent(
                category
            )}`
        );

    };


    // =========================================================
    // SUBCATEGORY CLICK
    // =========================================================

    const handleSubcategoryClick = (
        subcategory
    ) => {

        setSearch("");

        setShowResults(false);


        navigate(
            `/category/${encodeURIComponent(
                subcategory
            )}`
        );

    };


    // =========================================================
    // PRODUCT CLICK
    // =========================================================

    const handleProductClick = (
        product
    ) => {

        setSearch("");

        setShowResults(false);


        navigate(
            `/product/${product.id}`
        );

    };


    // =========================================================
    // SEARCH CHANGE
    // =========================================================

    const handleSearchChange = (
        event
    ) => {

        const value =
            event.target.value;


        setSearch(value);


        if (
            value.trim() !== ""
        ) {

            setShowResults(true);

        } else {

            setShowResults(false);

        }

    };


    // =========================================================
    // LOCATION CHANGE
    // =========================================================

    const handleLocationChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setLocation(
            previous => ({

                ...previous,

                [name]: value

            })
        );

    };


    // =========================================================
    // SAVE LOCATION
    // =========================================================

    const handleLocationSubmit = (
        event
    ) => {

        event.preventDefault();


        localStorage.setItem(

            "deliveryLocation",

            JSON.stringify(
                location
            )

        );


        setShowLocation(false);

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "user"
        );


        navigate("/login");


        window.location.reload();

    };


    // =========================================================
    // ADMIN PANEL
    // =========================================================

    const handleAdminPanel = () => {

        if (!isAdmin) {
            return;
        }


        navigate("/admin");

    };


    // =========================================================
    // RETURN
    // =========================================================

    return (

        <>

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="header">


                {/* =================================================
                    LOGO
                ================================================= */}

                <Link
                    to="/"
                    className="logo"
                >

                    <span>
                        YAZHL
                    </span>

                    {" "}Crafts

                </Link>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="search-box">

                    <input

                        type="text"

                        value={search}

                        placeholder="Search products, categories..."

                        onChange={
                            handleSearchChange
                        }

                        onFocus={() => {

                            if (
                                search.trim() !== ""
                            ) {

                                setShowResults(
                                    true
                                );

                            }

                        }}

                    />


                    <button
                        type="button"

                        onClick={() => {

                            if (
                                search.trim() !== ""
                            ) {

                                setShowResults(
                                    true
                                );

                            }

                        }}

                    >

                        <i className="bi bi-search"></i>

                    </button>


                    {/* =================================================
                        SEARCH RESULTS
                    ================================================= */}

                    {showResults &&
                        search.trim() !== "" && (

                        <div className="search-results">


                            {searchResults.length > 0 ? (

                                <>


                                    {/* =================================================
                                        CATEGORIES
                                    ================================================= */}

                                    {categoryResults.length > 0 && (

                                        <>

                                            <div className="search-result-heading">

                                                <span>
                                                    Categories
                                                </span>

                                            </div>


                                            {categoryResults

                                                .slice(0, 4)

                                                .map(
                                                    result => (

                                                        <div

                                                            className="search-result-item search-category-item"

                                                            key={
                                                                `category-${result.name}`
                                                            }

                                                            onClick={() =>
                                                                handleCategoryClick(
                                                                    result.name
                                                                )
                                                            }

                                                        >

                                                            <div className="search-category-icon">

                                                                <i className="bi bi-grid"></i>

                                                            </div>


                                                            <div className="search-result-details">

                                                                <h4>
                                                                    {result.name}
                                                                </h4>


                                                                <p>
                                                                    Category
                                                                </p>

                                                            </div>


                                                            <i className="bi bi-chevron-right search-arrow"></i>

                                                        </div>

                                                    )
                                                )
                                            }

                                        </>

                                    )}


                                    {/* =================================================
                                        SUBCATEGORIES
                                    ================================================= */}

                                    {subcategoryResults.length > 0 && (

                                        <>

                                            <div className="search-result-heading">

                                                <span>
                                                    Subcategories
                                                </span>

                                            </div>


                                            {subcategoryResults

                                                .slice(0, 5)

                                                .map(
                                                    result => (

                                                        <div

                                                            className="search-result-item search-category-item"

                                                            key={
                                                                `subcategory-${result.name}`
                                                            }

                                                            onClick={() =>
                                                                handleSubcategoryClick(
                                                                    result.name
                                                                )
                                                            }

                                                        >

                                                            <div className="search-category-icon">

                                                                <i className="bi bi-tags"></i>

                                                            </div>


                                                            <div className="search-result-details">

                                                                <h4>
                                                                    {result.name}
                                                                </h4>


                                                                <p>
                                                                    Subcategory
                                                                </p>

                                                            </div>


                                                            <i className="bi bi-chevron-right search-arrow"></i>

                                                        </div>

                                                    )
                                                )
                                            }

                                        </>

                                    )}


                                    {/* =================================================
                                        PRODUCTS
                                    ================================================= */}

                                    {productResults.length > 0 && (

                                        <>

                                            <div className="search-result-heading">

                                                <span>
                                                    Products
                                                </span>

                                            </div>


                                            {productResults

                                                .slice(0, 6)

                                                .map(
                                                    result => (

                                                        <div

                                                            className="search-result-item"

                                                            key={
                                                                `product-${result.data.id}`
                                                            }

                                                            onClick={() =>
                                                                handleProductClick(
                                                                    result.data
                                                                )
                                                            }

                                                        >

                                                            <img

                                                                src={
                                                                    result.image
                                                                }

                                                                alt={
                                                                    result.name
                                                                }

                                                            />


                                                            <div className="search-result-details">

                                                                <h4>
                                                                    {result.name}
                                                                </h4>


                                                                <p>

                                                                    ₹

                                                                    {Number(
                                                                        result.price
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}

                                                                </p>

                                                            </div>

                                                        </div>

                                                    )
                                                )
                                            }

                                        </>

                                    )}

                                </>

                            ) : (

                                <div className="no-results">

                                    <i className="bi bi-search"></i>

                                    <span>
                                        No products or categories found
                                    </span>

                                </div>

                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    HEADER ACTIONS
                ================================================= */}

                <div className="header-actions">


                    {/* =================================================
                        DELIVERY LOCATION
                    ================================================= */}

                    <button

                        className="action"

                        onClick={() =>
                            setShowLocation(true)
                        }

                    >

                        <i className="bi bi-geo-alt"></i>


                        <div>

                            <small>
                                Deliver to
                            </small>


                            <span>

                                {location.city ||
                                    "Location"}

                            </span>

                        </div>

                    </button>


                    {/* =================================================
                        CART
                    ================================================= */}

                    <Link

                        to="/cart"

                        className="action"

                    >

                        <i className="bi bi-cart3"></i>


                        <div>

                            <small>
                                My
                            </small>


                            <span>
                                Cart
                            </span>

                        </div>

                    </Link>


                    {/* =================================================
                        ADMIN PANEL
                    ================================================= */}

                    {isAdmin && (

                        <button

                            type="button"

                            className="action admin-header-button"

                            onClick={
                                handleAdminPanel
                            }

                        >

                            <i className="bi bi-speedometer2"></i>


                            <div>

                                <small>
                                    Admin
                                </small>


                                <span>
                                    Panel
                                </span>

                            </div>

                        </button>

                    )}


                    {/* =================================================
                        LOGIN / LOGOUT
                    ================================================= */}

                    {user ? (

                        <button

                            type="button"

                            className="action"

                            onClick={
                                handleLogout
                            }

                        >

                            <i className="bi bi-box-arrow-right"></i>


                            <div>

                                <small>

                                    Hi{" "}

                                    {user.name ||
                                        "User"}

                                </small>


                                <span>
                                    Logout
                                </span>

                            </div>

                        </button>

                    ) : (

                        <Link

                            to="/login"

                            className="action"

                        >

                            <i className="bi bi-person-circle"></i>


                            <div>

                                <small>
                                    Hii
                                </small>


                                <span>
                                    Login
                                </span>

                            </div>

                        </Link>

                    )}

                </div>

            </header>


            {/* =================================================
                EXISTING CATEGORY
            ================================================= */}

            <Category />


            {/* =================================================
                LOCATION POPUP
            ================================================= */}

            {showLocation && (

                <div

                    className="location-overlay"

                    onClick={() =>
                        setShowLocation(false)
                    }

                >

                    <div

                        className="location-popup"

                        onClick={
                            event =>
                                event.stopPropagation()
                        }

                    >


                        {/* =================================================
                            POPUP HEADER
                        ================================================= */}

                        <div className="location-popup-header">

                            <div>

                                <h2>
                                    Delivery Location
                                </h2>


                                <p>
                                    Enter your delivery address
                                </p>

                            </div>


                            <button

                                type="button"

                                className="location-close"

                                onClick={() =>
                                    setShowLocation(
                                        false
                                    )
                                }

                            >

                                ×

                            </button>

                        </div>


                        {/* =================================================
                            LOCATION FORM
                        ================================================= */}

                        <form

                            onSubmit={
                                handleLocationSubmit
                            }

                        >


                            {/* NAME + PHONE */}

                            <div className="location-row">


                                <div className="location-field">

                                    <label>
                                        Name
                                    </label>


                                    <input

                                        type="text"

                                        name="name"

                                        placeholder="Enter your name"

                                        value={
                                            location.name
                                        }

                                        onChange={
                                            handleLocationChange
                                        }

                                        required

                                    />

                                </div>


                                <div className="location-field">

                                    <label>
                                        Phone Number
                                    </label>


                                    <input

                                        type="tel"

                                        name="phone"

                                        placeholder="Enter phone number"

                                        value={
                                            location.phone
                                        }

                                        onChange={
                                            handleLocationChange
                                        }

                                        required

                                    />

                                </div>

                            </div>


                            {/* ADDRESS */}

                            <div className="location-field">

                                <label>
                                    Address
                                </label>


                                <textarea

                                    name="address"

                                    placeholder="House / Street / Area"

                                    value={
                                        location.address
                                    }

                                    onChange={
                                        handleLocationChange
                                    }

                                    required

                                />

                            </div>


                            {/* CITY + STATE */}

                            <div className="location-row">


                                <div className="location-field">

                                    <label>
                                        City
                                    </label>


                                    <input

                                        type="text"

                                        name="city"

                                        placeholder="City"

                                        value={
                                            location.city
                                        }

                                        onChange={
                                            handleLocationChange
                                        }

                                        required

                                    />

                                </div>


                                <div className="location-field">

                                    <label>
                                        State
                                    </label>


                                    <input

                                        type="text"

                                        name="state"

                                        placeholder="State"

                                        value={
                                            location.state
                                        }

                                        onChange={
                                            handleLocationChange
                                        }

                                        required

                                    />

                                </div>

                            </div>


                            {/* PINCODE */}

                            <div className="location-field">

                                <label>
                                    Pincode
                                </label>


                                <input

                                    type="text"

                                    name="pincode"

                                    placeholder="Enter pincode"

                                    value={
                                        location.pincode
                                    }

                                    onChange={
                                        handleLocationChange
                                    }

                                    maxLength="6"

                                    required

                                />

                            </div>


                            {/* SAVE */}

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