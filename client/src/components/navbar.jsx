import { useEffect, useState } from "react";
import {
    Link,
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    onAuthStateChanged,
    signOut
} from "firebase/auth";

import { auth } from "../firebase";

function Navbar() {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [spotifyUser, setSpotifyUser] = useState(null);
    const [checkingSpotify, setCheckingSpotify] =
        useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                setCurrentUser(user);
                setLoadingUser(false);
            }
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        async function checkSpotifyConnection() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/me`,
                    {
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (response.ok && data.connected) {
                    setSpotifyUser(data.user);
                } else {
                    setSpotifyUser(null);
                }
            } catch (error) {
                console.error(
                    "Spotify connection check failed:",
                    error
                );

                setSpotifyUser(null);
            } finally {
                setCheckingSpotify(false);
            }
        }

        checkSpotifyConnection();

        window.addEventListener(
            "focus",
            checkSpotifyConnection
        );

        return () => {
            window.removeEventListener(
                "focus",
                checkSpotifyConnection
            );
        };
    }, []);

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    function connectSpotify() {
        window.location.href =
            `${import.meta.env.VITE_API_URL}/api/auth/login`;
    }

    async function disconnectSpotify() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Spotify disconnect request failed."
                );
            }

            setSpotifyUser(null);
        } catch (error) {
            console.error(
                "Spotify disconnect failed:",
                error
            );
        }
    }

    return (
        <header className="site-header">
            <nav className="navbar">
                <Link to="/" className="logo">
                    🎵 Event Finder
                </Link>

                <ul className="nav-links">
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? "active" : ""
                            }
                        >
                            Home
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/search"
                            className={({ isActive }) =>
                                isActive ? "active" : ""
                            }
                        >
                            Search
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/favorites"
                            className={({ isActive }) =>
                                isActive ? "active" : ""
                            }
                        >
                            Favorites
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/shows"
                            className={({ isActive }) =>
                                isActive ? "active" : ""
                            }
                        >
                            Shows
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/insights"
                            className={({ isActive }) =>
                                isActive ? "active" : ""
                            }
                        >
                            Insights
                        </NavLink>
                    </li>
                        


                    {!checkingSpotify && (
                        <li className="spotify-nav-item">
                            {spotifyUser ? (
                                <div className="spotify-connected">
                                    <span>
                                        Spotify Connected ✓
                                    </span>

                                    <button
                                        type="button"
                                        className="spotify-disconnect-button"
                                        onClick={
                                            disconnectSpotify
                                        }
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="spotify-connect-button"
                                    onClick={connectSpotify}
                                >
                                    Connect Spotify
                                </button>
                            )}
                        </li>
                    )}

                    {!loadingUser && !currentUser && (
                        <li>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    isActive
                                        ? "active"
                                        : ""
                                }
                            >
                                Login
                            </NavLink>
                        </li>
                    )}

                    {!loadingUser && currentUser && (
                        <>
                            <li className="navbar-user">
                                {currentUser.displayName ||
                                    currentUser.email}
                            </li>

                            <li>
                                <button
                                    type="button"
                                    className="logout-button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Navbar;