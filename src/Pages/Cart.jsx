import { useContext } from "react";
import { CartContext } from "./CartContext";

export default function Cart() {

    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } = useContext(CartContext);


    // =========================
    // GET PRODUCT IMAGE
    // =========================

    const getProductImage = (product) => {

        // Already an array
        if (Array.isArray(product.image)) {

            return product.image[0] || "/placeholder.png";

        }


        // JSON string from MySQL
        if (
            typeof product.image === "string" &&
            product.image.trim() !== ""
        ) {

            try {

                const parsedImages =
                    JSON.parse(product.image);


                if (Array.isArray(parsedImages)) {

                    return (
                        parsedImages[0] ||
                        "/placeholder.png"
                    );

                }

            } catch (error) {

                // Normal single image string
                return product.image;

            }

        }


        return "/placeholder.png";
    };


    // =========================
    // SUBTOTAL
    // =========================

    const subtotal = cartItems.reduce(

        (total, product) => {

            const quantity =
                product.quantity || 1;

            const price =
                Number(product.offerprice) || 0;

            return total + price * quantity;

        },

        0

    );


    // =========================
    // SHIPPING
    // =========================

    const shipping =
        subtotal > 0
            ? 150
            : 0;


    // =========================
    // GRAND TOTAL
    // =========================

    const grandTotal =
        subtotal + shipping;


    return (

        <div className="cart-page">

            <div className="cart-container">


                {/* =========================
                    LEFT
                ========================= */}

                <div className="cart-left">

                    <h1>
                        Your Bag
                    </h1>


                    {/* =========================
                        EMPTY CART
                    ========================= */}

                    {cartItems.length === 0 ? (

                        <div className="empty-cart">

                            <p>
                                Your bag is empty.
                            </p>

                        </div>

                    ) : (


                        /* =========================
                            CART PRODUCTS
                        ========================= */

                        cartItems.map((product) => {


                            const quantity =
                                product.quantity || 1;


                            const productPrice =
                                Number(
                                    product.offerprice
                                ) || 0;


                            const productTotal =
                                productPrice *
                                quantity;


                            return (

                                <div
                                    className="cart-product"
                                    key={product.id}
                                >


                                    {/* =========================
                                        IMAGE
                                    ========================= */}

                                    <div className="cart-image">

                                        <img
                                            src={
                                                getProductImage(
                                                    product
                                                )
                                            }
                                            alt={
                                                product.name
                                            }
                                        />

                                    </div>


                                    {/* =========================
                                        DETAILS
                                    ========================= */}

                                    <div className="cart-details">


                                        <h2>
                                            {product.name}
                                        </h2>


                                        {/* PRICE */}

                                        <div className="cart-item-price">

                                            <span>
                                                ₹
                                                {
                                                    productPrice.toLocaleString(
                                                        "en-IN"
                                                    )
                                                }
                                            </span>

                                        </div>


                                        {/* =========================
                                            QUANTITY
                                        ========================= */}

                                        <div className="cart-info">

                                            <div>

                                                <span>
                                                    Quantity
                                                </span>


                                                <div className="quantity">


                                                    {/* MINUS */}

                                                    <button
                                                        onClick={() =>
                                                            decreaseQuantity(
                                                                product.id
                                                            )
                                                        }

                                                        disabled={
                                                            quantity <= 1
                                                        }
                                                    >
                                                        −
                                                    </button>


                                                    {/* NUMBER */}

                                                    <span>
                                                        {
                                                            quantity
                                                        }
                                                    </span>


                                                    {/* PLUS */}

                                                    <button
                                                        onClick={() =>
                                                            increaseQuantity(
                                                                product.id
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>


                                                </div>

                                            </div>

                                        </div>


                                        {/* =========================
                                            REMOVE
                                        ========================= */}

                                        <button
                                            className="remove-btn"

                                            onClick={() =>
                                                removeFromCart(
                                                    product.id
                                                )
                                            }
                                        >
                                            × Remove
                                        </button>


                                    </div>


                                    {/* =========================
                                        PRODUCT TOTAL
                                    ========================= */}

                                    <div className="cart-price">

                                        ₹
                                        {
                                            productTotal.toLocaleString(
                                                "en-IN"
                                            )
                                        }

                                    </div>


                                </div>

                            );

                        })

                    )}

                </div>


                {/* =========================
                    RIGHT
                ========================= */}

                <div className="cart-right">

                    <div className="order-summary">


                        <h2>
                            Order Summary
                        </h2>


                        {/* SUBTOTAL */}

                        <div className="summary-row">

                            <span>
                                Subtotal
                            </span>


                            <span>

                                ₹
                                {
                                    subtotal.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2
                                        }
                                    )
                                }

                            </span>

                        </div>


                        {/* SHIPPING */}

                        <div className="summary-row">

                            <span>
                                Shipping
                            </span>


                            <span>

                                ₹
                                {
                                    shipping.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2
                                        }
                                    )
                                }

                            </span>

                        </div>


                        {/* LINE */}

                        <div className="summary-line"></div>


                        {/* GRAND TOTAL */}

                        <div className="grand-total">

                            <strong>
                                Grand Total
                            </strong>


                            <strong>

                                ₹
                                {
                                    grandTotal.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2
                                        }
                                    )
                                }

                            </strong>

                        </div>


                        {/* CHECKOUT */}

                        <button
                            className="checkout-btn"
                        >
                            Buy Now
                        </button>


                    </div>

                </div>

            </div>

        </div>
    );
}