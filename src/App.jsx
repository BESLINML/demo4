import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import Header from "./Pages/Header";
import Home from "./Pages/Home";
import Category from "./Pages/Category";
import ProductDetails from "./Pages/ProductDetails";
import Subcategory from "./Pages/SubCategory";
import Cart from "./Pages/Cart";
import Location from "./Pages/Location";
import Footer from "./Pages/Footer";


function ScrollToTop() {

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}


export default function App() {

    return (
        <BrowserRouter>

            {/* Scroll to top whenever page changes */}
            <ScrollToTop />

            <Header />

            <Routes>

                {/* HOME */}
                <Route
                    path="/"
                    element={<Home />}
                />

                {/* CATEGORY MENU */}
                <Route
                    path="/category"
                    element={<Category />}
                />

                {/* SUBCATEGORY */}
                <Route
                    path="/category/:subcategory"
                    element={<Subcategory />}
                />

                {/* PRODUCT DETAILS */}
                <Route
                    path="/product/:id"
                    element={<ProductDetails />}
                />

                {/* CART */}
                <Route
                    path="/cart"
                    element={<Cart />}
                />

                {/* LOCATION */}
                <Route
                    path="/location"
                    element={<Location />}
                />

            </Routes>
            <Footer/>

        </BrowserRouter>
    );
}