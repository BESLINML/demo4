import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getProducts,
    deleteProduct
} from "../api/productApi";


export default function Location() {

    const { subcategory } = useParams();

    const navigate = useNavigate();


    // =====================================================
    // SUBCATEGORY NAME
    // =====================================================

    const name =
        decodeURIComponent(
            subcategory || ""
        );


    // =====================================================
    // PRODUCTS
    // =====================================================

    const [products, setProducts] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    // =====================================================
    // ADMIN
    // =====================================================

    const [isAdmin, setIsAdmin] =
        useState(false);


    // =====================================================
    // CHECK ADMIN
    // =====================================================

    useEffect(() => {

        try {

            const user =
                JSON.parse(
                    localStorage.getItem("user") || "null"
                );


            const admin =
                user?.role
                    ?.toString()
                    .toUpperCase() === "ADMIN";


            setIsAdmin(admin);

        } catch (error) {

            console.error(
                "Admin check error:",
                error
            );

            setIsAdmin(false);

        }

    }, []);


    // =====================================================
    // GET PRODUCTS FROM SPRING BOOT + MYSQL
    // =====================================================

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

        try {

            setLoading(true);


            const response =
                await getProducts();


            console.log(
                "DATABASE PRODUCTS:",
                response.data
            );


            if (
                response &&
                Array.isArray(response.data)
            ) {

                setProducts(
                    response.data
                );

            } else if (
                Array.isArray(response)
            ) {

                setProducts(
                    response
                );

            } else {

                setProducts([]);

            }

        } catch (error) {

            console.error(
                "Failed to load products:",
                error
            );

            setProducts([]);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // FILTER SUBCATEGORY
    // =====================================================

    const filteredProducts =
        products.filter(
            product =>
                String(
                    product.subcategory || ""
                )
                    .trim()
                    .toLowerCase()
                ===
                String(name)
                    .trim()
                    .toLowerCase()
        );


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDelete = async (
        event,
        product
    ) => {

        event.stopPropagation();


        if (!isAdmin) {

            return;

        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${product.name}"?`
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteProduct(
                product.id
            );


            setProducts(
                previous =>
                    previous.filter(
                        item =>
                            item.id !==
                            product.id
                    )
            );


            alert(
                "Product deleted successfully"
            );

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            alert(
                "Failed to delete product"
            );

        }

    };


    // =====================================================
    // EDIT PRODUCT
    // =====================================================

    const handleEdit = (
        event,
        product
    ) => {

        event.stopPropagation();


        if (!isAdmin) {

            return;

        }


        localStorage.setItem(
            "editingProduct",
            JSON.stringify(product)
        );


        navigate("/admin");

    };


    // =====================================================
    // GET PRODUCT IMAGE
    // =====================================================

    const getProductImage = (
        image
    ) => {

        if (!image) {

            return "/placeholder.png";

        }


        // ARRAY

        if (
            Array.isArray(image)
        ) {

            const firstImage =
                image.find(
                    item =>
                        typeof item === "string" &&
                        item.trim() !== ""
                );


            return firstImage ||
                "/placeholder.png";

        }


        // STRING

        if (
            typeof image === "string"
        ) {

            const trimmed =
                image.trim();


            if (!trimmed) {

                return "/placeholder.png";

            }


            // JSON ARRAY

            try {

                const parsed =
                    JSON.parse(
                        trimmed
                    );


                if (
                    Array.isArray(parsed)
                ) {

                    const firstImage =
                        parsed.find(
                            item =>
                                typeof item === "string" &&
                                item.trim() !== ""
                        );


                    if (firstImage) {

                        return firstImage;

                    }

                }

            } catch (error) {

                // Normal image URL

            }


            // COMMA SEPARATED

            if (
                trimmed.includes(",")
            ) {

                const firstImage =
                    trimmed
                        .split(",")
                        .map(
                            item =>
                                item.trim()
                        )
                        .find(Boolean);


                return firstImage ||
                    "/placeholder.png";

            }


            return trimmed;

        }


        return "/placeholder.png";

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="subcategory-page">

                <div className="subcategory-header">

                    <button
                        className="back-button"

                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        ← Back

                    </button>


                    <h1>
                        {name}
                    </h1>

                </div>


                <p className="no-products">

                    Loading products...

                </p>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="subcategory-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="subcategory-header">

                <button
                    className="back-button"

                    onClick={() =>
                        navigate(-1)
                    }
                >

                    ← Back

                </button>


                <h1>

                    {name}

                    <span>
                        {" "}
                        ({filteredProducts.length})
                    </span>

                </h1>

            </div>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            {filteredProducts.length === 0 ? (

                <p className="no-products">

                    No products found.

                </p>

            ) : (

                <div className="subcategory-product-grid">

                    {filteredProducts.map(
                        product => {

                            // =================================================
                            // PRICE
                            // =================================================

                            const price =
                                Number(
                                    product.price
                                ) || 0;


                            const offerprice =
                                Number(
                                    product.offerprice
                                ) || 0;


                            // =================================================
                            // OFFER
                            // =================================================

                            const hasOffer =
                                offerprice > 0;


                            // =================================================
                            // DISCOUNT
                            // =================================================

                            const discount =
                                hasOffer &&
                                price > 0

                                    ? Math.round(
                                        (
                                            (
                                                price -
                                                offerprice
                                            ) /
                                            price
                                        ) * 100
                                    )

                                    : 0;


                            return (

                                <div
                                    className="subcategory-card"

                                    key={
                                        product.id
                                    }

                                    onClick={() =>
                                        navigate(
                                            `/product/${product.id}`
                                        )
                                    }

                                    role="button"

                                    tabIndex={0}

                                    onKeyDown={(
                                        event
                                    ) => {

                                        if (
                                            event.key === "Enter" ||
                                            event.key === " "
                                        ) {

                                            event.preventDefault();

                                            navigate(
                                                `/product/${product.id}`
                                            );

                                        }

                                    }}
                                >

                                    {/* =================================================
                                        IMAGE
                                    ================================================= */}

                                    <div
                                        className="subcategory-image"
                                    >

                                        <img

                                            src={
                                                getProductImage(
                                                    product.image
                                                )
                                            }

                                            alt={
                                                product.name ||
                                                "Product"
                                            }

                                            onError={(
                                                event
                                            ) => {

                                                event.currentTarget.src =
                                                    "/placeholder.png";

                                            }}

                                        />

                                    </div>


                                    {/* =================================================
                                        PRODUCT NAME
                                    ================================================= */}

                                    <h3>

                                        {
                                            product.name
                                        }

                                    </h3>


                                    {/* =================================================
                                        PRICE
                                    ================================================= */}

                                    <div
                                        className="subcategory-price"
                                    >

                                        {hasOffer ? (

                                            <>

                                                <span
                                                    className="subcategory-offer-price"
                                                >

                                                    ₹
                                                    {
                                                        offerprice
                                                    }

                                                </span>


                                                <span
                                                    className="subcategory-original-price"
                                                >

                                                    ₹
                                                    {
                                                        price
                                                    }

                                                </span>


                                                {discount > 0 && (

                                                    <span
                                                        className="subcategory-discount"
                                                    >

                                                        {
                                                            discount
                                                        }% OFF

                                                    </span>

                                                )}

                                            </>

                                        ) : (

                                            <span
                                                className="subcategory-offer-price"
                                            >

                                                ₹
                                                {
                                                    price
                                                }

                                            </span>

                                        )}

                                    </div>


                                    {/* =================================================
                                        ADMIN EDIT / DELETE
                                    ================================================= */}

                                    {isAdmin && (

                                        <div
                                            className="subcategory-admin-actions"

                                            onClick={(
                                                event
                                            ) =>
                                                event.stopPropagation()
                                            }
                                        >

                                            <button
                                                type="button"

                                                className="subcategory-edit-btn"

                                                onClick={(
                                                    event
                                                ) =>
                                                    handleEdit(
                                                        event,
                                                        product
                                                    )
                                                }
                                            >

                                                <i className="bi bi-pencil"></i>

                                                Edit

                                            </button>


                                            <button
                                                type="button"

                                                className="subcategory-delete-btn"

                                                onClick={(
                                                    event
                                                ) =>
                                                    handleDelete(
                                                        event,
                                                        product
                                                    )
                                                }
                                            >

                                                <i className="bi bi-trash"></i>

                                                Delete

                                            </button>

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