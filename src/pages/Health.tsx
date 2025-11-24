import { useState, useEffect } from 'react';
import { Activity, Droplet, Moon, Apple, Heart, Plus, Edit2, Search, Trash2, RotateCcw } from 'lucide-react';
import { searchFood, calculateNutrients, type FoodItem } from '../utils/foodDatabase';
import ModalWrapper from '../components/ModalWrapper';

interface HealthProfile {
    height: number;
    weight: number;
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    setupComplete: boolean;
}

interface WaterLog {
    id: string;
    amount: number;
    time: string;
}

interface ExerciseLog {
    id: string;
    minutes: number;
    type: string;
    time: string;
}

interface MealLog {
    id: string;
    food: FoodItem;
    grams: number;
    nutrients: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
    };
    time: string;
}

interface HealthData {
    date: string;
    waterLogs: WaterLog[];
    exerciseLogs: ExerciseLog[];
    mealLogs: MealLog[];
    sleep: { hours: number; quality: number; goal: number; bedtime?: string; wakeTime?: string };
    mood: number;
    goals: {
        water: number;
        exercise: number;
        calories: number;
    };
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
            setupComplete: false
        };
    });

    const [showOnboarding, setShowOnboarding] = useState(!healthProfile.setupComplete);
    const [showNutritionModal, setShowNutritionModal] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [showWaterEdit, setShowWaterEdit] = useState(false);
    const [showExerciseEdit, setShowExerciseEdit] = useState(false);

    // Exercise modal state
    const [exerciseType, setExerciseType] = useState('');
    const [exerciseMinutes, setExerciseMinutes] = useState('');

    // Nutrition modal state
    const [foodSearch, setFoodSearch] = useState('');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [foodGrams, setFoodGrams] = useState('100');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

    // Onboarding form
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        age: '',
        gender: 'male' as 'male' | 'female' | 'other',
        activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
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
        const waterGoal = Math.round((profile.weight * 0.033) / 0.25);
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
        };
    };

    const [healthData, setHealthData] = useState<HealthData>(() => {
        const saved = localStorage.getItem(`health_${today}`);
        const goals = healthProfile.setupComplete ? calculatePersonalizedGoals(healthProfile) : {
            water: 8,
            calories: 2000,
            exercise: 60,
        };

        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure all required fields exist with defaults
            return {
                date: parsed.date || today,
                waterLogs: parsed.waterLogs || [],
                exerciseLogs: parsed.exerciseLogs || [],
                mealLogs: parsed.mealLogs || [],
                sleep: parsed.sleep || { hours: 0, quality: 0, goal: 8 },
                mood: parsed.mood || 0,
                goals: parsed.goals || goals
            };
        }

        return {
            date: today,
            waterLogs: [],
            exerciseLogs: [],
            mealLogs: [],
            sleep: { hours: 0, quality: 0, goal: 8 },
            mood: 0,
            goals
        };
    });

    useEffect(() => {
        localStorage.setItem('healthProfile', JSON.stringify(healthProfile));
    }, [healthProfile]);

    useEffect(() => {
        localStorage.setItem(`health_${today}`, JSON.stringify(healthData));
    }, [healthData, today]);

    useEffect(() => {
        if (foodSearch.length > 0) {
            setSearchResults(searchFood(foodSearch));
        } else {
            setSearchResults([]);
        }
    }, [foodSearch]);

    const handleOnboardingSubmit = () => {
        const profile: HealthProfile = {
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            age: parseInt(formData.age),
            gender: formData.gender,
            activityLevel: formData.activityLevel,
            setupComplete: true
        };
        setHealthProfile(profile);
        const personalizedGoals = calculatePersonalizedGoals(profile);
        setHealthData(prev => ({
            ...prev,
            goals: personalizedGoals
        }));
        setShowOnboarding(false);
    };

    // Water functions
    const addWater = () => {
        const newLog: WaterLog = {
            id: Date.now().toString(),
            amount: 1,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setHealthData(prev => ({
            ...prev,
            waterLogs: [...prev.waterLogs, newLog]
        }));
    };

    const deleteWaterLog = (id: string) => {
        setHealthData(prev => ({
            ...prev,
            waterLogs: prev.waterLogs.filter(log => log.id !== id)
        }));
    };

    const undoLastWater = () => {
        setHealthData(prev => ({
            ...prev,
            waterLogs: prev.waterLogs.slice(0, -1)
        }));
    };

    // Exercise functions
    const handleExerciseSubmit = () => {
        if (!exerciseType || !exerciseMinutes) return;

        const newLog: ExerciseLog = {
            id: Date.now().toString(),
            type: exerciseType,
            minutes: parseInt(exerciseMinutes),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setHealthData(prev => ({
            ...prev,
            exerciseLogs: [...prev.exerciseLogs, newLog]
        }));

        // Reset modal state
        setExerciseType('');
        setExerciseMinutes('');
        setShowExerciseModal(false);
    };

    const deleteExerciseLog = (id: string) => {
        setHealthData(prev => ({
            ...prev,
            exerciseLogs: prev.exerciseLogs.filter(log => log.id !== id)
        }));
    };

    // Nutrition functions
    const addMeal = () => {
        if (!selectedFood || !foodGrams) return;
        const grams = parseFloat(foodGrams);
        const nutrients = calculateNutrients(selectedFood, grams);
        const newMeal: MealLog = {
            id: Date.now().toString(),
            food: selectedFood,
            grams,
            nutrients,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setHealthData(prev => ({
            ...prev,
            mealLogs: [...prev.mealLogs, newMeal]
        }));
        setShowNutritionModal(false);
        setSelectedFood(null);
        setFoodSearch('');
        setFoodGrams('100');
    };

    const deleteMealLog = (id: string) => {
        setHealthData(prev => ({
            ...prev,
            mealLogs: prev.mealLogs.filter(log => log.id !== id)
        }));
    };

    // Calculate totals
    const totalWater = (healthData.waterLogs || []).reduce((sum, log) => sum + log.amount, 0);
    const totalExercise = (healthData.exerciseLogs || []).reduce((sum, log) => sum + log.minutes, 0);
    const totalNutrients = (healthData.mealLogs || []).reduce((totals, meal) => ({
        calories: totals.calories + meal.nutrients.calories,
        protein: totals.protein + meal.nutrients.protein,
        carbs: totals.carbs + meal.nutrients.carbs,
        fat: totals.fat + meal.nutrients.fat,
        fiber: totals.fiber + meal.nutrients.fiber,
        sugar: totals.sugar + meal.nutrients.sugar,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });

    const calculateHealthScore = () => {
        const goals = healthData.goals || { water: 8, exercise: 60, calories: 2000 };
        const mood = healthData.mood || 0;

        const waterScore = Math.min((totalWater / goals.water) * 25, 25);
        const exerciseScore = Math.min((totalExercise / goals.exercise) * 30, 30);
        const nutritionScore = totalNutrients.calories > 0 ?
            Math.min((1 - Math.abs(totalNutrients.calories - goals.calories) / goals.calories) * 30, 30) : 0;
        const moodScore = mood > 0 ? (mood / 5) * 15 : 0;
        return Math.round(waterScore + exerciseScore + nutritionScore + moodScore);
    };


    const getPersonalizedAdvice = () => {
        const advice = [];
        const bmi = healthProfile.setupComplete ? parseFloat(calculateBMI(healthProfile.weight, healthProfile.height)) : 0;

        // Helper to randomly select from array
        const randomPick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        if (healthProfile.setupComplete) {
            const bmiInfo = getBMICategory(bmi);
            if (bmi < 18.5) {
                const tips = [
                    `Your BMI is ${bmi} (${bmiInfo.category}). Consider increasing calorie intake and strength training.`,
                    `BMI ${bmi} suggests you're underweight. Focus on nutrient-dense foods and resistance exercises.`,
                    `At BMI ${bmi}, aim for 300-500 extra calories daily with protein-rich meals.`
                ];
                advice.push({ icon: '⚖️', text: randomPick(tips), type: 'info' });
            } else if (bmi >= 25) {
                const tips = [
                    `Your BMI is ${bmi} (${bmiInfo.category}). Focus on balanced nutrition and regular exercise.`,
                    `BMI ${bmi} indicates you're overweight. Small dietary changes can make a big difference!`,
                    `At BMI ${bmi}, aim for 30 minutes of daily activity and portion control.`
                ];
                advice.push({ icon: '⚖️', text: randomPick(tips), type: 'warning' });
            }
        }

        const goals = healthData.goals || { water: 8, exercise: 60, calories: 2000 };
        const mealLogs = healthData.mealLogs || [];

        // Water advice with variations
        if (totalWater < goals.water * 0.5) {
            const waterTips = [
                `You're ${Math.round((1 - totalWater / goals.water) * 100)}% below your water goal. Drink ${goals.water - totalWater} more glasses!`,
                `Dehydration alert! You need ${goals.water - totalWater} more glasses to reach your goal.`,
                `Stay hydrated! ${goals.water - totalWater} more glasses will get you to your daily target.`,
                `Your body needs water! Aim for ${goals.water - totalWater} more glasses today.`
            ];
            advice.push({ icon: '💧', text: randomPick(waterTips), type: 'warning' });
        } else if (totalWater >= goals.water) {
            const successTips = [
                'Excellent hydration! You\'ve met your personalized water goal! 💧',
                'Perfectly hydrated! Your body thanks you! 🌊',
                'Water goal crushed! Keep up the great work! 💦',
                'Hydration champion! You\'re taking great care of yourself! 💙'
            ];
            advice.push({ icon: '💧', text: randomPick(successTips), type: 'success' });
        }

        // Exercise advice with variations
        if (totalExercise === 0) {
            const exerciseTips = healthProfile.activityLevel === 'sedentary'
                ? [
                    'No exercise logged today. Try a 15-minute walk!',
                    'Start small! A 15-minute stroll can boost your mood.',
                    'Get moving! Even 15 minutes of walking helps.',
                    'Your body craves movement! Take a quick 15-minute walk.'
                ]
                : [
                    'No exercise logged today. Try a 30-minute workout!',
                    'Time to move! A 30-minute session will energize you.',
                    'Your muscles are ready! Go for a 30-minute workout.',
                    'Don\'t skip today! 30 minutes of exercise makes a difference.'
                ];
            advice.push({ icon: '🏃', text: randomPick(exerciseTips), type: 'warning' });
        } else if (totalExercise >= goals.exercise) {
            const exerciseSuccess = [
                'Amazing! You\'ve hit your personalized exercise goal! 🎉',
                'Fitness goal achieved! You\'re unstoppable! 💪',
                'Exercise goal completed! Tomorrow is another opportunity! 🌟',
                'You crushed your workout target! Incredible dedication! 🔥'
            ];
            advice.push({ icon: '🏃', text: randomPick(exerciseSuccess), type: 'success' });
        } else if (totalExercise > 0 && totalExercise < goals.exercise) {
            const progressTips = [
                `Great start! ${goals.exercise - totalExercise} more minutes to reach your goal.`,
                `You're on the right track! Keep going for ${goals.exercise - totalExercise} more minutes.`,
                `Nice progress! Just ${goals.exercise - totalExercise} minutes away from your target.`
            ];
            advice.push({ icon: '🏃', text: randomPick(progressTips), type: 'info' });
        }

        // Nutrition advice with variations
        if (totalNutrients.protein < 50 && mealLogs.length > 0) {
            const proteinTips = [
                `Low protein intake (${totalNutrients.protein.toFixed(1)}g). Add protein-rich foods like chicken, eggs, or lentils.`,
                `Boost your protein! Add eggs, fish, or Greek yogurt to reach your target.`,
                `Only ${totalNutrients.protein.toFixed(1)}g protein today. Try adding nuts, beans, or lean meat.`,
                `Protein is key for recovery! Add some tofu, chicken, or chickpeas.`
            ];
            advice.push({ icon: '🥩', text: randomPick(proteinTips), type: 'warning' });
        }

        if (totalNutrients.calories > 0 && totalNutrients.calories >= goals.calories * 1.2) {
            const calorieWarnings = [
                'You\'ve exceeded your calorie goal. Consider lighter options for dinner.',
                'Calorie intake is high today. Balance with vegetables and whole grains.',
                'Over your calorie target. Stay mindful of portion sizes!'
            ];
            advice.push({ icon: '🍽️', text: randomPick(calorieWarnings), type: 'warning' });
        }

        // Motivational tip if doing well
        if (advice.filter(a => a.type === 'success').length >= 2) {
            const motivationalTips = [
                'You\'re crushing it today! Keep this momentum going! 🌟',
                'Outstanding progress! You\'re building healthy habits! 💫',
                'Incredible work! Your consistency will pay off! ⭐',
                'You\'re on fire! This is what success looks like! 🔥'
            ];
            advice.push({ icon: '🎯', text: randomPick(motivationalTips), type: 'success' });
        }

        // General wellness tip when no specific advice
        if (advice.length === 0) {
            const generalTips = [
                'Start your health journey today! Log your first activity.',
                'Small steps lead to big changes. Begin tracking your wellness!',
                'Your health matters! Track water, exercise, or meals to get started.',
                'Today is perfect for building healthy habits. Let\'s begin!',
                'Wellness journey starts with one step. Log an activity now!',
                'Take charge of your health today! Start with water or exercise.'
            ];
            advice.push({ icon: '✨', text: randomPick(generalTips), type: 'info' });
        }

        return advice;
    };

    const healthScore = calculateHealthScore();
    const advice = getPersonalizedAdvice();
    const bmi = healthProfile.setupComplete ? parseFloat(calculateBMI(healthProfile.weight, healthProfile.height)) : 0;
    const bmiInfo = healthProfile.setupComplete ? getBMICategory(bmi) : null;

    // Safety variables for JSX
    const safeGoals = healthData.goals || { water: 8, exercise: 60, calories: 2000 };
    const safeSleep = healthData.sleep || { hours: 0, quality: 0, goal: 8 };
    const safeMood = healthData.mood || 0;
    const safeWaterLogs = healthData.waterLogs || [];
    const safeExerciseLogs = healthData.exerciseLogs || [];
    const safeMealLogs = healthData.mealLogs || [];

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
                                        {totalWater}/{healthData.goals.water} glasses
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {healthData.waterLogs.length > 0 && (
                                    <button
                                        onClick={undoLastWater}
                                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:scale-110 transition"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowWaterEdit(!showWaterEdit)}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:scale-110 transition"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={addWater}
                                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((totalWater / healthData.goals.water) * 100, 100)}%` }}
                            />
                        </div>
                        {showWaterEdit && healthData.waterLogs.length > 0 && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                {healthData.waterLogs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between text-sm">
                                        <span>{log.amount} glass at {log.time}</span>
                                        <button
                                            onClick={() => deleteWaterLog(log.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                        {totalExercise}/{healthData.goals.exercise} min
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowExerciseEdit(!showExerciseEdit)}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:scale-110 transition"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setShowExerciseModal(true)}
                                    className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((totalExercise / healthData.goals.exercise) * 100, 100)}%` }}
                            />
                        </div>
                        {showExerciseEdit && healthData.exerciseLogs.length > 0 && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                {healthData.exerciseLogs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between text-sm">
                                        <span>{log.type} - {log.minutes} min at {log.time}</span>
                                        <button
                                            onClick={() => deleteExerciseLog(log.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
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
                                        {totalNutrients.calories}/{healthData.goals.calories} cal
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNutritionModal(true)}
                                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:scale-110 transition"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                            <div
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((totalNutrients.calories / healthData.goals.calories) * 100, 100)}%` }}
                            />
                        </div>

                        {/* Nutrient Breakdown */}
                        {healthData.mealLogs.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                                    <p className="font-semibold text-sm">{totalNutrients.protein.toFixed(1)}g</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                                    <p className="font-semibold text-sm">{totalNutrients.carbs.toFixed(1)}g</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
                                    <p className="font-semibold text-sm">{totalNutrients.fat.toFixed(1)}g</p>
                                </div>
                            </div>
                        )}

                        {/* Meal History */}
                        {healthData.mealLogs.length > 0 && (
                            <div className="space-y-2 mt-3">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Today's Meals</p>
                                {healthData.mealLogs.map((meal) => (
                                    <div key={meal.id} className="flex items-start justify-between text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{meal.food.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {meal.grams}g • {meal.nutrients.calories} cal • P:{meal.nutrients.protein.toFixed(1)}g C:{meal.nutrients.carbs.toFixed(1)}g F:{meal.nutrients.fat.toFixed(1)}g
                                            </p>
                                            <p className="text-xs text-gray-400">{meal.time}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteMealLog(meal.id)}
                                            className="text-red-500 hover:text-red-700 ml-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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

            {/* Nutrition Modal */}
            {showNutritionModal && (
                <ModalWrapper
                    isOpen={showNutritionModal}
                    onClose={() => {
                        setShowNutritionModal(false);
                        setSelectedFood(null);
                        setFoodSearch('');
                    }}
                    title="Add Food"
                >
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={foodSearch}
                                onChange={(e) => setFoodSearch(e.target.value)}
                                placeholder="Search food (e.g., chicken, rice, apple)"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && !selectedFood && (
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {searchResults.map((food, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedFood(food);
                                            setFoodSearch('');
                                        }}
                                        className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        <p className="font-medium">{food.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {food.category} • {food.calories} cal/100g
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Food */}
                        {selectedFood && (
                            <div className="space-y-4">
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                    <p className="font-semibold">{selectedFood.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFood.category}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount (grams)</label>
                                    <input
                                        type="number"
                                        value={foodGrams}
                                        onChange={(e) => setFoodGrams(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                {/* Nutrient Preview */}
                                {foodGrams && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <p className="text-sm font-semibold mb-2">Nutritional Information</p>
                                        {(() => {
                                            const nutrients = calculateNutrients(selectedFood, parseFloat(foodGrams));
                                            return (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>Calories: <span className="font-semibold">{nutrients.calories}</span></div>
                                                    <div>Protein: <span className="font-semibold">{nutrients.protein.toFixed(1)}g</span></div>
                                                    <div>Carbs: <span className="font-semibold">{nutrients.carbs.toFixed(1)}g</span></div>
                                                    <div>Fat: <span className="font-semibold">{nutrients.fat.toFixed(1)}g</span></div>
                                                    <div>Fiber: <span className="font-semibold">{nutrients.fiber.toFixed(1)}g</span></div>
                                                    <div>Sugar: <span className="font-semibold">{nutrients.sugar.toFixed(1)}g</span></div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedFood(null);
                                            setFoodGrams('100');
                                        }}
                                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                    >
                                        Change Food
                                    </button>
                                    <button
                                        onClick={addMeal}
                                        disabled={!foodGrams}
                                        className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-2xl font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                    >
                                        Add Meal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </ModalWrapper>
            )}

            {/* Exercise Modal */}
            {showExerciseModal && (
                <ModalWrapper
                    isOpen={showExerciseModal}
                    onClose={() => {
                        setShowExerciseModal(false);
                        setExerciseType('');
                        setExerciseMinutes('');
                    }}
                    title="Log Exercise"
                >
                    <div className="space-y-4">
                        {/* Exercise Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Exercise Type</label>
                            <input
                                type="text"
                                value={exerciseType}
                                onChange={(e) => setExerciseType(e.target.value)}
                                placeholder="e.g., Running, Gym, Yoga, Swimming"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                            <input
                                type="number"
                                value={exerciseMinutes}
                                onChange={(e) => setExerciseMinutes(e.target.value)}
                                placeholder="30"
                                min="1"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        {/* Quick Suggestions */}
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Add</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['Running', 'Gym', 'Yoga', 'Cycling', 'Swimming', 'Walking'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setExerciseType(type)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${exerciseType === type
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleExerciseSubmit}
                            disabled={!exerciseType || !exerciseMinutes}
                            className="w-full px-6 py-3 bg-green-500 text-white rounded-2xl font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Log Exercise
                        </button>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
};

export default Health;
