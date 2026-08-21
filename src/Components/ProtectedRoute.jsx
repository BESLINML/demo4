import { Navigate } from "react-router-dom";


export default function ProtectedRoute({
    children,
    role
}) {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    // =========================
    // NOT LOGGED IN
    // =========================

    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // =========================
    // WRONG ROLE
    // =========================

    if (
        role &&
        user.role !== role
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    // =========================
    // ALLOWED
    // =========================

    return children;

}