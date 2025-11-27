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
        ```
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
            className={`fixed inset - 0 z - 50 flex flex - col items - center justify - center bg - white dark: bg - black transition - opacity duration - 500 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
        } `}
        >
            {/* Logo with subtle fade-in */}
            <div className="animate-fade-in mb-8">
                <img
                    src="/logo.png"
                    alt="NOTABLE Logo"
                    className="w-24 h-24 md:w-32 md:h-32 object-contain opacity-90"
                />
            </div>

            {/* App Name with minimal animation */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-2 tracking-wider">
                    NOTABLE
                </h1>
                <div className="h-0.5 w-full bg-black dark:bg-white mt-2 transform scale-x-0 animate-expand"></div>
            </div>

            {/* Minimalist tagline */}
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-6 font-light tracking-wide animate-fade-in" style={{ animationDelay: '0.4s' }}>
                Your Digital Companion
            </p>
        </div>
    );
};

export default SplashScreen;
```
