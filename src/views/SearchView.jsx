import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

export default function SearchView() {
    const { query } = useParams();
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const { cartItems, addToCart } = useContext(CartContext);
    const { previousPurchases } = useContext(UserContext);

    useEffect(() => {
        const fetchMovies = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const response = await axios.get(
                    "https://api.themoviedb.org/3/search/movie",
                    {
                        params: {
                            api_key: import.meta.env.VITE_TMDB_KEY,
                            query: query,
                            page: page,
                            language: "en-US",
                        },
                    }
                );
                setMovies(response.data.results);
                setTotalPages(response.data.total_pages);
            } catch (error) {
                console.error("Error fetching movies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [query, page]);

    const isInCart = (movieId) => {
        return cartItems?.some((item) => item.id === movieId);
    };

    const isPurchased = (movieId) => {
        return previousPurchases?.some((item) => item.id === movieId);
    };

    const handlePrevPage = () => {
        setPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow px-4 py-8 max-w-6xl mx-auto">
                <h2 className="text-2xl mb-4">
                    Search Results for:{" "}
                    <span className="font-semibold">{query}</span>
                </h2>
                {loading ? (
                    <p>Loading...</p>
                ) : movies.length > 0 ? (
                    <>
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
                                                src={
                                                    movie.poster_path
                                                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                                        : "https://via.placeholder.com/500x750?text=No+Image"
                                                }
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
                        <div className="flex justify-center items-center mt-8 space-x-4">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 1}
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <p>No results found.</p>
                )}
            </main>
        </div>
    );
}
