import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Allproducts from "../Products/Allproducts";

export default function Subcategory() {

    const { subcategory } = useParams();
    const navigate = useNavigate();

    const name = decodeURIComponent(subcategory);

    const products = useMemo(() => {

        return Allproducts.filter(
            product => product.subcategory === name
        );

    }, [name]);


    return (

        <div className="subcategory-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="subcategory-header">

                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <h1>
                    {name}
                    <span> ({products.length})</span>
                </h1>

            </div>


            {/* =========================
                PRODUCTS
            ========================= */}

            {products.length === 0 ? (

                <p className="no-products">
                    No products found.
                </p>

            ) : (

                <div className="subcategory-product-grid">

                    {products.map((product) => {

                        const discount =
                            product.offerprice && product.price
                                ? Math.round(
                                    (
                                        (product.price - product.offerprice) /
                                        product.price
                                    ) * 100
                                )
                                : 0;


                        return (

                            <div
                                className="subcategory-card"
                                key={product.id}

                                onClick={() =>
                                    navigate(`/product/${product.id}`)
                                }

                                role="button"
                                tabIndex={0}

                                onKeyDown={(e) => {

                                    if (
                                        e.key === "Enter" ||
                                        e.key === " "
                                    ) {

                                        navigate(
                                            `/product/${product.id}`
                                        );

                                    }

                                }}
                            >

                                {/* PRODUCT IMAGE */}

                                <img
                                    src={product.image?.[0]}
                                    alt={product.name}
                                />


                                {/* PRODUCT NAME */}

                                <h3>
                                    {product.name}
                                </h3>


                                {/* PRICE */}

                                <div className="product-price">

                                    {product.offerprice ? (

                                        <>
                                            <span className="offer-price">
                                                ₹{product.offerprice}
                                            </span>

                                            <span className="original-price">
                                                ₹{product.price}
                                            </span>

                                            {discount > 0 && (

                                                <span className="discount">
                                                    {discount}% OFF
                                                </span>

                                            )}
                                        </>

                                    ) : (

                                        <span className="offer-price">
                                            ₹{product.price}
                                        </span>

                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>
    );
}