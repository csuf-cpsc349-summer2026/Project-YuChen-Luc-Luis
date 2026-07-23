import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import ShowsPage from "./pages/ShowsPage.jsx";
import ArtistPage from "./pages/ArtistPage.jsx";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/shows" element={<ShowsPage />} />
                    <Route path="/artist/:id" element={<ArtistPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;