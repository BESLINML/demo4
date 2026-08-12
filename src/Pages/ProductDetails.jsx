import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CartProvider, { CartContext } from "./CartContext";

import Allproducts from "../Products/Allproducts";

export default function ProductDetails() {

    const {addToCart} = useContext(CartContext);
    const [message, setMessage] = useState("");

    const { id } = useParams();

    const navigate = useNavigate();

    const product = Allproducts.find(
    item => String(item.id) === id

);

const productImages = product
    ? (
        Array.isArray(product.image)
        ? product.image
        : product.image
        ? [product.image]
        : []
      )
    : [];

    const [selectedImage, setSelectedImage] = useState(0);


    // If product doesn't exist
    if (!product) {
        return (
            <div>
                <h2>Product not found</h2>

                <button onClick={() => navigate("/")}>
                    Go Home
                </button>
            </div>
        );
    }


    // Other products from same subcategory
    const relatedProducts = Allproducts
        .filter(
            item =>
                item.subcategory === product.subcategory &&
                item.id !== product.id
        )
        .slice(0, 4);

        const discount =
        product.offerprice && product.price
            ? Math.round(
                ((product.price - product.offerprice) /
                    product.price) * 100
            )
            : 0;


    return (
        <div className="product-details-page">


            {/* MAIN PRODUCT */}

            <div className="product-details-container">

                {/* LEFT */}

                <div className="product-left">

                    <div className="product-thumbnails">

                        {productImages.map(
                            (image, index) => (

                                <div
                                    key={index}
                                    className={
                                        selectedImage === index
                                            ? "thumbnail active"
                                            : "thumbnail"
                                    }

                                    onClick={() =>
                                        setSelectedImage(index)
                                    }
                                >

                                    <img
                                        src={image}
                                        alt={product.name}
                                    />

                                </div>

                            )
                        )}

                    </div>


                    <div className="product-main-image">

                        <img
                            src={productImages[selectedImage]}
                            alt={product.name}
                        />

                    </div>

                </div>


                {/* RIGHT */}

                <div className="product-right">

                    <h1>
                        {product.name}
                    </h1>

                <div className="product-price">

                    <span className="offer-pricemain">
                        ₹{product.offerprice}/-
                    </span>

                     <span className="original-price">
                        ₹{product.price}
                    </span>


                </div >
                    <hr />

                    <h3>
                        Product Description
                    </h3>

                    <p>
                        {product.description}
                    </p>

   
                    <div className="product-buttons">
                             
                        <button
    className="cart-button"

    onClick={() => {

        addToCart(product);

        setMessage("Product added to cart!");

        setTimeout(() => {
            setMessage("");
        }, 2000);

    }}
>
    Add to Cart
</button>

                        <button
    className="buy-button"
    onClick={() => {
        addToCart(product);
        navigate("/cart");
    }}
>
    Buy Now
</button>


                    </div>
                                                        {
    message && (
        <div className="cart-notification">
            {message}
        </div>
    )
}
 
                </div>

            </div>


            {/* RELATED PRODUCTS */}

            <div className="related-products">

                <h2>
                    Related Products
                </h2>


                <div className="related-row">

                    {relatedProducts.map(
                        relatedProduct => (

                            <div
                                className="related-card"
                                key={relatedProduct.id}

                                onClick={() =>
                                    navigate(
                                        `/product/${relatedProduct.id}`
                                    )
                                }
                            >

                                <img
                                    src={
 Array.isArray(relatedProduct.image)
 ? relatedProduct.image[0]
 : relatedProduct.image
}
                                    alt={
                                        relatedProduct.name
                                    }
                                />

                                <h3>
                                    {relatedProduct.name}
                                </h3>

                                                <div className="product-price">

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

                </div>

                            </div>

                        )
                    )}

                </div>

            </div>

        </div>
    );
}