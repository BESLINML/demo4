import { useEffect, useState } from "react";

import Allproducts from "../Products/Allproducts";
import CategoryProducts from "./CategoryProducts";

const banners = [
    "/hom-img12.png",
    "/hom-img2.png",
    "/hom-img3.png",
    "/hom-img1.png"
];

export default function Home() {

    /*
        Original:

        [1] [2] [3] [4]

        With clones:

        [4] [1] [2] [3] [4] [1]
             ↑
           start
    */

    const slides = [
        banners[banners.length - 1],
        ...banners,
        banners[0]
    ];

    const [index, setIndex] = useState(1);
    const [isMoving, setIsMoving] = useState(true);

    // =========================
    // AUTO SLIDE
    // =========================

    useEffect(() => {

        const timer = setInterval(() => {

            setIsMoving(true);

            setIndex((prev) => prev + 1);

        }, 5000);

        return () => clearInterval(timer);

    }, []);


    // =========================
    // HANDLE INFINITE LOOP
    // =========================

    useEffect(() => {

        // Reached cloned first image
        if (index === slides.length - 1) {

            const resetTimer = setTimeout(() => {

                setIsMoving(false);

                setIndex(1);

            }, 2500);

            return () => clearTimeout(resetTimer);
        }

    }, [index, slides.length]);


    // =========================
    // TURN TRANSITION BACK ON
    // =========================

    useEffect(() => {

        if (!isMoving) {

            const timer = setTimeout(() => {

                setIsMoving(true);

            }, 50);

            return () => clearTimeout(timer);
        }

    }, [isMoving]);


    return (

        <div className="home">

            {/* =========================
                HERO BANNER
            ========================= */}

            <section className="hero-banner">

                <div
                    className="hero-slider"

                    style={{
                        transform: `translateX(-${index * 100}%)`,

                        transition: isMoving
                            ? "transform 2.5s ease-in-out"
                            : "none"
                    }}
                >

                    {slides.map((image, i) => (

                        <div
                            className="hero-slide"
                            key={i}
                        >

                            <img
                                src={image}
                                alt={`Banner ${i + 1}`}
                            />

                        </div>

                    ))}

                </div>

            </section>


            {/* =========================
                SPECIAL CATEGORIES
            ========================= */}

            <section className="home-specialcat">

                <div>
                    <img
                        src="/sm1.webp"
                        alt="Trending Gifts"
                    />
                    <h4>Trending Gifts</h4>
                </div>

                <div>
                    <img
                        src="/sm2.webp"
                        alt="Bestsellers"
                    />
                    <h4>Bestsellers</h4>
                </div>

                <div>
                    <img
                        src="/sm3.webp"
                        alt="Wedding Gifts"
                    />
                    <h4>Wedding Gifts</h4>
                </div>

                <div>
                    <img
                        src="/sm4.webp"
                        alt="Gifts Under 999"
                    />
                    <h4>Gifts Under 999</h4>
                </div>

                <div>
                    <img
                        src="/rg1.webp"
                        alt="Special Offers"
                    />
                    <h4>Special Offers</h4>
                </div>

                <div>
                    <img
                        src="/cus-gift32.webp"
                        alt="Limited Edition"
                    />
                    <h4>Limited Edition</h4>
                </div>

                <div>
                    <img
                        src="/tg12.webp"
                        alt="New Arrivals"
                    />
                    <h4>New Arrivals</h4>
                </div>

            </section>


            {/* =========================
                PRODUCTS
            ========================= */}

            {Object.entries(

                Allproducts.reduce(

                    (groups, product) => {

                        if (!product.subcategory) {
                            return groups;
                        }

                        if (!groups[product.subcategory]) {
                            groups[product.subcategory] = [];
                        }

                        groups[product.subcategory].push(product);

                        return groups;

                    },

                    {}

                )

            ).map(

                ([subcategory, products]) => (

                    <CategoryProducts
                        key={subcategory}
                        subcategory={subcategory}
                        products={products}
                    />

                )

            )}

        </div>
    );
}