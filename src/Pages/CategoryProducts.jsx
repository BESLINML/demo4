import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteProduct } from "../api/productApi";


// =====================================================
// CATEGORY PRODUCTS
// =====================================================

export default function CategoryProducts({
    subcategory,
    products
}) {

    const navigate = useNavigate();


    // =====================================================
    // ADMIN CHECK
    // =====================================================

    const [isAdmin, setIsAdmin] = useState(false);


    useEffect(() => {

        const user =
            JSON.parse(
                localStorage.getItem("user") || "null"
            );

        console.log("CATEGORY USER:", user);
        console.log("CATEGORY ROLE:", user?.role);

        setIsAdmin(
            user?.role?.toString().toUpperCase() === "ADMIN"
        );

    }, []);


    // =====================================================
    // RANDOM PRODUCTS
    // =====================================================

    const [randomProducts, setRandomProducts] =
        useState(() => {

            return [...products]
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);

        });


    // =====================================================
    // UPDATE RANDOM PRODUCTS
    // =====================================================

    useEffect(() => {

        setRandomProducts(

            [...products]
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)

        );

    }, [products]);


    // =====================================================
    // ADMIN = ALL PRODUCTS
    // USER = 4 PRODUCTS
    // =====================================================

    const displayedProducts =
        isAdmin
            ? products
            : randomProducts;


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDelete = async (
        event,
        product
    ) => {

        event.stopPropagation();

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${product.name}"?`
            );

        if (!confirmed) {
            return;
        }


        try {

            await deleteProduct(product.id);

            alert(
                "Product deleted successfully"
            );


            // Remove from current display

            setRandomProducts(
                previous =>
                    previous.filter(
                        item =>
                            item.id !== product.id
                    )
            );


        } catch (error) {

            console.error(
                "Delete product error:",
                error
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


        localStorage.setItem(
            "editingProduct",
            JSON.stringify(product)
        );


        navigate("/admin");

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <section
            className="home-category-section"
        >

            {/* CATEGORY HEADER */}

            <div
                className="home-category-header"
            >

                <h2>
                    {subcategory}
                </h2>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/category/${encodeURIComponent(
                                subcategory
                            )}`
                        )
                    }
                >

                    View All

                </button>

            </div>


            {/* PRODUCT ROW */}

            <div
                className="home-product-row"
            >

                {displayedProducts.map(
                    product => (

                        <ProductCard

                            key={product.id}

                            product={product}

                            isAdmin={isAdmin}

                            onClick={() =>
                                navigate(
                                    `/product/${product.id}`
                                )
                            }

                            onEdit={handleEdit}

                            onDelete={handleDelete}

                        />

                    )
                )}

            </div>

        </section>

    );

}


// =====================================================
// PRODUCT CARD
// =====================================================

export function ProductCard({

    product,
    onClick,
    isAdmin,
    onEdit,
    onDelete

}) {

    const [imageIndex, setImageIndex] =
        useState(0);

    const [isHovered, setIsHovered] =
        useState(false);


    // =====================================================
    // DIRECT ADMIN CHECK
    // =====================================================

    const storedUser =
        JSON.parse(
            localStorage.getItem("user") || "null"
        );


    const adminUser =
        storedUser?.role
            ?.toString()
            .toUpperCase() === "ADMIN";


    console.log(
        "PRODUCT:",
        product.name,
        "ADMIN:",
        adminUser
    );


    // =====================================================
    // GET PRODUCT IMAGES
    // =====================================================

    const getProductImages = (image) => {

        if (!image) {

            return [
                "/placeholder.png"
            ];

        }


        // ARRAY

        if (Array.isArray(image)) {

            const images =
                image.filter(
                    item =>
                        typeof item === "string" &&
                        item.trim() !== ""
                );

            return images.length
                ? images
                : ["/placeholder.png"];

        }


        // STRING

        if (typeof image === "string") {

            const trimmed =
                image.trim();


            if (!trimmed) {

                return [
                    "/placeholder.png"
                ];

            }


            // JSON ARRAY

            try {

                const parsed =
                    JSON.parse(trimmed);


                if (
                    Array.isArray(parsed)
                ) {

                    const images =
                        parsed.filter(
                            item =>
                                typeof item === "string" &&
                                item.trim() !== ""
                        );


                    if (images.length) {

                        return images;

                    }

                }

            } catch (error) {

                // Normal image URL

            }


            // COMMA SEPARATED

            if (
                trimmed.includes(",")
            ) {

                const images =
                    trimmed
                        .split(",")
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean);


                if (images.length) {

                    return images;

                }

            }


            return [
                trimmed
            ];

        }


        return [
            "/placeholder.png"
        ];

    };


    const productImages =
        getProductImages(
            product.image
        );


    // =====================================================
    // RESET IMAGE
    // =====================================================

    useEffect(() => {

        setImageIndex(0);

    }, [
        product.image
    ]);


    // =====================================================
    // HOVER IMAGE SLIDER
    // =====================================================

    useEffect(() => {

        if (
            !isHovered ||
            productImages.length <= 1
        ) {

            return;

        }


        const interval =
            setInterval(() => {

                setImageIndex(
                    previous =>
                        (
                            previous + 1
                        ) %
                        productImages.length
                );

            }, 1000);


        return () => {

            clearInterval(
                interval
            );

        };

    }, [
        isHovered,
        product.image,
        productImages.length
    ]);


    // =====================================================
    // PRICE
    // =====================================================

    const price =
        Number(product.price) || 0;


    const offerprice =
        Number(product.offerprice) || 0;


    // =====================================================
    // DISCOUNT
    // =====================================================

    const discount =
        price > 0 &&
        offerprice > 0

            ? Math.round(
                (
                    (price - offerprice) /
                    price
                ) * 100
            )

            : 0;


    // =====================================================
    // CARD
    // =====================================================

    return (

        <div
            className="home-product-card"

            onClick={onClick}

            onMouseEnter={() =>
                setIsHovered(true)
            }

            onMouseLeave={() => {

                setIsHovered(false);

                setImageIndex(0);

            }}
        >

            {/* =================================================
                IMAGE
            ================================================= */}

            <div
                className="home-product-image"
            >

                <img
                    src={
                        productImages[
                            imageIndex
                        ] ||
                        "/placeholder.png"
                    }

                    alt={
                        product.name ||
                        "Product"
                    }
                />

            </div>


            {/* =================================================
                ADMIN BUTTONS
            ================================================= */}

            {adminUser && (

                <div
                    className="home-admin-actions"

                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >

                    <button
                        type="button"

                        className="home-edit-btn"

                        onClick={(event) =>
                            onEdit(
                                event,
                                product
                            )
                        }
                    >

                        Edit

                    </button>


                    <button
                        type="button"

                        className="home-delete-btn"

                        onClick={(event) =>
                            onDelete(
                                event,
                                product
                            )
                        }
                    >

                        Delete

                    </button>

                </div>

            )}


            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div
                className="home-product-info"
            >

                <h3>
                    {product.name}
                </h3>


                <div
                    className="product-price"
                >

                    <span
                        className="offer-price"
                    >

                        ₹{offerprice}

                    </span>


                    {price > 0 && (

                        <span
                            className="original-price"
                        >

                            ₹{price}

                        </span>

                    )}


                    {discount > 0 && (

                        <span
                            className="discount"
                        >

                            {discount}% OFF

                        </span>

                    )}

                </div>

            </div>

        </div>

    );

}