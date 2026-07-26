import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../firebase";

function Navbar() {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoadingUser(false);
        });

        return unsubscribe;
    }, []);

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
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

                    {!loadingUser && !currentUser && (
                        <li>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
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