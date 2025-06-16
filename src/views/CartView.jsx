import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";
import { firestore } from "../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PAGE_SIZE = 5;

export default function CartView() {
  const { cartItems, setCartItems, removeFromCart } = useContext(CartContext);
  const { user, previousPurchases, setPreviousPurchases } = useContext(UserContext);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Get IDs of already purchased movies
  const purchasedIds = previousPurchases?.map((m) => m.id) || [];

  // Filter out movies already purchased from the cart
  const filteredCartItems = cartItems.filter(
    (item) => !purchasedIds.includes(item.id)
  );

  // Paginated items for display (only what's in cart, not purchased)
  const visibleItems = filteredCartItems;
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const paginatedItems = visibleItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset to page 1 if visibleItems length changes and page is out of bounds
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [cartItems, totalPages, page]);

  const handleCheckout = async () => {
    setCheckoutMessage("");
    setErrorMessage("");
    setProcessing(true);

    if (!user || !user.uid) {
      setErrorMessage("You must be logged in to checkout.");
      setProcessing(false);
      return;
    }
    if (filteredCartItems.length === 0) {
      setErrorMessage("You have already purchased all movies in your cart.");
      setProcessing(false);
      return;
    }
    try {
      // Update Firestore: add only new cart items to purchaseHistory array
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        purchaseHistory: arrayUnion(...filteredCartItems),
      });

      // Try to get updated purchases, but don't fail the checkout if this fails
      let updatedPurchases = [];
      try {
        const userDoc = await getDoc(userRef);
        updatedPurchases = (userDoc.exists() && userDoc.data().purchaseHistory) ? userDoc.data().purchaseHistory : [];
        setPreviousPurchases(updatedPurchases);
      } catch (err) {
        // Optionally log this error, but don't show to user
      }

      // Remove purchased items from cart and localStorage
      setCartItems([]);
      localStorage.setItem("cartItems", JSON.stringify([]));

      setCheckoutMessage("Thank you for your purchase!");
      setPage(1); // Reset to first page after checkout
    } catch (err) {
      setErrorMessage("Checkout failed. " + (err.message || "Please try again. Your cart has not been changed."));
    } finally {
      setProcessing(false);
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow flex flex-col items-center p-6">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Cart</h2>
          {checkoutMessage && (
            <div className="mb-4 text-green-600 text-center">{checkoutMessage}</div>
          )}
          {errorMessage && (
            <div className="mb-4 text-red-600 text-center">{errorMessage}</div>
          )}
          {visibleItems.length === 0 ? (
            <div className="text-center text-gray-500">Your cart is empty.</div>
          ) : (
            <>
              <ul className="divide-y">
                {paginatedItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                            : "https://via.placeholder.com/92x138?text=No+Image"
                        }
                        alt={item.title}
                        className="w-20 h-28 object-cover rounded shadow"
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <button
                      className="ml-4 text-red-500 hover:underline"
                      onClick={() => removeFromCart(item.id)}
                      disabled={processing}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    onClick={handlePrev}
                    disabled={page === 1 || processing}
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    onClick={handleNext}
                    disabled={page === totalPages || processing}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          <button
            className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:bg-gray-400"
            onClick={handleCheckout}
            disabled={filteredCartItems.length === 0 || processing}
          >
            {processing ? "Processing..." : "Checkout"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
