import { createContext, useState } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState([]);


    // ADD TO CART
    const addToCart = (product) => {

        setCartItems((previous) => {

            const alreadyExist = previous.find(
                item => item.id === product.id
            );

            // If product already exists,
            // increase its quantity
            if (alreadyExist) {

                return previous.map(item =>
                    item.id === product.id
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
                item.id === id
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
                item.id === id
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
            items.filter(item => item.id !== id)
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