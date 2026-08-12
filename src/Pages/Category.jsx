import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Allproducts from "../Products/Allproducts";

export default function Category() {

    const navigate = useNavigate();

    // =========================================================
    // DESKTOP STATE
    // =========================================================

    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    // =========================================================
    // MOBILE STATE
    // =========================================================

    const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
    const [mobileActiveCategory, setMobileActiveCategory] = useState(null);

    const categoryRef = useRef(null);


    // =========================================================
    // MANUAL SUBCATEGORIES
    // =========================================================

    const manualSubCategories = {

        "Main Categories": [
            "Customized Gifts",
            "Readymade Gifts",
            "Premium Gifts",
            "Budget Gifts"
        ],

        "Occasion-Based Categories": [
            "Birthday Gifts",
            "Wedding & Anniversary Gifts",
            "Festival Gifts",
            "Love & Romantic Gifts",
            "Friendship Gifts"
        ],

        "Recipient-Based Categories": [
            "Gifts for Him",
            "Gifts for Her",
            "Gifts for Kids",
            "Gifts for Parents",
            "Gifts for Friends"
        ],

        "Product-Based Categories": [
            "Photo Frames",
            "Wall Hangings",
            "MDF Gifts",
            "Metal Engraving",
            "Pillow Printing",
            "Cup Printing",
            "Keychains",
            "Return Gifts",
            "3D Printing",
            "Laser Cutting",
            "Home Decor",
            "Toys"
        ],

        "Special Categories": [
            "Corporate Gifts",
            "Bulk Orders",
            "Handmade Gifts",
            "Trending Gifts"
        ],

        "Premium Sections": [
            "Best Sellers",
            "New Arrivals",
            "Limited Edition",
            "Personalized Combos"
        ]

    };


    // =========================================================
    // PRODUCT CATEGORIES
    // =========================================================

    const productCategories = [
        ...new Set(
            Allproducts.map(product => product.category)
        )
    ];


    const categories = [
        ...new Set([
            ...productCategories,
            ...Object.keys(manualSubCategories)
        ])
    ];


    // =========================================================
    // GET SUBCATEGORIES
    // =========================================================

    const getSubcategories = (category) => {

        const productSubcategories = Allproducts
            .filter(
                product =>
                    product.category === category
            )
            .map(product => product.subcategory)
            .filter(Boolean);


        return [
            ...new Set([
                ...productSubcategories,
                ...(manualSubCategories[category] || [])
            ])
        ];
    };


    // =========================================================
    // CHECK WHETHER CATEGORY HAS SUBCATEGORIES
    // =========================================================

    const hasSubcategories = (category) => {

        return getSubcategories(category).length > 0;

    };


    // =========================================================
    // DESKTOP CATEGORY CLICK
    // =========================================================

    const handleCategoryClick = (category) => {

        if (activeCategory === category) {

            setActiveCategory(null);
            setSelectedSubcategory(null);

        } else {

            setActiveCategory(category);
            setSelectedSubcategory(null);

        }

    };


    // =========================================================
    // MOBILE CATEGORY CLICK
    // =========================================================

    const handleMobileCategoryClick = (category) => {

        // If same category is clicked again
        if (mobileActiveCategory === category) {

            setMobileActiveCategory(null);

            return;
        }


        // Open selected category immediately
        setMobileActiveCategory(category);

    };


    // =========================================================
    // SUBCATEGORY CLICK
    // =========================================================

    const handleSubcategoryClick = (subcategory) => {

        setSelectedSubcategory(subcategory);

        navigate(
            `/category/${encodeURIComponent(subcategory)}`
        );


        // Close everything after navigation
        setMobileCategoryOpen(false);

        setMobileActiveCategory(null);

        setActiveCategory(null);

        setSelectedSubcategory(null);

    };


    // =========================================================
    // MOBILE CATEGORY BUTTON
    // =========================================================

    const handleMobileCategoryToggle = () => {

        setMobileCategoryOpen(prev => {

            const newValue = !prev;

            // When closing menu
            if (!newValue) {

                setMobileActiveCategory(null);

            }

            return newValue;

        });

    };


    // =========================================================
    // CLOSE WHEN CLICK OUTSIDE
    // =========================================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                categoryRef.current &&
                !categoryRef.current.contains(event.target)
            ) {

                setActiveCategory(null);

                setSelectedSubcategory(null);

                setMobileCategoryOpen(false);

                setMobileActiveCategory(null);

            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    // =========================================================
    // RETURN
    // =========================================================

    return (

        <div
            className="category-container"
            ref={categoryRef}
        >


            {/* =================================================
                MOBILE CATEGORY BUTTON
            ================================================= */}

            <button
                className="mobile-category-toggle"
                onClick={handleMobileCategoryToggle}
            >

                <i className="bi bi-list"></i>

                <span>
                    Categories
                </span>

                <i
                    className={
                        mobileCategoryOpen
                            ? "bi bi-chevron-up"
                            : "bi bi-chevron-down"
                    }
                ></i>

            </button>


            {/* =================================================
                DESKTOP CATEGORY MENU
            ================================================= */}

            <div className="category-row desktop-category-menu">

                {
                    categories.map(category => (

                        <button
                            key={category}

                            className={
                                activeCategory === category
                                    ? "category active"
                                    : "category"
                            }

                            onClick={() =>
                                handleCategoryClick(category)
                            }
                        >

                            <span>
                                {category}
                            </span>


                            {
                                hasSubcategories(category) && (

                                    <i
                                        className={
                                            activeCategory === category
                                                ? "bi bi-chevron-up"
                                                : "bi bi-chevron-down"
                                        }
                                    ></i>

                                )
                            }

                        </button>

                    ))
                }

            </div>


            {/* =================================================
                DESKTOP SUBCATEGORY
            ================================================= */}

            {
                activeCategory &&
                getSubcategories(activeCategory).length > 0 && (

                    <div className="subcategory-row desktop-subcategory-menu">

                        {
                            getSubcategories(activeCategory).map(
                                subcategory => (

                                    <button
                                        key={subcategory}

                                        className={
                                            selectedSubcategory === subcategory
                                                ? "subcategory active"
                                                : "subcategory"
                                        }

                                        onClick={() =>
                                            handleSubcategoryClick(
                                                subcategory
                                            )
                                        }
                                    >

                                        {subcategory}

                                    </button>

                                )
                            )
                        }

                    </div>

                )
            }


            {/* =================================================
                MOBILE CATEGORY MENU
            ================================================= */}

            {
                mobileCategoryOpen && (

                    <div className="mobile-category-menu">

                        {
                            categories.map(category => {

                                const categorySubcategories =
                                    getSubcategories(category);

                                const isActive =
                                    mobileActiveCategory === category;


                                return (

                                    <div
                                        className={
                                            isActive
                                                ? "mobile-category-item active"
                                                : "mobile-category-item"
                                        }
                                        key={category}
                                    >


                                        {/* MAIN CATEGORY */}

                                        <button
                                            className={
                                                isActive
                                                    ? "mobile-main-category active"
                                                    : "mobile-main-category"
                                            }

                                            onClick={() =>
                                                handleMobileCategoryClick(
                                                    category
                                                )
                                            }
                                        >

                                            <span>
                                                {category}
                                            </span>


                                            {
                                                categorySubcategories.length > 0 && (

                                                    <i
                                                        className={
                                                            isActive
                                                                ? "bi bi-chevron-up"
                                                                : "bi bi-chevron-down"
                                                        }
                                                    ></i>

                                                )
                                            }

                                        </button>


                                        {/* =================================================
                                            SUBCATEGORIES
                                        ================================================= */}

                                        {
                                            isActive &&
                                            categorySubcategories.length > 0 && (

                                                <div className="mobile-subcategory-list">

                                                    {
                                                        categorySubcategories.map(
                                                            subcategory => (

                                                                <button
                                                                    key={subcategory}

                                                                    className="mobile-subcategory"

                                                                    onClick={() =>
                                                                        handleSubcategoryClick(
                                                                            subcategory
                                                                        )
                                                                    }
                                                                >

                                                                    <span>
                                                                        {subcategory}
                                                                    </span>

                                                                    <i className="bi bi-chevron-right"></i>

                                                                </button>

                                                            )
                                                        )
                                                    }

                                                </div>

                                            )
                                        }

                                    </div>

                                );

                            })
                        }

                    </div>

                )

            }

        </div>

    );

}