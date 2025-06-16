export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300">
            <div className="max-w-7xl mx-auto p-4 text-center">
                &copy; {new Date().getFullYear()} QayFlix. All rights
                reserved.
            </div>
        </footer>
    );
}
