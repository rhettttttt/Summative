// src/context/UserProvider.jsx
import React, { useState, useEffect } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });
    const [genrePreferences, setGenrePreferences] = useState(() => {
        const stored = localStorage.getItem("genrePreferences");
        return stored ? JSON.parse(stored) : [];
    });
    const [shoppingCart, setShoppingCart] = useState(() => {
        const stored = localStorage.getItem("shoppingCart");
        return stored ? JSON.parse(stored) : [];
    });
    const [previousPurchases, setPreviousPurchases] = useState(() => {
        const stored = localStorage.getItem("previousPurchases");
        return stored ? JSON.parse(stored) : [];
    });

    // Save to localStorage when these change
    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(user));
    }, [user]);
    useEffect(() => {
        localStorage.setItem("genrePreferences", JSON.stringify(genrePreferences));
    }, [genrePreferences]);
    useEffect(() => {
        localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
    }, [shoppingCart]);
    useEffect(() => {
        localStorage.setItem("previousPurchases", JSON.stringify(previousPurchases));
    }, [previousPurchases]);

    // Clear cart in localStorage when user changes (login, logout, switch)
    useEffect(() => {
        localStorage.removeItem("cartItems");
        setShoppingCart([]);
    }, [user]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                genrePreferences,
                setGenrePreferences,
                shoppingCart,
                setShoppingCart,
                previousPurchases,
                setPreviousPurchases,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
