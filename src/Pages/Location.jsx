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

            {/* HEADER */}

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


            {/* PRODUCTS */}

            {products.length === 0 ? (

                <p>No products found.</p>

            ) : (

                <div className="subcategory-product-grid">

                    {products.map((product) => {

                        // Check whether offer price exists
                        const hasOffer =
                            product.offerprice !== undefined &&
                            product.offerprice !== null &&
                            product.offerprice !== "";


                        // Calculate discount
                        const discount = hasOffer
                            ? Math.round(
                                ((Number(product.price) -
                                    Number(product.offerprice)) /
                                    Number(product.price)) * 100
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

                                {/* IMAGE */}

                                <div className="subcategory-image">

                                    <img
                                        src={product.image?.[0]}
                                        alt={product.name}
                                    />

                                </div>


                                {/* NAME */}

                                <h3>
                                    {product.name}
                                </h3>


                                {/* PRICE */}

                                <div className="subcategory-price">

                                    {hasOffer ? (

                                        <>
                                            <span className="subcategory-offer-price">
                                                ₹{product.offerprice}
                                            </span>

                                            <span className="subcategory-original-price">
                                                ₹{product.price}
                                            </span>

                                            {discount > 0 && (
                                                <span className="subcategory-discount">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                        </>

                                    ) : (

                                        <span className="subcategory-offer-price">
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