import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../api/AuthApi";


export default function Login() {

    const navigate = useNavigate();


    // =========================
    // FORM
    // =========================

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");


    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // =========================
    // LOGIN
    // =========================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        setLoading(true);


        try {

            const user = await loginUser(
                email,
                password
            );


            console.log(
                "Logged in user:",
                user
            );


            // =========================
            // SAVE USER
            // =========================

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            // =========================
            // CHECK ROLE
            // =========================

            if (user.role === "ADMIN") {

                navigate("/admin");

            } else {

                navigate("/");

            }


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            if (
                error.response &&
                error.response.data
            ) {

                setError(
                    error.response.data
                );

            } else {

                setError(
                    "Unable to login. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // RETURN
    // =========================

    return (

        <div className="login-page">

            <div className="login-box">

                <h2>
                    Login
                </h2>


                {error && (

                    <div className="login-error">

                        {error}

                    </div>

                )}


                <form
                    onSubmit={handleLogin}
                >


                    {/* EMAIL */}

                    <input
                        type="email"

                        placeholder="Email"

                        value={email}

                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }

                        required
                    />


                    {/* PASSWORD */}

                    <input
                        type="password"

                        placeholder="Password"

                        value={password}

                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }

                        required
                    />


                    {/* LOGIN */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>

            </div>

        </div>

    );

}