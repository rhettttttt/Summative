import React, { useContext, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

export default function Header() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const debouncedNavigate = useRef(
        debounce((query) => {
            if (query.trim()) {
                navigate(`/movies/search/${encodeURIComponent(query.trim())}`);
            }
        }, 500)
    ).current;

    const active = "underline text-red-400";
    const base = "hover:text-red-300 transition";

    const handleLogout = async () => {
        setUser(null);
        await signOut(auth);
        navigate("/");
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedNavigate(value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/movies/search/${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm("");
        }
    };

    return (
        <header className="bg-gray-900 text-white p-4 flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-center justify-between">
                <NavLink to="/" className="text-2xl font-bold">
                    <span className="text-red-500">Qay</span>Flix
                </NavLink>
                {user && (
                    <span className="ml-4 text-sm md:text-base">
                        Hello {user.firstName}!
                    </span>
                )}
            </div>

            <nav className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `${base} ${isActive ? active : ""}`
                    }
                >
                    Home
                </NavLink>

                {!user ? (
                    <>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : ""}`
                            }
                        >
                            Login
                        </NavLink>
                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : ""}`
                            }
                        >
                            Register
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink
                            to="/movies"
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : ""}`
                            }
                        >
                            Movies
                        </NavLink>
                        <NavLink
                            to="/cart"
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : ""}`
                            }
                        >
                            Cart
                        </NavLink>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : ""}`
                            }
                        >
                            Settings
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="text-white hover:text-red-300 transition"
                        >
                            Logout
                        </button>
                    </>
                )}
            </nav>

            {user && (
                <form
                    onSubmit={handleSearchSubmit}
                    className="mt-4 md:mt-0 flex items-center"
                >
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="p-2 rounded-l bg-white text-black"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-red-500 text-white rounded-r hover:bg-red-400"
                    >
                        Search
                    </button>
                </form>
            )}
        </header>
    );
}
