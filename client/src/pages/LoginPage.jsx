import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase";

function LoginPage() {
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function getFirebaseErrorMessage(error) {
        switch (error.code) {
            case "auth/invalid-email":
                return "Please enter a valid email address.";

            case "auth/missing-password":
                return "Please enter your password.";

            case "auth/weak-password":
                return "Password must contain at least 6 characters.";

            case "auth/email-already-in-use":
                return "An account already exists with this email.";

            case "auth/invalid-credential":
                return "The email or password is incorrect.";

            case "auth/user-disabled":
                return "This account has been disabled.";

            case "auth/popup-closed-by-user":
                return "Google login was cancelled.";

            case "auth/popup-blocked":
                return "Your browser blocked the Google login popup.";

            default:
                return error.message || "Authentication failed.";
        }
    }

    async function handleEmailAuthentication(event) {
        event.preventDefault();
        setMessage("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (isRegistering && !trimmedName) {
            setMessage("Please enter your name.");
            return;
        }

        if (!trimmedEmail || !password) {
            setMessage("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            if (isRegistering) {
                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        trimmedEmail,
                        password
                    );

                await updateProfile(userCredential.user, {
                    displayName: trimmedName,
                });
            } else {
                await signInWithEmailAndPassword(
                    auth,
                    trimmedEmail,
                    password
                );
            }

            navigate("/");
        } catch (error) {
            setMessage(getFirebaseErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setMessage("");
        setLoading(true);

        try {
            await signInWithPopup(auth, googleProvider);
            navigate("/");
        } catch (error) {
            setMessage(getFirebaseErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    function switchMode() {
        setIsRegistering((currentValue) => !currentValue);
        setMessage("");
        setName("");
        setEmail("");
        setPassword("");
    }

    return (
        <section className="login-page">
            <div className="login-card">
                <h2>
                    {isRegistering
                        ? "Create Account"
                        : "Login"}
                </h2>

                <p>
                    {isRegistering
                        ? "Create an account using your email and password."
                        : "Sign in using your email and password."}
                </p>

                <form onSubmit={handleEmailAuthentication}>
                    {isRegistering && (
                        <div className="login-field">
                            <label htmlFor="name">
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            disabled={loading}
                        />
                    </div>

                    {message && (
                        <p className="login-message">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isRegistering
                              ? "Create Account"
                              : "Login"}
                    </button>
                </form>

                <div className="login-divider">
                    <span>or</span>
                </div>

                <button
                    type="button"
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    Continue with Google
                </button>

                <p className="login-switch-text">
                    {isRegistering
                        ? "Already have an account?"
                        : "Don't have an account?"}

                    <button
                        type="button"
                        className="login-switch-button"
                        onClick={switchMode}
                        disabled={loading}
                    >
                        {isRegistering
                            ? "Login"
                            : "Create account"}
                    </button>
                </p>
            </div>
        </section>
    );
}

export default LoginPage;