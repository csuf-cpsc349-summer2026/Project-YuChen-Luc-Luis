import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem("favoriteArtists");

        try {
            return savedFavorites ? JSON.parse(savedFavorites) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(
            "favoriteArtists",
            JSON.stringify(favorites)
        );
    }, [favorites]);

    function addFavorite(artist) {
        setFavorites((currentFavorites) => {
            const alreadyExists = currentFavorites.some(
                (favorite) => favorite.id === artist.id
            );

            if (alreadyExists) {
                return currentFavorites;
            }

            return [...currentFavorites, artist];
        });
    }

    function removeFavorite(artistId) {
        setFavorites((currentFavorites) =>
            currentFavorites.filter(
                (artist) => artist.id !== artistId
            )
        );
    }

    function isFavorite(artistId) {
        return favorites.some(
            (artist) => artist.id === artistId
        );
    }

    function toggleFavorite(artist) {
        if (isFavorite(artist.id)) {
            removeFavorite(artist.id);
        } else {
            addFavorite(artist);
        }
    }

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                isFavorite,
                toggleFavorite
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