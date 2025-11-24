import { useState, useEffect } from 'react';
import { Activity, Droplet, Moon, Apple, Weight, Pill, Heart, TrendingUp, Plus } from 'lucide-react';

interface HealthData {
    date: string;
    water: { intake: number; goal: number };
    exercise: { minutes: number; goal: number };
    sleep: { hours: number; quality: number };
    nutrition: { calories: number; goal: number };
    weight: number;
    mood: number;
}

const Health = () => {
    const today = new Date().toISOString().split('T')[0];

    const [healthData, setHealthData] = useState<HealthData>(() => {
        const saved = localStorage.getItem(`health_${today}`);
        return saved ? JSON.parse(saved) : {
            date: today,
            water: { intake: 0, goal: 8 },
            exercise: { minutes: 0, goal: 60 },
            sleep: { hours: 0, quality: 0 },
            nutrition: { calories: 0, goal: 2000 },
            weight: 0,
            mood: 0
        };
    });

    useEffect(() => {
        localStorage.setItem(`health_${today}`, JSON.stringify(healthData));
    }, [healthData, today]);

    const calculateHealthScore = () => {
        const waterScore = Math.min((healthData.water.intake / healthData.water.goal) * 20, 20);
        const exerciseScore = Math.min((healthData.exercise.minutes / healthData.exercise.goal) * 25, 25);
        const sleepScore = Math.min((healthData.sleep.hours / 8) * 25, 25);
        const nutritionScore = healthData.nutrition.calories > 0 ?
            Math.min((1 - Math.abs(healthData.nutrition.calories - healthData.nutrition.goal) / healthData.nutrition.goal) * 20, 20) : 0;
        const moodScore = (healthData.mood / 5) * 10;

        return Math.round(waterScore + exerciseScore + sleepScore + nutritionScore + moodScore);
    };

    const getAdvice = () => {
        const advice = [];

        if (healthData.water.intake < healthData.water.goal * 0.5) {
            advice.push({ icon: '💧', text: `You're ${Math.round((1 - healthData.water.intake / healthData.water.goal) * 100)}% below your water goal. Drink ${healthData.water.goal - healthData.water.intake} more glasses!`, type: 'warning' });
        } else if (healthData.water.intake >= healthData.water.goal) {
            advice.push({ icon: '💧', text: 'Great job! You\'ve met your hydration goal for today!', type: 'success' });
        }

        if (healthData.exercise.minutes === 0) {
            advice.push({ icon: '🏃', text: 'No exercise logged today. Try a 15-minute walk!', type: 'warning' });
        } else if (healthData.exercise.minutes >= healthData.exercise.goal) {
            advice.push({ icon: '🏃', text: 'Amazing! You\'ve hit your exercise goal! 🎉', type: 'success' });
        }

        if (healthData.sleep.hours > 0 && healthData.sleep.hours < 6) {
            advice.push({ icon: '😴', text: 'You got less than 6 hours of sleep. Aim for 7-8 hours tonight.', type: 'warning' });
        } else if (healthData.sleep.hours >= 7 && healthData.sleep.hours <= 9) {
            advice.push({ icon: '😴', text: 'Perfect sleep duration! Keep it up!', type: 'success' });
        }

        return advice;
    };

    const healthScore = calculateHealthScore();
    const advice = getAdvice();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Health Tracker</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Health Score */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 mb-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm opacity-90">Health Score</p>
                            <h2 className="text-4xl font-bold">{healthScore}/100</h2>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                    </div>
                    <p className="text-sm opacity-90">
                        {healthScore >= 80 ? 'Excellent! Keep it up!' :
                            healthScore >= 60 ? 'Good progress!' :
                                healthScore >= 40 ? 'You can do better!' :
                                    'Let\'s improve today!'}
                    </p>
                </div>

                {/* AI Advice */}
                {advice.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <h3 className="text-sm font-semibold mb-3">Today's Advice</h3>
                        {advice.map((item, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-2xl ${item.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                                        'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                                    }`}
                            >
                                <p className="text-sm font-medium">{item.icon} {item.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tracking Cards */}
                <div className="space-y-4">
                    {/* Water Tracker */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Water Intake</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {healthData.water.intake}/{healthData.water.goal} glasses
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setHealthData(prev => ({
                                    ...prev,
                                    water: { ...prev.water, intake: prev.water.intake + 1 }
                                }))}
                                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((healthData.water.intake / healthData.water.goal) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Exercise Tracker */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Exercise</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {healthData.exercise.minutes}/{healthData.exercise.goal} min
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const minutes = prompt('Enter exercise minutes:');
                                    if (minutes) {
                                        setHealthData(prev => ({
                                            ...prev,
                                            exercise: { ...prev.exercise, minutes: prev.exercise.minutes + parseInt(minutes) }
                                        }));
                                    }
                                }}
                                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((healthData.exercise.minutes / healthData.exercise.goal) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Sleep Tracker */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                    <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Sleep</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {healthData.sleep.hours > 0 ? `${healthData.sleep.hours} hours` : 'Not logged'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const hours = prompt('Enter sleep hours:');
                                    const quality = prompt('Rate quality (1-5):');
                                    if (hours && quality) {
                                        setHealthData(prev => ({
                                            ...prev,
                                            sleep: { hours: parseFloat(hours), quality: parseInt(quality) }
                                        }));
                                    }
                                }}
                                className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center hover:scale-110 transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {healthData.sleep.quality > 0 && (
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={star <= healthData.sleep.quality ? 'text-yellow-500' : 'text-gray-300'}>
                                        ⭐
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nutrition Tracker */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                    <Apple className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Nutrition</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {healthData.nutrition.calories}/{healthData.nutrition.goal} cal
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const calories = prompt('Enter calories:');
                                    if (calories) {
                                        setHealthData(prev => ({
                                            ...prev,
                                            nutrition: { ...prev.nutrition, calories: prev.nutrition.calories + parseInt(calories) }
                                        }));
                                    }
                                }}
                                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:scale-110 transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((healthData.nutrition.calories / healthData.nutrition.goal) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Weight Tracker */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                                    <Weight className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Weight</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {healthData.weight > 0 ? `${healthData.weight} kg` : 'Not logged'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const weight = prompt('Enter weight (kg):');
                                    if (weight) {
                                        setHealthData(prev => ({ ...prev, weight: parseFloat(weight) }));
                                    }
                                }}
                                className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center hover:scale-110 transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mood Tracker */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Mood</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {healthData.mood > 0 ? 'Logged' : 'How are you feeling?'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-between">
                            {['😢', '😕', '😐', '🙂', '😄'].map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => setHealthData(prev => ({ ...prev, mood: index + 1 }))}
                                    className={`flex-1 py-3 rounded-xl text-2xl transition ${healthData.mood === index + 1
                                            ? 'bg-blue-500 scale-110'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Health;
