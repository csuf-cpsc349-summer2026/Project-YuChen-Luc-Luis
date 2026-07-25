import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const ShowsContext = createContext(null);

export function ShowsProvider({ children }) {
    const [savedShows, setSavedShows] = useState(() => {
        const storedShows = localStorage.getItem("savedShows");

        return storedShows ? JSON.parse(storedShows) : [];
    });

    useEffect(() => {
        localStorage.setItem(
            "savedShows",
            JSON.stringify(savedShows)
        );
    }, [savedShows]);

    function saveShow(show) {
        setSavedShows((currentShows) => {
            const alreadySaved = currentShows.some(
                (item) => item.id === show.id
            );

            if (alreadySaved) {
                return currentShows;
            }

            return [...currentShows, show];
        });
    }

    function removeShow(showId) {
        setSavedShows((currentShows) =>
            currentShows.filter((show) => show.id !== showId)
        );
    }

    function toggleShow(show) {
        const alreadySaved = savedShows.some(
            (item) => item.id === show.id
        );

        if (alreadySaved) {
            removeShow(show.id);
        } else {
            saveShow(show);
        }
    }

    function isShowSaved(showId) {
        return savedShows.some((show) => show.id === showId);
    }

    return (
        <ShowsContext.Provider
            value={{
                savedShows,
                saveShow,
                removeShow,
                toggleShow,
                isShowSaved
            }}
        >
            {children}
        </ShowsContext.Provider>
    );
}

export function useShows() {
    const context = useContext(ShowsContext);

    if (!context) {
        throw new Error(
            "useShows must be used inside a ShowsProvider."
        );
    }

    return context;
}