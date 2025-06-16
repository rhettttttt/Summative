import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { auth, firestore } from "../firebase";
import {
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const genreList = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 10752, name: "War" },
    { id: 10770, name: "TV Movie" },
];

export default function SettingsView() {
    const {
        user,
        setUser,
        genrePreferences,
        setGenrePreferences,
        previousPurchases,
        setPreviousPurchases,
    } = useContext(UserContext);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Only allow name/password change for email/password users
    const isEmailPasswordUser =
        user &&
        auth.currentUser &&
        auth.currentUser.providerData.some(
            (provider) => provider.providerId === "password"
        );

    // Load user info and genres on mount
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
            }));
            setSelectedGenres(user.favoriteGenres || genrePreferences || []);
        }
    }, [user, genrePreferences]);

    // Load purchase history from Firestore on mount or when user changes
    useEffect(() => {
        const fetchPurchases = async () => {
            if (user && user.uid) {
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setPreviousPurchases(data.purchaseHistory || []);
                }
            }
        };
        fetchPurchases();
        // eslint-disable-next-line
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGenreChange = (e) => {
        const id = parseInt(e.target.value, 10);
        if (e.target.checked) {
            if (selectedGenres.length < 2) {
                setSelectedGenres((prev) => [...prev, id]);
            }
        } else {
            setSelectedGenres((prev) => prev.filter((g) => g !== id));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
                displayName: `${formData.firstName} ${formData.lastName}`,
            });
            // Update Firestore
            await updateDoc(doc(firestore, "users", user.uid), {
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            setUser({
                ...user,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            setMessage("Profile updated successfully.");
        } catch (err) {
            setError("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }
        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            );
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, formData.newPassword);
            setMessage("Password updated successfully.");
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (err) {
            setError(
                "Failed to update password. Please check your current password."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGenreSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        if (selectedGenres.length !== 2) {
            setError("Please select exactly 2 genres.");
            setLoading(false);
            return;
        }
        try {
            await updateDoc(doc(firestore, "users", user.uid), {
                favoriteGenres: selectedGenres,
            });
            setGenrePreferences(selectedGenres);
            setUser({
                ...user,
                favoriteGenres: selectedGenres,
            });
            setMessage("Genre preferences updated.");
        } catch (err) {
            setError("Failed to update genres.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <>
                <Header />
                <main className="p-4">Please log in to access settings.</main>
                <Footer />
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow flex flex-col items-center p-6">
                <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Settings
                    </h2>
                    {message && (
                        <div className="mb-4 text-green-600 text-center">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    {isEmailPasswordUser && (
                        <>
                            <form
                                onSubmit={handleProfileSubmit}
                                className="space-y-4 mb-8"
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        readOnly
                                        className="w-full border border-gray-300 rounded bg-gray-100 px-3 py-2 cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        disabled={loading}
                                    >
                                        Save Profile
                                    </button>
                                </div>
                            </form>

                            <form
                                onSubmit={handlePasswordChange}
                                className="space-y-4 mb-8"
                            >
                                <h3 className="text-lg font-semibold mb-2">
                                    Change Password
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        disabled={loading}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* Genre Preferences */}
                    <form
                        onSubmit={handleGenreSubmit}
                        className="space-y-4 mb-8"
                    >
                        <h3 className="text-lg font-semibold mb-2">
                            Genre Preferences (Select 2)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                            {genreList.map((genre) => (
                                <label
                                    key={genre.id}
                                    className="flex items-center space-x-2"
                                >
                                    <input
                                        type="checkbox"
                                        value={genre.id}
                                        checked={selectedGenres.includes(
                                            genre.id
                                        )}
                                        onChange={handleGenreChange}
                                        disabled={
                                            loading ||
                                            (!selectedGenres.includes(
                                                genre.id
                                            ) &&
                                                selectedGenres.length >= 2)
                                        }
                                    />
                                    <span>{genre.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                disabled={
                                    loading || selectedGenres.length !== 2
                                }
                            >
                                Save Genres
                            </button>
                        </div>
                    </form>

                    {/* Past Purchases */}
                    <div className="mb-2">
                        <h3 className="text-lg font-semibold mb-2">
                            Past Purchases
                        </h3>
                        {previousPurchases && previousPurchases.length > 0 ? (
                            <ul className="space-y-2">
                                {previousPurchases.map((movie) => (
                                    <li
                                        key={movie.id}
                                        className="flex items-center space-x-3 bg-gray-100 rounded p-2"
                                    >
                                        <img
                                            src={
                                                movie.poster_path
                                                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                                    : "https://via.placeholder.com/92x138?text=No+Image"
                                            }
                                            alt={movie.title}
                                            className="w-12 h-16 object-cover rounded shadow"
                                        />
                                        <span>{movie.title}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No purchases yet.</p>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
