import React from "react";
import { NavLink } from "react-router-dom";

export default function Genres({ genres }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow space-y-2">
            {genres.map((g) => (
                <NavLink
                    key={g.id}
                    to={`/movies/genre/${g.id}`}
                    className={({ isActive }) =>
                        `block w-full text-left px-3 py-2 rounded transition ${
                            isActive
                                ? "bg-red-100 font-semibold"
                                : "hover:bg-gray-100"
                        }`
                    }
                >
                    {g.genre}
                </NavLink>
            ))}
        </div>
    );
}
