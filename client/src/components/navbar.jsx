import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
    const [spotifyUser, setSpotifyUser] = useState(null);
    const [checkingSpotify, setCheckingSpotify] = useState(true);

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
                console.error("Spotify connection check failed:", error);
                setSpotifyUser(null);
            } finally {
                setCheckingSpotify(false);
            }
        }

        checkSpotifyConnection();

        window.addEventListener("focus", checkSpotifyConnection);

        return () => {
            window.removeEventListener("focus", checkSpotifyConnection);
        };
    }, []);

    function connectSpotify() {
        window.location.href =
            `${import.meta.env.VITE_API_URL}/api/auth/login`;
    }

    async function disconnectSpotify() {
    await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    setSpotifyUser(null);
}

    return (
        <header>
            <nav>
                <h1>Music Discovery</h1>

                <div>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/search">Search</NavLink>
                    <NavLink to="/favorites">Favorites</NavLink>
                    <NavLink to="/shows">Shows</NavLink>

                    {!checkingSpotify && (
                        spotifyUser ? (
                            <>
                                <span>Spotify Connected ✓</span>

                                <button onClick={disconnectSpotify}>
                                    Disconnect
                                </button>
                            </>
                        ) : (
                            <button onClick={connectSpotify}>
                                Connect Spotify
                            </button>
                        )
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;