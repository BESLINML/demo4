import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../api/productApi";

export default function Category() {

    const navigate = useNavigate();

    // =========================================================
    // PRODUCTS FROM SPRING BOOT / MYSQL
    // =========================================================

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);


    // =========================================================
    // DESKTOP STATE
    // =========================================================

    const [activeCategory, setActiveCategory] = useState(null);

    const [selectedSubcategory, setSelectedSubcategory] =
        useState(null);


    // =========================================================
    // MOBILE STATE
    // =========================================================

    const [mobileCategoryOpen, setMobileCategoryOpen] =
        useState(false);

    const [mobileActiveCategory, setMobileActiveCategory] =
        useState(null);


    const categoryRef = useRef(null);


    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    useEffect(() => {

        const loadProducts = async () => {

            try {

                const data = await getProducts();

                console.log(
                    "Products from Spring Boot:",
                    data
                );

                setProducts(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Error loading products:",
                    error
                );

                setProducts([]);

            } finally {

                setLoading(false);

            }

        };


        loadProducts();

    }, []);


    // =========================================================
    // GET UNIQUE CATEGORIES
    // =========================================================

    const categories = [];

    products.forEach(product => {

        const category =
            product.category?.trim();

        if (!category) {
            return;
        }


        // Case-insensitive duplicate check

        const exists =
            categories.some(
                existing =>
                    existing.toLowerCase() ===
                    category.toLowerCase()
            );


        if (!exists) {

            categories.push(category);

        }

    });


    // =========================================================
    // GET SUBCATEGORIES FOR CATEGORY
    // =========================================================

    const getSubcategories = (category) => {

        const subcategories = [];


        products.forEach(product => {

            const productCategory =
                product.category
                    ?.trim()
                    .toLowerCase();


            const currentCategory =
                category
                    ?.trim()
                    .toLowerCase();


            // Only products belonging
            // to selected category

            if (
                productCategory !==
                currentCategory
            ) {

                return;

            }


            const subcategory =
                product.subcategory?.trim();


            if (!subcategory) {
                return;
            }


            // Case-insensitive duplicate check

            const exists =
                subcategories.some(
                    existing =>
                        existing.toLowerCase() ===
                        subcategory.toLowerCase()
                );


            if (!exists) {

                subcategories.push(
                    subcategory
                );

            }

        });


        return subcategories;

    };


    // =========================================================
    // CHECK CATEGORY HAS SUBCATEGORIES
    // =========================================================

    const hasSubcategories = (category) => {

        return (
            getSubcategories(category).length > 0
        );

    };


    // =========================================================
    // DESKTOP CATEGORY CLICK
    // =========================================================

    const handleCategoryClick = (category) => {

        const subcategories =
            getSubcategories(category);


        // -----------------------------------------------------
        // CATEGORY HAS NO SUBCATEGORY
        // -----------------------------------------------------

        if (subcategories.length === 0) {

            navigate(
                `/category/${encodeURIComponent(
                    category
                )}`
            );


            setActiveCategory(null);

            setSelectedSubcategory(null);

            return;

        }


        // -----------------------------------------------------
        // OPEN / CLOSE SUBCATEGORY
        // -----------------------------------------------------

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

        const subcategories =
            getSubcategories(category);


        // -----------------------------------------------------
        // CATEGORY HAS NO SUBCATEGORY
        // -----------------------------------------------------

        if (subcategories.length === 0) {

            navigate(
                `/category/${encodeURIComponent(
                    category
                )}`
            );


            setMobileCategoryOpen(false);

            setMobileActiveCategory(null);

            return;

        }


        // -----------------------------------------------------
        // OPEN / CLOSE
        // -----------------------------------------------------

        if (
            mobileActiveCategory ===
            category
        ) {

            setMobileActiveCategory(null);

        } else {

            setMobileActiveCategory(
                category
            );

        }

    };


    // =========================================================
    // SUBCATEGORY CLICK
    // =========================================================

    const handleSubcategoryClick = (subcategory) => {

        setSelectedSubcategory(
            subcategory
        );


        navigate(
            `/category/${encodeURIComponent(
                subcategory
            )}`
        );


        // Close desktop menu

        setActiveCategory(null);

        setSelectedSubcategory(null);


        // Close mobile menu

        setMobileCategoryOpen(false);

        setMobileActiveCategory(null);

    };


    // =========================================================
    // MOBILE CATEGORY BUTTON
    // =========================================================

    const handleMobileCategoryToggle = () => {

        setMobileCategoryOpen(
            previous => {

                const newValue =
                    !previous;


                if (!newValue) {

                    setMobileActiveCategory(
                        null
                    );

                }


                return newValue;

            }
        );

    };


    // =========================================================
    // CLOSE WHEN CLICK OUTSIDE
    // =========================================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (

                categoryRef.current &&

                !categoryRef.current.contains(
                    event.target
                )

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
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div
                className="category-container"
                ref={categoryRef}
            >

                <div className="category-loading">

                    Loading categories...

                </div>

            </div>

        );

    }


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

                onClick={
                    handleMobileCategoryToggle
                }
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

            <div
                className="category-row desktop-category-menu"
            >

                {categories.map(
                    category => (

                        <button
                            key={category}

                            className={
                                activeCategory ===
                                category
                                    ? "category active"
                                    : "category"
                            }

                            onClick={() =>
                                handleCategoryClick(
                                    category
                                )
                            }
                        >

                            <span>
                                {category}
                            </span>


                            {hasSubcategories(
                                category
                            ) && (

                                <i
                                    className={
                                        activeCategory ===
                                        category
                                            ? "bi bi-chevron-up"
                                            : "bi bi-chevron-down"
                                    }
                                ></i>

                            )}

                        </button>

                    )
                )}

            </div>


            {/* =================================================
                DESKTOP SUBCATEGORY
            ================================================= */}

            {activeCategory &&

                getSubcategories(
                    activeCategory
                ).length > 0 && (

                    <div
                        className=
                            "subcategory-row desktop-subcategory-menu"
                    >

                        {getSubcategories(
                            activeCategory
                        ).map(
                            subcategory => (

                                <button
                                    key={subcategory}

                                    className={
                                        selectedSubcategory ===
                                        subcategory
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
                        )}

                    </div>

                )
            }


            {/* =================================================
                MOBILE CATEGORY MENU
            ================================================= */}

            {mobileCategoryOpen && (

                <div
                    className=
                        "mobile-category-menu"
                >

                    {categories.map(
                        category => {

                            const categorySubcategories =
                                getSubcategories(
                                    category
                                );


                            const isActive =
                                mobileActiveCategory ===
                                category;


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


                                        {categorySubcategories.length >
                                            0 && (

                                            <i
                                                className={
                                                    isActive
                                                        ? "bi bi-chevron-up"
                                                        : "bi bi-chevron-down"
                                                }
                                            ></i>

                                        )}

                                    </button>


                                    {/* =================================================
                                        SUBCATEGORIES
                                    ================================================= */}

                                    {isActive &&
                                        categorySubcategories.length >
                                            0 && (

                                            <div
                                                className=
                                                    "mobile-subcategory-list"
                                            >

                                                {categorySubcategories.map(
                                                    subcategory => (

                                                        <button
                                                            key={
                                                                subcategory
                                                            }

                                                            className=
                                                                "mobile-subcategory"

                                                            onClick={() =>
                                                                handleSubcategoryClick(
                                                                    subcategory
                                                                )
                                                            }
                                                        >

                                                            <span>
                                                                {
                                                                    subcategory
                                                                }
                                                            </span>

                                                            <i className="bi bi-chevron-right"></i>

                                                        </button>

                                                    )
                                                )}

                                            </div>

                                        )}

                                </div>

                            );

                        }
                    )}

                </div>

            )}

        </div>

    );

}
