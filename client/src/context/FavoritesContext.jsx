import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc
} from "firebase/firestore";

import { auth, db } from "../firebase";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setAuthLoading(false);

                if (!currentUser) {
                    setFavorites([]);
                    setFavoritesLoading(false);
                }
            }
        );

        return unsubscribeAuth;
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        setFavoritesLoading(true);

        const favoritesCollection = collection(
            db,
            "users",
            user.uid,
            "favorites"
        );

        const unsubscribeFavorites = onSnapshot(
            favoritesCollection,
            (snapshot) => {
                const favoriteArtists = snapshot.docs.map(
                    (favoriteDoc) => ({
                        id: favoriteDoc.id,
                        ...favoriteDoc.data()
                    })
                );

                setFavorites(favoriteArtists);
                setFavoritesLoading(false);
            },
            (error) => {
                console.error(
                    "Failed to load favorites:",
                    error
                );

                setMessage(
                    "Failed to load your favorite artists."
                );

                setFavorites([]);
                setFavoritesLoading(false);
            }
        );

        return unsubscribeFavorites;
    }, [user]);

    async function addFavorite(artist) {
        if (!user) {
            setMessage(
                "Please log in before adding a favorite artist."
            );

            return false;
        }

        if (!artist?.id) {
            setMessage("This artist could not be added.");
            return false;
        }

        try {
            const favoriteReference = doc(
                db,
                "users",
                user.uid,
                "favorites",
                String(artist.id)
            );

            await setDoc(favoriteReference, {
                id: String(artist.id),
                name: artist.name || "Unknown Artist",
                image: artist.image || "",
                genres: artist.genres || [],
                followers: artist.followers || 0,
                popularity: artist.popularity ?? null,
                spotifyUrl: artist.spotifyUrl || ""
            });

            setMessage("");
            return true;
        } catch (error) {
            console.error(
                "Failed to add favorite:",
                error
            );

            setMessage(
                "Failed to add this artist to your favorites."
            );

            return false;
        }
    }

    async function removeFavorite(artistId) {
        if (!user) {
            setMessage(
                "Please log in before changing favorites."
            );

            return false;
        }

        try {
            const favoriteReference = doc(
                db,
                "users",
                user.uid,
                "favorites",
                String(artistId)
            );

            await deleteDoc(favoriteReference);

            setMessage("");
            return true;
        } catch (error) {
            console.error(
                "Failed to remove favorite:",
                error
            );

            setMessage(
                "Failed to remove this artist from your favorites."
            );

            return false;
        }
    }

    function isFavorite(artistId) {
        return favorites.some(
            (artist) =>
                String(artist.id) === String(artistId)
        );
    }

    async function toggleFavorite(artist) {
        if (!user) {
            setMessage(
                "Please log in before adding a favorite artist."
            );

            return false;
        }

        if (isFavorite(artist.id)) {
            return removeFavorite(artist.id);
        }

        return addFavorite(artist);
    }

    function clearMessage() {
        setMessage("");
    }

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                user,
                authLoading,
                favoritesLoading,
                message,
                addFavorite,
                removeFavorite,
                isFavorite,
                toggleFavorite,
                clearMessage
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);

    if (!context) {
        throw new Error(
            "useFavorites must be used inside FavoritesProvider"
        );
    }

    return context;
}