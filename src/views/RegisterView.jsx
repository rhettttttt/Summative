// src/views/RegisterView.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { UserContext } from "../context/UserContext";
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { auth, firestore } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Example genre list
const genreList = [
    { id: 1, name: "Action" },
    { id: 2, name: "Comedy" },
    { id: 3, name: "Drama" },
    { id: 4, name: "Horror" },
    { id: 5, name: "Sci-Fi" },
    { id: 6, name: "Romance" },
    { id: 7, name: "Thriller" },
    { id: 8, name: "Documentary" },
];

export default function RegisterView() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        password2: "",
    });
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleGenreChange = (e) => {
        const id = parseInt(e.target.value, 10);
        if (e.target.checked) {
            setSelectedGenres((prev) => [...prev, id]);
        } else {
            setSelectedGenres((prev) => prev.filter((g) => g !== id));
        }
    };

    const validateForm = () => {
        if (
            !form.firstName ||
            !form.lastName ||
            !form.email ||
            !form.password ||
            !form.password2
        ) {
            setError("All fields are required.");
            return false;
        }
        if (form.password !== form.password2) {
            setError("Passwords do not match.");
            return false;
        }
        if (selectedGenres.length < 5) {
            setError("Please select at least 5 genres.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            // Register with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );
            const user = userCredential.user;
            // Check if user already exists in Firestore (by UID)
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                setError("An account with this email already exists.");
                setLoading(false);
                return;
            }
            // Save user data to Firestore (by UID)
            await setDoc(doc(firestore, "users", user.uid), {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                favoriteGenres: selectedGenres,
                purchaseHistory: [],
            });
            setUser({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                favoriteGenres: selectedGenres,
                purchaseHistory: [],
                uid: user.uid,
            });
            navigate(`/movies/genre/28`);
        } catch (err) {
            setError("Registration failed. " + (err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError("");
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            // Check if user already exists in Firestore (by UID)
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                setError("An account with this email already exists.");
                setLoading(false);
                return;
            }
            // Save user data to Firestore (by UID)
            await setDoc(doc(firestore, "users", user.uid), {
                firstName: user.displayName?.split(" ")[0] || "",
                lastName: user.displayName?.split(" ")[1] || "",
                email: user.email,
                favoriteGenres: [],
                purchaseHistory: [],
            });
            setUser({
                firstName: user.displayName?.split(" ")[0] || "",
                lastName: user.displayName?.split(" ")[1] || "",
                email: user.email,
                favoriteGenres: [],
                purchaseHistory: [],
                uid: user.uid,
            });
            navigate(`/movies/genre/28`);
        } catch (err) {
            setError("Google registration failed. " + (err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const isFormComplete =
        form.firstName &&
        form.lastName &&
        form.email &&
        form.password &&
        form.password2 &&
        form.password === form.password2 &&
        selectedGenres.length >= 5;

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Register
                    </h2>
                    {error && (
                        <div className="mb-4 text-red-600 text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        firstName: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        lastName: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={form.password2}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password2: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select at least 5 Genres
                            </label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                                {genreList.map((genre) => (
                                    <label
                                        key={genre.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="checkbox"
                                            value={genre.id}
                                            onChange={handleGenreChange}
                                            disabled={loading}
                                        />
                                        <span>{genre.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!isFormComplete || loading}
                            className={`w-full py-2 text-white font-semibold rounded-lg transition ${
                                isFormComplete && !loading
                                    ? "bg-green-600 hover:bg-green-500"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>
                    <div className="my-4 flex items-center">
                        <hr className="flex-grow border-gray-300" />
                        <span className="mx-2 text-gray-400">or</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>
                    <button
                        onClick={handleGoogleRegister}
                        className="w-full py-2 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg transition flex items-center justify-center"
                        disabled={loading}
                        type="button"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            viewBox="0 0 48 48"
                            fill="none"
                        >
                            <g>
                                <path
                                    d="M44.5 20H24v8.5h11.7C34.7 32.7 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.3-4z"
                                    fill="#FFC107"
                                />
                                <path
                                    d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"
                                    fill="#FF3D00"
                                />
                                <path
                                    d="M24 45c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.2 36.6 26.7 37.5 24 37.5c-6.1 0-10.7-3.3-11.7-8.5l-7 5.4C7.9 41.1 15.4 45 24 45z"
                                    fill="#4CAF50"
                                />
                                <path
                                    d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C17.3 43.2 20.5 45 24 45c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.3-4z"
                                    fill="#1976D2"
                                />
                            </g>
                        </svg>
                        Register with Google
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
