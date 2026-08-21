import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getProducts,
    deleteProduct
} from "../api/productApi";


// =====================================================
// SUBCATEGORY PAGE
// =====================================================

export default function Subcategory() {

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
                    localStorage.getItem("user") ||
                    "null"
                );


            const admin =
                user?.role
                    ?.toString()
                    .toUpperCase() ===
                "ADMIN";


            console.log(
                "SUBCATEGORY USER:",
                user
            );

            console.log(
                "SUBCATEGORY ADMIN:",
                admin
            );


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
    // LOAD PRODUCTS FROM SPRING BOOT + MYSQL
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
                "PRODUCTS FROM DATABASE:",
                response.data
            );


            // Axios response

            if (
                response &&
                Array.isArray(response.data)
            ) {

                setProducts(
                    response.data
                );

            }

            // If API directly returns array

            else if (
                Array.isArray(response)
            ) {

                setProducts(
                    response
                );

            }

            else {

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

    const subcategoryProducts =
        products.filter(
            product => {

                return (
                    String(
                        product.subcategory || ""
                    ).trim().toLowerCase()
                    ===
                    String(
                        name
                    ).trim().toLowerCase()
                );

            }
        );


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDelete = async (
        event,
        product
    ) => {

        // Prevent product card click

        event.stopPropagation();


        // Extra admin protection

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

            console.log(
                "Deleting product:",
                product.id
            );


            await deleteProduct(
                product.id
            );


            // Remove from page immediately

            setProducts(
                previousProducts =>
                    previousProducts.filter(
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

        // Prevent product details navigation

        event.stopPropagation();


        // Extra admin protection

        if (!isAdmin) {

            return;

        }


        console.log(
            "Editing product:",
            product
        );


        // Save product

        localStorage.setItem(
            "editingProduct",
            JSON.stringify(product)
        );


        // Go to Admin page

        navigate("/admin");

    };


    // =====================================================
    // PRODUCT IMAGE
    // =====================================================

    const getProductImage = (
        image
    ) => {

        // No image

        if (!image) {

            return "/placeholder.png";

        }


        // Array

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


        // String

        if (
            typeof image === "string"
        ) {

            const trimmed =
                image.trim();


            if (!trimmed) {

                return "/placeholder.png";

            }


            // Try JSON array

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


            // Comma separated

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

            <div
                className="subcategory-page"
            >

                <div
                    className="subcategory-header"
                >

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

        <div
            className="subcategory-page"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="subcategory-header"
            >

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
                        ({subcategoryProducts.length})
                    </span>

                </h1>

            </div>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            {subcategoryProducts.length === 0 ? (

                <p
                    className="no-products"
                >

                    No products found.

                </p>

            ) : (

                <div
                    className="subcategory-product-grid"
                >

                    {subcategoryProducts.map(
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
                            // DISCOUNT
                            // =================================================

                            const discount =
                                price > 0 &&
                                offerprice > 0

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

                                    onKeyDown={(event) => {

                                        if (
                                            event.key ===
                                            "Enter" ||
                                            event.key ===
                                            " "
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
                                        className="subcategory-image-wrapper"
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
                                        className="product-price"
                                    >

                                        {offerprice > 0 ? (

                                            <>

                                                {/* OFFER PRICE */}

                                                <span
                                                    className="offer-price"
                                                >

                                                    ₹
                                                    {
                                                        offerprice
                                                    }

                                                </span>


                                                {/* ORIGINAL PRICE */}

                                                {price > 0 && (

                                                    <span
                                                        className="original-price"
                                                    >

                                                        ₹
                                                        {
                                                            price
                                                        }

                                                    </span>

                                                )}


                                                {/* DISCOUNT */}

                                                {discount > 0 && (

                                                    <span
                                                        className="discount"
                                                    >

                                                        {
                                                            discount
                                                        }% OFF

                                                    </span>

                                                )}

                                            </>

                                        ) : (

                                            <span
                                                className="offer-price"
                                            >

                                                ₹
                                                {
                                                    price
                                                }

                                            </span>

                                        )}

                                    </div>


                                    {/* =================================================
                                        ADMIN ACTIONS
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

                                            {/* EDIT */}

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


                                            {/* DELETE */}

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