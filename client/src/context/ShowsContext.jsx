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

const ShowsContext = createContext(null);

export function ShowsProvider({ children }) {
    const [savedShows, setSavedShows] = useState([]);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showsLoading, setShowsLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setAuthLoading(false);

                if (!currentUser) {
                    setSavedShows([]);
                    setShowsLoading(false);
                }
            }
        );

        return unsubscribeAuth;
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        setShowsLoading(true);

        const showsCollection = collection(
            db,
            "users",
            user.uid,
            "shows"
        );

        const unsubscribeShows = onSnapshot(
            showsCollection,
            (snapshot) => {
                const userShows = snapshot.docs.map(
                    (showDoc) => ({
                        id: showDoc.id,
                        ...showDoc.data()
                    })
                );

                setSavedShows(userShows);
                setShowsLoading(false);
            },
            (error) => {
                console.error(
                    "Failed to load saved shows:",
                    error
                );

                setMessage(
                    "Failed to load your saved shows."
                );

                setSavedShows([]);
                setShowsLoading(false);
            }
        );

        return unsubscribeShows;
    }, [user]);

    async function saveShow(show) {
        if (!user) {
            setMessage(
                "Please log in before saving a show."
            );

            return false;
        }

        if (!show?.id) {
            setMessage("This show could not be saved.");
            return false;
        }

        try {
            const showReference = doc(
                db,
                "users",
                user.uid,
                "shows",
                String(show.id)
            );

            await setDoc(showReference, {
                id: String(show.id),
                name: show.name || "Unknown Show",
                image: show.image || "",
                date: show.date || "",
                time: show.time || "",
                venue: show.venue || "",
                city: show.city || "",
                state: show.state || "",
                ticketUrl: show.ticketUrl || ""
            });

            setMessage("");
            return true;
        } catch (error) {
            console.error(
                "Failed to save show:",
                error
            );

            setMessage(
                "Failed to save this show."
            );

            return false;
        }
    }

    async function removeShow(showId) {
        if (!user) {
            setMessage(
                "Please log in before changing saved shows."
            );

            return false;
        }

        if (!showId) {
            setMessage("This show could not be removed.");
            return false;
        }

        try {
            const showReference = doc(
                db,
                "users",
                user.uid,
                "shows",
                String(showId)
            );

            await deleteDoc(showReference);

            setMessage("");
            return true;
        } catch (error) {
            console.error(
                "Failed to remove show:",
                error
            );

            setMessage(
                "Failed to remove this show."
            );

            return false;
        }
    }

    function isShowSaved(showId) {
        return savedShows.some(
            (show) =>
                String(show.id) === String(showId)
        );
    }

    async function toggleShow(show) {
        if (!user) {
            setMessage(
                "Please log in before saving a show."
            );

            return false;
        }

        if (!show?.id) {
            setMessage("This show could not be saved.");
            return false;
        }

        if (isShowSaved(show.id)) {
            return removeShow(show.id);
        }

        return saveShow(show);
    }

    function clearMessage() {
        setMessage("");
    }

    return (
        <ShowsContext.Provider
            value={{
                savedShows,
                user,
                authLoading,
                showsLoading,
                message,
                saveShow,
                removeShow,
                toggleShow,
                isShowSaved,
                clearMessage
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
            "useShows must be used inside ShowsProvider"
        );
    }

    return context;
}