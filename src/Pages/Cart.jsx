import { useContext } from "react";
import { CartContext } from "./CartContext";

export default function Cart() {

    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } = useContext(CartContext);

    const subtotal = cartItems.reduce(
        (total, product) =>
            total + Number(product.offerprice) * (product.quantity || 1),
        0
    );

    const shipping = subtotal > 0 ? 150 : 0;

    const grandTotal = subtotal + shipping;

    return (
        <div className="cart-page">

            <div className="cart-container">

                {/* LEFT */}
                <div className="cart-left">

                    <h1>Your Bag</h1>

                    {cartItems.length === 0 ? (

                        <div className="empty-cart">
                            <p>Your bag is empty.</p>
                        </div>

                    ) : (

                        cartItems.map((product) => {

                            const quantity = product.quantity || 1;

                            const productTotal =
                                Number(product.offerprice) * quantity;

                            return (

                                <div
                                    className="cart-product"
                                    key={product.id}
                                >

                                    {/* IMAGE */}
                                    <div className="cart-image">

                                        <img
                                            src={product.image?.[0]}
                                            alt={product.name}
                                        />

                                    </div>


                                    {/* DETAILS */}
                                    <div className="cart-details">

                                        <h2>
                                            {product.name}
                                        </h2>


                                        <div className="cart-info">

                                            {/* QUANTITY */}
                                            <div>

                                                <span>
                                                    Quantity
                                                </span>

                                                <div className="quantity">

                                                    <button
                                                        onClick={() =>
                                                            decreaseQuantity(product.id)
                                                        }
                                                        disabled={quantity <= 1}
                                                    >
                                                        −
                                                    </button>

                                                    <span>
                                                        {quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            increaseQuantity(product.id)
                                                        }
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </div>

                                        </div>


                                        {/* REMOVE */}
                                        <button
                                            className="remove-btn"
                                            onClick={() =>
                                                removeFromCart(product.id)
                                            }
                                        >
                                            × Remove
                                        </button>

                                    </div>


                                    {/* PRODUCT TOTAL */}
                                    <div className="cart-price">

                                        ₹{productTotal.toLocaleString("en-IN")}

                                    </div>

                                </div>

                            );

                        })

                    )}

                </div>


                {/* RIGHT */}
                <div className="cart-right">

                    <div className="order-summary">

                        <h2>
                            Order Summary
                        </h2>


                        <div className="summary-row">

                            <span>
                                Subtotal
                            </span>

                            <span>
                                ₹{subtotal.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2
                                })}
                            </span>

                        </div>


                        <div className="summary-row">

                            <span>
                                Shipping
                            </span>

                            <span>
                                ₹{shipping.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2
                                })}
                            </span>

                        </div>


                        <div className="summary-line"></div>


                        <div className="grand-total">

                            <strong>
                                Grand Total
                            </strong>

                            <strong>
                                ₹{grandTotal.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2
                                })}
                            </strong>

                        </div>


                        <button className="checkout-btn">
                            Buy Now
                        </button>


                    </div>

                </div>

            </div>

        </div>
    );
}