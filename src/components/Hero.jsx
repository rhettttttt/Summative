export default function Hero({ title, subtitle, bgImage }) {
    return (
        <section
            className="h-[60vh] bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="bg-black bg-opacity-50 p-8 rounded-xl text-center">
                <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
                <p className="text-lg text-gray-200">{subtitle}</p>
            </div>
        </section>
    );
}
