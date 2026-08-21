import { createContext, useState } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState([]);


    // ADD TO CART
    const addToCart = (product) => {

        setCartItems((previous) => {

            const alreadyExist = previous.find(
                item => String(item.id) === String(product.id)
            );

            // Product already exists
            // Increase quantity
            if (alreadyExist) {

                return previous.map(item =>
                    String(item.id) === String(product.id)
                        ? {
                            ...item,
                            quantity: (item.quantity || 1) + 1
                        }
                        : item
                );

            }

            // New product
            return [
                ...previous,
                {
                    ...product,
                    quantity: 1
                }
            ];

        });

    };


    // INCREASE QUANTITY
    const increaseQuantity = (id) => {

        setCartItems((items) =>
            items.map((item) =>
                String(item.id) === String(id)
                    ? {
                        ...item,
                        quantity: (item.quantity || 1) + 1
                    }
                    : item
            )
        );

    };


    // DECREASE QUANTITY
    const decreaseQuantity = (id) => {

        setCartItems((items) =>
            items.map((item) =>
                String(item.id) === String(id)
                    ? {
                        ...item,
                        quantity: Math.max(
                            (item.quantity || 1) - 1,
                            1
                        )
                    }
                    : item
            )
        );

    };


    // REMOVE PRODUCT
    const removeFromCart = (id) => {

        setCartItems((items) =>
            items.filter(
                item => String(item.id) !== String(id)
            )
        );

    };


    return (
        <CartContext.Provider
            value={{
                cartItems,
                setCartItems,

                addToCart,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart
            }}
        >
            {children}
        </CartContext.Provider>
    );

}