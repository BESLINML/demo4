import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Allproducts from "../Products/Allproducts";

export default function Category() {

    const navigate = useNavigate();

    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    // Mobile menu open/close
    const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);

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

    const productSubcategories = activeCategory
        ? Allproducts
            .filter(
                product =>
                    product.category === activeCategory
            )
            .map(product => product.subcategory)
            .filter(Boolean)
        : [];


    const subcategories = activeCategory
        ? [
            ...new Set([
                ...productSubcategories,
                ...(manualSubCategories[activeCategory] || [])
            ])
        ]
        : [];


    // =========================================================
    // CATEGORY CLICK
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
    // SUBCATEGORY CLICK
    // =========================================================

    const handleSubcategoryClick = (subcategory) => {

        setSelectedSubcategory(subcategory);

        navigate(
            `/category/${encodeURIComponent(subcategory)}`
        );

        // Close mobile menu after navigation
        setMobileCategoryOpen(false);

        setActiveCategory(null);
        setSelectedSubcategory(null);
    };


    // =========================================================
    // MOBILE CATEGORY BUTTON
    // =========================================================

    const handleMobileCategoryToggle = () => {

        setMobileCategoryOpen(prev => !prev);

        // Reset selected category when opening/closing
        setActiveCategory(null);
        setSelectedSubcategory(null);
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
                MOBILE CATEGORY ICON
            ================================================= */}

            <button
                className="mobile-category-toggle"
                onClick={handleMobileCategoryToggle}
            >

                <i className="bi bi-list"></i>

                <span>Categories</span>

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

                            {category}

                            {
                                (
                                    manualSubCategories[category] ||

                                    Allproducts.some(
                                        product =>
                                            product.category === category &&
                                            product.subcategory
                                    )
                                )
                                &&
                                <i className="bi bi-chevron-down"></i>
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
                subcategories.length > 0 &&

                (

                    <div className="subcategory-row desktop-subcategory-menu">

                        {
                            subcategories.map(subcategory => (

                                <button
                                    key={subcategory}

                                    className={
                                        selectedSubcategory === subcategory
                                            ? "subcategory active"
                                            : "subcategory"
                                    }

                                    onClick={() =>
                                        handleSubcategoryClick(subcategory)
                                    }
                                >

                                    {subcategory}

                                </button>

                            ))
                        }

                    </div>

                )
            }


            {/* =================================================
                MOBILE CATEGORY MENU
            ================================================= */}

            {
                mobileCategoryOpen &&

                (

                    <div className="mobile-category-menu">


                        {/* MAIN CATEGORIES */}

                        <div className="mobile-main-categories">

                            {
                                categories.map(category => (

                                    <button
                                        key={category}

                                        className={
                                            activeCategory === category
                                                ? "mobile-main-category active"
                                                : "mobile-main-category"
                                        }

                                        onClick={() =>
                                            handleCategoryClick(category)
                                        }
                                    >

                                        <span>
                                            {category}
                                        </span>


                                        {
                                            (
                                                manualSubCategories[category] ||

                                                Allproducts.some(
                                                    product =>
                                                        product.category === category &&
                                                        product.subcategory
                                                )
                                            )
                                            &&
                                            (
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
                            MOBILE SUBCATEGORIES
                        ================================================= */}

                        {
                            activeCategory &&
                            subcategories.length > 0 &&

                            (

                                <div className="mobile-subcategory-menu">

                                    <div className="mobile-subcategory-title">

                                        <i className="bi bi-arrow-right"></i>

                                        <span>
                                            {activeCategory}
                                        </span>

                                    </div>


                                    {
                                        subcategories.map(subcategory => (

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

                                        ))
                                    }

                                </div>

                            )
                        }

                    </div>

                )

            }

        </div>

    );
}