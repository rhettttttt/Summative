import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function DetailView() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        axios
            .get(`https://api.themoviedb.org/3/movie/${id}`, {
                params: {
                    api_key: import.meta.env.VITE_TMDB_KEY,
                    language: "en-US",
                },
            })
            .then((res) => setMovie(res.data))
            .catch((err) => console.error(err));

        axios
            .get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
                params: {
                    api_key: import.meta.env.VITE_TMDB_KEY,
                    language: "en-US",
                },
            })
            .then((res) => {
                const trailers = res.data.results.filter(
                    (v) => v.type === "Trailer" && v.site === "YouTube"
                );
                setVideos(trailers);
            })
            .catch((err) => console.error(err));
    }, [id]);

    if (!movie) return null;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow px-4 py-8 max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-6 bg-white rounded-lg shadow overflow-hidden">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full md:w-1/3 h-auto object-cover"
                    />
                    <div className="p-6 flex-1">
                        <h1 className="text-3xl font-bold mb-2">
                            {movie.title}
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">
                            {movie.tagline}
                        </p>
                        <p className="mb-4">{movie.overview}</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>
                                <strong>Release Date:</strong>{" "}
                                {movie.release_date}
                            </li>
                            <li>
                                <strong>Runtime:</strong> {movie.runtime} min
                            </li>
                            <li>
                                <strong>Genres:</strong>{" "}
                                {movie.genres.map((g) => g.name).join(", ")}
                            </li>
                            <li>
                                <strong>Rating:</strong> {movie.vote_average} /
                                10
                            </li>
                        </ul>
                    </div>
                </div>

                {videos.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Trailers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {videos.map((video) => (
                                <div key={video.id} className="w-full">
                                    <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${video.key}`}
                                            title={video.name}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                            className="absolute top-0 left-0 w-full h-full"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm font-medium">
                                        {video.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
