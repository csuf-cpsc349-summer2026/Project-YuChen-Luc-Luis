import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <header>
            <nav>
                <h1>Music Discovery</h1>

                <div>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/search">Search</NavLink>
                    <NavLink to="/favorites">Favorites</NavLink>
                    <NavLink to="/shows">Shows</NavLink>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;