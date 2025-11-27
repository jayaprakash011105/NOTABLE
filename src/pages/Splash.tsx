import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
    const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade out animation after 2 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 2000);

        // Navigate to login after fade out completes
        const navTimer = setTimeout(() => {
            navigate('/login');
        }, 2500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(navTimer);
        };
    }, [navigate]);

    return (
        <div
            className={`fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            <div className="flex flex-col items-center gap-8 animate-splash">
                {/* Logo */}
                <div className="w-32 h-32 md:w-40 md:h-40 animate-logo-bounce">
                    <img
                        src="/logo.png"
                        alt="Notable Logo"
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                </div>

                {/* App Name */}
                <div className="text-center animate-text-fade-up">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-wider">
                        NOTABLE
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide">
                        Your Digital Companion
                    </p>
                </div>

                {/* Loading Indicator */}
                <div className="mt-8 animate-pulse-slow">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Splash;
