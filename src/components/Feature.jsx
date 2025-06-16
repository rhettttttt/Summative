import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Feature() {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        axios
            .get("https://api.themoviedb.org/3/movie/now_playing", {
                params: {
                    api_key: import.meta.env.VITE_TMDB_KEY,
                    language: "en-US",
                    page: 1,
                },
            })
            .then((res) => setMovies(res.data.results))
            .catch((err) => console.error(err));
    }, []);

    return (
        <section className="py-8 px-4">
            <h2 className="text-2xl font-bold mb-4">Now Playing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                    <Link
                        key={movie.id}
                        to={`/movies/details/${movie.id}`}
                        className="block bg-white rounded overflow-hidden shadow hover:shadow-lg transition"
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-[300px] object-cover"
                        />
                        <div className="p-2">
                            <h3 className="text-sm font-semibold truncate">
                                {movie.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                                Release: {movie.release_date}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
