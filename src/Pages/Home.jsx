import { useEffect, useState } from "react";

import { getProducts } from "../api/productApi";
import { getBanners } from "../api/BannerApi";

import CategoryProducts from "./CategoryProducts";


// =====================================================
// HOME
// =====================================================

export default function Home() {

    // =====================================================
    // PRODUCTS
    // =====================================================

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);


    // =====================================================
    // BANNERS
    // =====================================================

    const [banners, setBanners] = useState([]);

    const [loadingBanners, setLoadingBanners] =
        useState(true);


    // =====================================================
    // SLIDER
    // =====================================================

    const [index, setIndex] = useState(1);

    const [isMoving, setIsMoving] = useState(true);


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    useEffect(() => {

        const loadProducts = async () => {

            try {

                setLoading(true);

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


    // =====================================================
    // LOAD BANNERS
    // =====================================================

    useEffect(() => {

        const loadBanners = async () => {

            try {

                setLoadingBanners(true);

                const data = await getBanners();

                console.log(
                    "Banners from Spring Boot:",
                    data
                );

                if (Array.isArray(data)) {

                    setBanners(data);

                } else {

                    setBanners([]);

                }

            } catch (error) {

                console.error(
                    "Error loading banners:",
                    error
                );

                setBanners([]);

            } finally {

                setLoadingBanners(false);

            }

        };


        loadBanners();

    }, []);


    // =====================================================
    // GET BANNER IMAGE
    // =====================================================

    const getBannerImage = (banner) => {

        if (!banner) {
            return "";
        }


        let image = banner.image;


        // ---------------------------------------------
        // No image
        // ---------------------------------------------

        if (!image) {
            return "";
        }


        // ---------------------------------------------
        // String image
        // ---------------------------------------------

        if (typeof image === "string") {

            image = image.trim();


            if (!image) {
                return "";
            }


            // -----------------------------------------
            // JSON array accidentally stored as string
            // -----------------------------------------

            try {

                const parsed =
                    JSON.parse(image);


                if (Array.isArray(parsed)) {

                    return parsed.length > 0
                        ? parsed[0]
                        : "";

                }

            } catch (error) {

                // Normal URL/string
            }


            return image;

        }


        return "";

    };


    // =====================================================
    // VALID BANNERS
    // =====================================================

    const validBanners = banners.filter(
        banner =>
            getBannerImage(banner) !== ""
    );


    // =====================================================
    // HERO SLIDES
    // =====================================================

    const slides =
        validBanners.length > 0
            ? [
                validBanners[
                    validBanners.length - 1
                ],

                ...validBanners,

                validBanners[0]
            ]
            : [];


    // =====================================================
    // RESET SLIDER WHEN BANNERS LOAD
    // =====================================================

    useEffect(() => {

        if (validBanners.length === 0) {

            setIndex(0);

            return;

        }


        setIsMoving(false);

        setIndex(1);


        const timer = setTimeout(() => {

            setIsMoving(true);

        }, 50);


        return () => {

            clearTimeout(timer);

        };

    }, [validBanners.length]);


    // =====================================================
    // AUTO SLIDER
    // =====================================================

    useEffect(() => {

        if (validBanners.length <= 1) {
            return;
        }


        const timer = setInterval(() => {

            setIsMoving(true);

            setIndex(previous => previous + 1);

        }, 5000);


        return () => {

            clearInterval(timer);

        };

    }, [validBanners.length]);


    // =====================================================
    // INFINITE SLIDER LOOP
    // =====================================================

    useEffect(() => {

        if (
            slides.length > 1 &&
            index === slides.length - 1
        ) {

            const timer = setTimeout(() => {

                // Turn animation OFF
                setIsMoving(false);

                // Jump to first real banner
                setIndex(1);

            }, 2500);


            return () => {

                clearTimeout(timer);

            };

        }

    }, [
        index,
        slides.length
    ]);


    // =====================================================
    // TURN ANIMATION ON AGAIN
    // =====================================================

    useEffect(() => {

        if (!isMoving) {

            const timer = setTimeout(() => {

                setIsMoving(true);

            }, 50);


            return () => {

                clearTimeout(timer);

            };

        }

    }, [isMoving]);


    // =====================================================
    // GROUP PRODUCTS BY SUBCATEGORY
    // =====================================================

    const groupedProducts =
        products.reduce(

            (groups, product) => {

                // -----------------------------------------
                // Ignore missing subcategory
                // -----------------------------------------

                if (
                    !product.subcategory ||
                    !product.subcategory.trim()
                ) {

                    return groups;

                }


                const subcategory =
                    product.subcategory.trim();


                // -----------------------------------------
                // Create subcategory
                // -----------------------------------------

                if (
                    !groups[subcategory]
                ) {

                    groups[subcategory] = [];

                }


                // -----------------------------------------
                // Add product
                // -----------------------------------------

                groups[subcategory].push(product);


                return groups;

            },

            {}

        );


    // =====================================================
    // GET RANDOM 4 PRODUCTS
    // KEEP SAME PRODUCTS USING LOCAL STORAGE
    // =====================================================

    const getRandomProducts = (
        subcategory,
        productList
    ) => {

        const storageKey =
            `home_random_products_${subcategory}`;


        // =================================================
        // READ SAVED PRODUCTS
        // =================================================

        const savedIds =
            localStorage.getItem(
                storageKey
            );


        if (savedIds) {

            try {

                const ids =
                    JSON.parse(savedIds);


                // -----------------------------------------
                // Find saved products that still exist
                // -----------------------------------------

                const savedProducts =
                    ids
                        .map(
                            id =>
                                productList.find(
                                    product =>
                                        String(product.id) ===
                                        String(id)
                                )
                        )
                        .filter(Boolean);


                // -----------------------------------------
                // Required number of products
                // -----------------------------------------

                const requiredCount =
                    Math.min(
                        4,
                        productList.length
                    );


                // -----------------------------------------
                // If all saved products still exist,
                // use them
                // -----------------------------------------

                if (
                    savedProducts.length ===
                    requiredCount
                ) {

                    return savedProducts;

                }

            } catch (error) {

                console.error(
                    "Error reading saved random products:",
                    error
                );

            }

        }


        // =================================================
        // CREATE NEW RANDOM PRODUCTS
        // =================================================

        const shuffled =
            [...productList].sort(
                () =>
                    Math.random() - 0.5
            );


        const selected =
            shuffled.slice(0, 4);


        // =================================================
        // SAVE PRODUCT IDS
        // =================================================

        try {

            localStorage.setItem(
                storageKey,
                JSON.stringify(
                    selected.map(
                        product =>
                            product.id
                    )
                )
            );

        } catch (error) {

            console.error(
                "Unable to save random products:",
                error
            );

        }


        return selected;

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="home">


            {/* =================================================
                HERO BANNER
            ================================================= */}

            <section className="hero-banner">


                {/* -----------------------------------------
                    LOADING
                ----------------------------------------- */}

                {loadingBanners && (

                    <div className="hero-loading">

                        <p>
                            Loading banners...
                        </p>

                    </div>

                )}


                {/* -----------------------------------------
                    NO BANNERS
                ----------------------------------------- */}

                {!loadingBanners &&
                    validBanners.length === 0 && (

                        <div className="hero-empty">

                            <p>
                                No banners available.
                            </p>

                        </div>

                    )}


                {/* -----------------------------------------
                    SLIDER
                ----------------------------------------- */}

                {!loadingBanners &&
                    validBanners.length > 0 && (

                        <div
                            className="hero-slider"

                            style={{

                                transform:
                                    `translateX(-${index * 100}%)`,

                                transition:
                                    isMoving
                                        ? "transform 2.5s ease-in-out"
                                        : "none"

                            }}
                        >

                            {slides.map(
                                (banner, i) => {

                                    const image =
                                        getBannerImage(
                                            banner
                                        );


                                    return (

                                        <div
                                            className="hero-slide"

                                            key={
                                                `${banner.id}-${i}`
                                            }
                                        >

                                            <img
                                                src={image}

                                                alt={
                                                    banner.title ||
                                                    `Banner ${i + 1}`
                                                }

                                                onError={(event) => {

                                                    event.currentTarget.style.display =
                                                        "none";

                                                }}

                                            />

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

            </section>


            {/* =================================================
                SPECIAL CATEGORIES
            ================================================= */}

            <section className="home-specialcat">


                <div>

                    <img
                        src="/sm1.webp"
                        alt="Trending Gifts"
                    />

                    <h4>
                        Trending Gifts
                    </h4>

                </div>


                <div>

                    <img
                        src="/sm2.webp"
                        alt="Bestsellers"
                    />

                    <h4>
                        Bestsellers
                    </h4>

                </div>


                <div>

                    <img
                        src="/sm3.webp"
                        alt="Wedding Gifts"
                    />

                    <h4>
                        Wedding Gifts
                    </h4>

                </div>


                <div>

                    <img
                        src="/sm4.webp"
                        alt="Gifts Under 999"
                    />

                    <h4>
                        Gifts Under 999
                    </h4>

                </div>


                <div>

                    <img
                        src="/rg1.webp"
                        alt="Special Offers"
                    />

                    <h4>
                        Special Offers
                    </h4>

                </div>


                <div>

                    <img
                        src="/cus-gift32.webp"
                        alt="Limited Edition"
                    />

                    <h4>
                        Limited Edition
                    </h4>

                </div>


                <div>

                    <img
                        src="/tg12.webp"
                        alt="New Arrivals"
                    />

                    <h4>
                        New Arrivals
                    </h4>

                </div>


            </section>


            {/* =================================================
                PRODUCTS LOADING
            ================================================= */}

            {loading && (

                <div className="products-loading">

                    <p>
                        Loading products...
                    </p>

                </div>

            )}


            {/* =================================================
                NO PRODUCTS
            ================================================= */}

            {!loading &&
                products.length === 0 && (

                    <div className="no-products">

                        <p>
                            No products found.
                        </p>

                    </div>

                )}


            {/* =================================================
                PRODUCT SECTIONS
            ================================================= */}

            {!loading &&
                products.length > 0 && (

                    <>

                        {Object.entries(
                            groupedProducts
                        ).map(

                            ([
                                subcategory,
                                productList
                            ]) => {

                                // ---------------------------------
                                // Get saved/random 4
                                // ---------------------------------

                                const randomProducts =
                                    getRandomProducts(
                                        subcategory,
                                        productList
                                    );


                                // ---------------------------------
                                // Ignore empty groups
                                // ---------------------------------

                                if (
                                    randomProducts.length === 0
                                ) {

                                    return null;

                                }


                                return (

                                    <CategoryProducts

                                        key={
                                            subcategory
                                        }

                                        subcategory={
                                            subcategory
                                        }

                                        products={
                                            randomProducts
                                        }

                                    />

                                );

                            }

                        )}

                    </>

                )}

        </div>

    );

}