import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Genres from "../components/Genres";
import Footer from "../components/Footer";

export default function MoviesView({ genreList }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow max-w-7xl mx-auto px-4 py-8">
                <div className="md:flex md:space-x-6">
                    <aside className="md:w-1/4 mb-6 md:mb-0">
                        <Genres genres={genreList} />
                    </aside>
                    <section className="md:w-3/4">
                        <Outlet />
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
