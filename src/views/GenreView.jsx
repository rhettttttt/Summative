// src/views/GenreView.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

export default function GenreView() {
    const { genre_id } = useParams();
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const { previousPurchases } = useContext(UserContext);

    useEffect(() => {
        axios
            .get("https://api.themoviedb.org/3/discover/movie", {
                params: {
                    api_key: import.meta.env.VITE_TMDB_KEY,
                    with_genres: genre_id,
                    language: "en-US",
                    page,
                },
            })
            .then((res) => {
                setMovies(res.data.results);
                setTotalPages(res.data.total_pages);
            })
            .catch((err) => console.error(err));
    }, [genre_id, page]);

    const isInCart = (movieId) => {
        return cartItems?.some((item) => item.id === movieId);
    };

    const isPurchased = (movieId) => {
        return previousPurchases?.some((item) => item.id === movieId);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow px-4 py-8 max-w-6xl mx-auto">
                {/* Movies Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {movies.map((movie) => {
                        const purchased = isPurchased(movie.id);
                        const inCart = isInCart(movie.id);
                        return (
                            <div
                                key={movie.id}
                                className="bg-white rounded overflow-hidden shadow hover:shadow-lg transition flex flex-col"
                            >
                                <Link to={`/movies/details/${movie.id}`}>
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-[300px] object-cover"
                                    />
                                </Link>
                                <div className="p-2 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold truncate">
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {movie.release_date}
                                        </p>
                                    </div>
                                    <button
                                        className={`mt-2 w-full py-1 text-sm font-medium rounded ${
                                            purchased
                                                ? "bg-green-200 text-gray-600 cursor-not-allowed"
                                                : inCart
                                                ? "bg-gray-400 text-white cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-500 text-white"
                                        }`}
                                        disabled={purchased || inCart}
                                        onClick={() => {
                                            if (!purchased && !inCart)
                                                addToCart(movie);
                                        }}
                                    >
                                        {purchased
                                            ? "Purchased"
                                            : inCart
                                            ? "Added"
                                            : "Buy"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <span className="text-gray-700">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() =>
                            setPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
}
