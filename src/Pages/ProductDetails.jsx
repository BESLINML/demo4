import { useEffect, useState, useContext } from "react";

import {useParams, useNavigate} from "react-router-dom";

import { CartContext } from "./CartContext";

import { getProducts, deleteProduct} from "../api/productApi";


export default function ProductDetails() {

    const { addToCart } =
        useContext(CartContext);


    const [message, setMessage] =
        useState("");


    const [product, setProduct] =
        useState(null);


    const [allProducts, setAllProducts] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [selectedImage, setSelectedImage] =
        useState(0);


    const [isAdmin, setIsAdmin] =
        useState(false);


    const { id } =
        useParams();


    const navigate =
        useNavigate();


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


            console.log(
                "PRODUCT DETAILS USER:",
                user
            );

            console.log(
                "PRODUCT DETAILS ADMIN:",
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
    // GET PRODUCTS FROM SPRING BOOT + MYSQL
    // =====================================================

    useEffect(() => {

        loadProducts();

    }, [id]);


    const loadProducts = async () => {

        try {

            setLoading(true);


            const response =
                await getProducts();


            /*
                Axios normally returns:

                {
                    data: [...]
                }
            */


            const data =
                Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : [];


            console.log(
                "Products from Spring Boot:",
                data
            );


            setAllProducts(data);


            const foundProduct =
                data.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            setProduct(foundProduct || null);


            setSelectedImage(0);


        } catch (error) {

            console.error(
                "Error loading product:",
                error
            );

            setProduct(null);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDelete = async () => {

        if (!isAdmin) {

            return;

        }


        if (!product) {

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


            alert(
                "Product deleted successfully"
            );


            // Go back to home

            navigate("/");


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

    const handleEdit = () => {

        if (!isAdmin) {

            return;

        }


        if (!product) {

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


        // Open admin page

        navigate("/admin");

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div
                className="product-loading"
            >

                <h2>
                    Loading product...
                </h2>

            </div>

        );

    }


    // =====================================================
    // PRODUCT NOT FOUND
    // =====================================================

    if (!product) {

        return (

            <div
                className="product-not-found"
            >

                <h2>
                    Product not found
                </h2>


                <button
                    onClick={() =>
                        navigate("/")
                    }
                >

                    Go Home

                </button>

            </div>

        );

    }


    // =====================================================
    // PRODUCT IMAGES
    // =====================================================

    let productImages = [];


    if (
        Array.isArray(
            product.image
        )
    ) {

        productImages =
            product.image.filter(
                image =>
                    typeof image === "string" &&
                    image.trim() !== ""
            );

    }

    else if (
        typeof product.image === "string" &&
        product.image.trim() !== ""
    ) {

        const imageString =
            product.image.trim();


        try {

            const parsedImages =
                JSON.parse(
                    imageString
                );


            if (
                Array.isArray(
                    parsedImages
                )
            ) {

                productImages =
                    parsedImages.filter(
                        image =>
                            typeof image === "string" &&
                            image.trim() !== ""
                    );

            }

            else {

                productImages = [
                    imageString
                ];

            }

        } catch (error) {

            /*
                Normal image URL
            */

            if (
                imageString.includes(",")
            ) {

                productImages =
                    imageString
                        .split(",")
                        .map(
                            image =>
                                image.trim()
                        )
                        .filter(Boolean);

            } else {

                productImages = [
                    imageString
                ];

            }

        }

    }


    // =====================================================
    // FALLBACK IMAGE
    // =====================================================

    if (
        productImages.length === 0
    ) {

        productImages = [
            "/placeholder.png"
        ];

    }


    // =====================================================
    // RELATED PRODUCTS
    // =====================================================

    const relatedProducts =
        allProducts
            .filter(
                item =>

                    String(
                        item.subcategory || ""
                    ).trim().toLowerCase()
                    ===
                    String(
                        product.subcategory || ""
                    ).trim().toLowerCase()

                    &&

                    String(item.id) !==
                    String(product.id)

            )
            .slice(0, 4);


    // =====================================================
    // PRICE
    // =====================================================

    const price =
        Number(
            product.price
        ) || 0;


    const offerprice =
        Number(
            product.offerprice
        ) || 0;


    // =====================================================
    // DISCOUNT
    // =====================================================

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


    // =====================================================
    // ADD TO CART
    // =====================================================

    const handleAddToCart = () => {

        addToCart(product);


        setMessage(
            "Product added to cart!"
        );


        setTimeout(() => {

            setMessage("");

        }, 2000);

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div
            className="product-details-page"
        >


            {/* =================================================
                MAIN PRODUCT
            ================================================= */}

            <div
                className="product-details-container"
            >


                {/* =================================================
                    LEFT
                ================================================= */}

                <div
                    className="product-left"
                >


                    {/* THUMBNAILS */}

                    <div
                        className="product-thumbnails"
                    >

                        {productImages.map(
                            (
                                image,
                                index
                            ) => (

                                <div

                                    key={index}

                                    className={
                                        selectedImage === index
                                            ? "thumbnail active"
                                            : "thumbnail"
                                    }

                                    onClick={() =>
                                        setSelectedImage(
                                            index
                                        )
                                    }

                                >

                                    <img
                                        src={image}
                                        alt={
                                            product.name
                                        }

                                        onError={(
                                            event
                                        ) => {

                                            event.currentTarget.src =
                                                "/placeholder.png";

                                        }}

                                    />

                                </div>

                            )
                        )}

                    </div>


                    {/* MAIN IMAGE */}

                    <div
                        className="product-main-image"
                    >

                        <img

                            src={
                                productImages[
                                    selectedImage
                                ] ||
                                "/placeholder.png"
                            }

                            alt={
                                product.name
                            }

                            onError={(
                                event
                            ) => {

                                event.currentTarget.src =
                                    "/placeholder.png";

                            }}

                        />

                    </div>

                </div>


                {/* =================================================
                    RIGHT
                ================================================= */}

                <div
                    className="product-right"
                >


                    {/* PRODUCT NAME */}

                    <h1>
                        {product.name}
                    </h1>


                    {/* =================================================
                        PRICE
                    ================================================= */}

                    <div
                        className="product-price"
                    >

                        <span
                            className="offer-pricemain"
                        >

                            ₹
                            {
                                offerprice > 0
                                    ? offerprice
                                    : price
                            }
                            /-

                        </span>


                        {offerprice > 0 &&
                            price > 0 && (

                                <span
                                    className="original-price"
                                >

                                    ₹
                                    {price}

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


                    <hr />


                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <h3>
                        Product Description
                    </h3>


                    <p>
                        {
                            product.description ||
                            "No description available."
                        }
                    </p>


                    {/* =================================================
                        ADMIN EDIT / DELETE
                    ================================================= */}

                    {isAdmin && (

                        <div
                            className="product-admin-actions"
                        >

                            <button
                                type="button"

                                className="product-edit-btn"

                                onClick={
                                    handleEdit
                                }
                            >

                                <i className="bi bi-pencil"></i>

                                Edit Product

                            </button>


                            <button
                                type="button"

                                className="product-delete-btn"

                                onClick={
                                    handleDelete
                                }
                            >

                                <i className="bi bi-trash"></i>

                                Delete Product

                            </button>

                        </div>

                    )}


                    {/* =================================================
                        CART / BUY BUTTONS
                    ================================================= */}

                    <div
                        className="product-buttons"
                    >

                        {/* ADD TO CART */}

                        <button
                            className="cart-button"

                            onClick={
                                handleAddToCart
                            }
                        >

                            Add to Cart

                        </button>


                        {/* BUY NOW */}

                        <button
                            className="buy-button"

                            onClick={() => {

                                addToCart(
                                    product
                                );

                                navigate(
                                    "/cart"
                                );

                            }}
                        >

                            Buy Now

                        </button>

                    </div>


                    {/* =================================================
                        NOTIFICATION
                    ================================================= */}

                    {message && (

                        <div
                            className="cart-notification"
                        >

                            {message}

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                RELATED PRODUCTS
            ================================================= */}

            <div
                className="related-products"
            >

                <h2>
                    Related Products
                </h2>


                <div
                    className="related-row"
                >

                    {relatedProducts.map(
                        relatedProduct => {

                            // =================================================
                            // RELATED IMAGE
                            // =================================================

                            let relatedImages =
                                [];


                            if (
                                Array.isArray(
                                    relatedProduct.image
                                )
                            ) {

                                relatedImages =
                                    relatedProduct.image;

                            }

                            else if (
                                typeof relatedProduct.image ===
                                    "string" &&
                                relatedProduct.image.trim() !== ""
                            ) {

                                const imageString =
                                    relatedProduct.image.trim();


                                try {

                                    const parsed =
                                        JSON.parse(
                                            imageString
                                        );


                                    if (
                                        Array.isArray(
                                            parsed
                                        )
                                    ) {

                                        relatedImages =
                                            parsed;

                                    }

                                    else {

                                        relatedImages = [
                                            imageString
                                        ];

                                    }

                                } catch {

                                    if (
                                        imageString.includes(",")
                                    ) {

                                        relatedImages =
                                            imageString
                                                .split(",")
                                                .map(
                                                    image =>
                                                        image.trim()
                                                )
                                                .filter(Boolean);

                                    } else {

                                        relatedImages = [
                                            imageString
                                        ];

                                    }

                                }

                            }


                            const relatedImage =
                                relatedImages.length > 0
                                    ? relatedImages[0]
                                    : "/placeholder.png";


                            // =================================================
                            // RELATED PRICE
                            // =================================================

                            const relatedPrice =
                                Number(
                                    relatedProduct.price
                                ) || 0;


                            const relatedOfferPrice =
                                Number(
                                    relatedProduct.offerprice
                                ) || 0;


                            // =================================================
                            // RELATED DISCOUNT
                            // =================================================

                            const relatedDiscount =
                                relatedPrice > 0 &&
                                relatedOfferPrice > 0

                                    ? Math.round(
                                        (
                                            (
                                                relatedPrice -
                                                relatedOfferPrice
                                            ) /
                                            relatedPrice
                                        ) * 100
                                    )

                                    : 0;


                            return (

                                <div

                                    className="related-card"

                                    key={
                                        relatedProduct.id
                                    }

                                    onClick={() =>
                                        navigate(
                                            `/product/${relatedProduct.id}`
                                        )
                                    }

                                >


                                    {/* IMAGE */}

                                    <img

                                        src={
                                            relatedImage
                                        }

                                        alt={
                                            relatedProduct.name
                                        }

                                        onError={(
                                            event
                                        ) => {

                                            event.currentTarget.src =
                                                "/placeholder.png";

                                        }}

                                    />


                                    {/* NAME */}

                                    <h3>

                                        {
                                            relatedProduct.name
                                        }

                                    </h3>


                                    {/* PRICE */}

                                    <div
                                        className="product-price"
                                    >

                                        {relatedOfferPrice > 0 ? (

                                            <>

                                                <span
                                                    className="offer-price"
                                                >

                                                    ₹
                                                    {
                                                        relatedOfferPrice
                                                    }

                                                </span>


                                                {relatedPrice > 0 && (

                                                    <span
                                                        className="original-price"
                                                    >

                                                        ₹
                                                        {
                                                            relatedPrice
                                                        }

                                                    </span>

                                                )}


                                                {relatedDiscount > 0 && (

                                                    <span
                                                        className="discount"
                                                    >

                                                        {
                                                            relatedDiscount
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
                                                    relatedPrice
                                                }

                                            </span>

                                        )}

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>

        </div>

    );

}