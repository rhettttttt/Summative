import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function ErrorView() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-xl mb-6">
                    Oops! The page you’re looking for doesn’t exist.
                </p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium transition"
                >
                    Back to Home
                </Link>
            </main>
            <Footer />
        </div>
    );
}
