import { useState, useEffect } from 'react';
import { Activity, Droplet, Moon, Apple, Weight, Pill, Heart, TrendingUp, Plus, Target, Bell, X, Check } from 'lucide-react';

interface HealthProfile {
    height: number; // cm
    weight: number; // kg
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    healthConditions: string[];
    fitnessGoals: string[];
    setupComplete: boolean;
}

interface HealthData {
    date: string;
    water: { intake: number; goal: number };
    exercise: { minutes: number; goal: number };
    sleep: { hours: number; quality: number; goal: number };
    nutrition: { calories: number; goal: number };
    weight: number;
    mood: number;
}

interface HealthGoal {
    metric: string;
    target: number;
    current: number;
    unit: string;
    reminderEnabled: boolean;
    reminderTime: string;
}

const Health = () => {
    const today = new Date().toISOString().split('T')[0];

    const [healthProfile, setHealthProfile] = useState<HealthProfile>(() => {
        const saved = localStorage.getItem('healthProfile');
        return saved ? JSON.parse(saved) : {
            height: 0,
            weight: 0,
            age: 0,
            gender: 'male',
            activityLevel: 'moderate',
            healthConditions: [],
            fitnessGoals: [],
            setupComplete: false
        };
    });

    const [showOnboarding, setShowOnboarding] = useState(!healthProfile.setupComplete);
    const [showGoalSetting, setShowGoalSetting] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState('');

    // Onboarding form state
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        age: '',
        gender: 'male' as 'male' | 'female' | 'other',
        activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        healthConditions: [] as string[],
        fitnessGoals: [] as string[]
    });

    const calculateBMI = (weight: number, height: number) => {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
        if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
        if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600' };
        return { category: 'Obese', color: 'text-red-600' };
    };

    const calculatePersonalizedGoals = (profile: HealthProfile) => {
        // Water goal based on weight (30-35ml per kg)
        const waterGoal = Math.round((profile.weight * 0.033) / 0.25); // glasses (250ml each)

        // Calorie goal based on BMR and activity level
        const bmr = profile.gender === 'male'
            ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        const calorieGoal = Math.round(bmr * activityMultipliers[profile.activityLevel]);

        // Exercise goal based on activity level
        const exerciseGoals = {
            sedentary: 30,
            light: 45,
            moderate: 60,
            active: 75,
            very_active: 90
        };

        return {
            water: waterGoal,
            calories: calorieGoal,
            exercise: exerciseGoals[profile.activityLevel],
            sleep: 8
        };
    };

    const [healthData, setHealthData] = useState<HealthData>(() => {
        const saved = localStorage.getItem(`health_${today}`);
        if (saved) return JSON.parse(saved);

        const goals = healthProfile.setupComplete ? calculatePersonalizedGoals(healthProfile) : {
            water: 8,
            calories: 2000,
            exercise: 60,
            sleep: 8
        };

        return {
            date: today,
            water: { intake: 0, goal: goals.water },
            exercise: { minutes: 0, goal: goals.exercise },
            sleep: { hours: 0, quality: 0, goal: goals.sleep },
            nutrition: { calories: 0, goal: goals.calories },
            weight: healthProfile.weight,
            mood: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('healthProfile', JSON.stringify(healthProfile));
    }, [healthProfile]);

    useEffect(() => {
        localStorage.setItem(`health_${today}`, JSON.stringify(healthData));
    }, [healthData, today]);

    const handleOnboardingSubmit = () => {
        const profile: HealthProfile = {
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            age: parseInt(formData.age),
            gender: formData.gender,
            activityLevel: formData.activityLevel,
            healthConditions: formData.healthConditions,
            fitnessGoals: formData.fitnessGoals,
            setupComplete: true
        };

        setHealthProfile(profile);

        // Update goals based on profile
        const personalizedGoals = calculatePersonalizedGoals(profile);
        setHealthData(prev => ({
            ...prev,
            water: { ...prev.water, goal: personalizedGoals.water },
            exercise: { ...prev.exercise, goal: personalizedGoals.exercise },
            sleep: { ...prev.sleep, goal: personalizedGoals.sleep },
            nutrition: { ...prev.nutrition, goal: personalizedGoals.calories },
            weight: profile.weight
        }));

        setShowOnboarding(false);
    };

    const calculateHealthScore = () => {
        const waterScore = Math.min((healthData.water.intake / healthData.water.goal) * 20, 20);
        const exerciseScore = Math.min((healthData.exercise.minutes / healthData.exercise.goal) * 25, 25);
        const sleepScore = healthData.sleep.hours > 0 ? Math.min((healthData.sleep.hours / healthData.sleep.goal) * 25, 25) : 0;
        const nutritionScore = healthData.nutrition.calories > 0 ?
            Math.min((1 - Math.abs(healthData.nutrition.calories - healthData.nutrition.goal) / healthData.nutrition.goal) * 20, 20) : 0;
        const moodScore = (healthData.mood / 5) * 10;

        return Math.round(waterScore + exerciseScore + sleepScore + nutritionScore + moodScore);
    };

    const getPersonalizedAdvice = () => {
        const advice = [];
        const bmi = healthProfile.setupComplete ? parseFloat(calculateBMI(healthProfile.weight, healthProfile.height)) : 0;

        // BMI-based advice
        if (healthProfile.setupComplete) {
            const bmiInfo = getBMICategory(bmi);
            if (bmi < 18.5) {
                advice.push({ icon: '⚖️', text: `Your BMI is ${bmi} (${bmiInfo.category}). Consider increasing calorie intake and strength training.`, type: 'info' });
            } else if (bmi >= 25) {
                advice.push({ icon: '⚖️', text: `Your BMI is ${bmi} (${bmiInfo.category}). Focus on balanced nutrition and regular exercise.`, type: 'warning' });
            }
        }

        // Water intake advice
        if (healthData.water.intake < healthData.water.goal * 0.5) {
            advice.push({ icon: '💧', text: `You're ${Math.round((1 - healthData.water.intake / healthData.water.goal) * 100)}% below your water goal. Drink ${healthData.water.goal - healthData.water.intake} more glasses!`, type: 'warning' });
        } else if (healthData.water.intake >= healthData.water.goal) {
            advice.push({ icon: '💧', text: 'Excellent hydration! You\'ve met your personalized water goal! 💧', type: 'success' });
        }

        // Exercise advice based on activity level
        if (healthData.exercise.minutes === 0) {
            const suggestion = healthProfile.activityLevel === 'sedentary' ? '15-minute walk' : '30-minute workout';
            advice.push({ icon: '🏃', text: `No exercise logged today. Try a ${suggestion}!`, type: 'warning' });
        } else if (healthData.exercise.minutes >= healthData.exercise.goal) {
            advice.push({ icon: '🏃', text: 'Amazing! You\'ve hit your personalized exercise goal! 🎉', type: 'success' });
        }

        // Sleep advice
        if (healthData.sleep.hours > 0 && healthData.sleep.hours < 6) {
            advice.push({ icon: '😴', text: 'You got less than 6 hours of sleep. Aim for 7-8 hours for optimal health.', type: 'warning' });
        } else if (healthData.sleep.hours >= 7 && healthData.sleep.hours <= 9) {
            advice.push({ icon: '😴', text: 'Perfect sleep duration! Quality rest is essential for recovery! 😴', type: 'success' });
        }

        // Age-specific advice
        if (healthProfile.age > 50 && healthData.exercise.minutes < 30) {
            advice.push({ icon: '🧘', text: 'At your age, regular moderate exercise helps maintain bone density and muscle mass.', type: 'info' });
        }

        return advice;
    };

    const healthScore = calculateHealthScore();
    const advice = getPersonalizedAdvice();
    const bmi = healthProfile.setupComplete ? parseFloat(calculateBMI(healthProfile.weight, healthProfile.height)) : 0;
    const bmiInfo = healthProfile.setupComplete ? getBMICategory(bmi) : null;

    // Onboarding Screen
    if (showOnboarding) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
                <div className="max-w-md mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Welcome to Health Tracker</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Let's set up your personalized health profile
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h3 className="font-semibold mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                        placeholder="170"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                        placeholder="70"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Age</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                        placeholder="25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Activity Level */}
                        <div>
                            <h3 className="font-semibold mb-4">Activity Level</h3>
                            <select
                                value={formData.activityLevel}
                                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="sedentary">Sedentary (little or no exercise)</option>
                                <option value="light">Light (exercise 1-3 days/week)</option>
                                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                                <option value="active">Active (exercise 6-7 days/week)</option>
                                <option value="very_active">Very Active (intense exercise daily)</option>
                            </select>
                        </div>

                        {/* BMI Preview */}
                        {formData.height && formData.weight && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                                <p className="text-sm font-medium mb-1">Your BMI</p>
                                <p className="text-2xl font-bold">
                                    {calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))}
                                </p>
                                <p className={`text-sm ${getBMICategory(parseFloat(calculateBMI(parseFloat(formData.weight), parseFloat(formData.height)))).color}`}>
                                    {getBMICategory(parseFloat(calculateBMI(parseFloat(formData.weight), parseFloat(formData.height)))).category}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleOnboardingSubmit}
                            disabled={!formData.height || !formData.weight || !formData.age}
                            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Complete Setup
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Health Dashboard
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

                {/* Health Score & BMI */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 mb-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm opacity-90">Health Score</p>
                            <h2 className="text-4xl font-bold">{healthScore}/100</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">BMI</p>
                            <h3 className="text-2xl font-bold">{bmi}</h3>
                            {bmiInfo && <p className="text-xs opacity-90">{bmiInfo.category}</p>}
                        </div>
                    </div>
                    <p className="text-sm opacity-90">
                        {healthScore >= 80 ? 'Excellent! Keep it up!' :
                            healthScore >= 60 ? 'Good progress!' :
                                healthScore >= 40 ? 'You can do better!' :
                                    'Let\'s improve today!'}
                    </p>
                </div>

                {/* Personalized AI Advice */}
                {advice.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <h3 className="text-sm font-semibold mb-3">Personalized Advice</h3>
                        {advice.map((item, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-2xl ${item.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                                        item.type === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' :
                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowGoalSetting(true)}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:scale-110 transition"
                                >
                                    <Target className="w-4 h-4" />
                                </button>
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
                                        {healthData.sleep.hours > 0 ? `${healthData.sleep.hours}/${healthData.sleep.goal} hours` : 'Not logged'}
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
                                            sleep: { ...prev.sleep, hours: parseFloat(hours), quality: parseInt(quality) }
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

                {/* Edit Profile Button */}
                <button
                    onClick={() => setShowOnboarding(true)}
                    className="mt-6 w-full py-3 bg-gray-200 dark:bg-gray-800 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                    Edit Health Profile
                </button>
            </div>
        </div>
    );
};

export default Health;
