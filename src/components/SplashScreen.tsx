import { useEffect, useState } from 'react';

const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade-out after 2.5 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 2500);

        // Remove splash screen after fade-out completes
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Logo with bounce animation */}
            <div className="animate-bounce-slow mb-6">
                <img
                    src="/logo.png"
                    alt="NOTABLE Logo"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl animate-fade-in"
                />
            </div>

            {/* App Name with slide-up animation */}
            <div className="animate-slide-up-fade">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                    NOTABLE
                </h1>
                <p className="text-lg md:text-xl text-white/90 text-center font-light">
                    Your Digital Companion
                </p>
            </div>

            {/* Loading indicator */}
            <div className="mt-12 animate-pulse">
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
