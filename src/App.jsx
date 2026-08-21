import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from "react-router-dom";

import { useEffect } from "react";

import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import Admin from "./Pages/Admin";
import Header from "./Pages/Header";
import Home from "./Pages/Home";
import Category from "./Pages/Category";
import ProductDetails from "./Pages/ProductDetails";
import Subcategory from "./Pages/SubCategory";
import Cart from "./Pages/Cart";
import Location from "./Pages/Location";
import Footer from "./Pages/Footer";
import Login from "./Components/Login";

import ProtectedRoute from "./Components/ProtectedRoute";


// =========================================================
// SCROLL TO TOP
// =========================================================

function ScrollToTop() {

    const { pathname } = useLocation();


    useEffect(() => {

        window.scrollTo(0, 0);

    }, [pathname]);


    return null;
}


// =========================================================
// APP
// =========================================================

export default function App() {

    return (

        <BrowserRouter>

            {/* SCROLL TO TOP */}

            <ScrollToTop />


            {/* HEADER */}

            <Header />


            {/* ROUTES */}

            <Routes>


                {/* =================================================
                    HOME
                ================================================= */}

                <Route
                    path="/"
                    element={<Home />}
                />


                {/* =================================================
                    CATEGORY
                ================================================= */}

                <Route
                    path="/category"
                    element={<Category />}
                />


                {/* =================================================
                    SUBCATEGORY
                ================================================= */}

                <Route
                    path="/category/:subcategory"
                    element={<Subcategory />}
                />


                {/* =================================================
                    PRODUCT DETAILS
                ================================================= */}

                <Route
                    path="/product/:id"
                    element={<ProductDetails />}
                />


                {/* =================================================
                    CART
                ================================================= */}

                <Route
                    path="/cart"
                    element={<Cart />}
                />


                {/* =================================================
                    LOCATION
                ================================================= */}

                <Route
                    path="/location"
                    element={<Location />}
                />


                {/* =================================================
                    LOGIN
                ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =================================================
                    ADMIN
                    ADMIN ONLY
                ================================================= */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    }
                />


            </Routes>


            {/* FOOTER */}

            <Footer />

        </BrowserRouter>

    );

}