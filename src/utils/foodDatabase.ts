// Comprehensive food database with nutritional information per 100g
export interface FoodItem {
    name: string;
    category: string;
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber: number; // grams
    sugar: number; // grams
}

export const foodDatabase: FoodItem[] = [
    // Grains & Cereals
    { name: 'White Rice (cooked)', category: 'Grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
    { name: 'Brown Rice (cooked)', category: 'Grains', calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, sugar: 0.4 },
    { name: 'Whole Wheat Bread', category: 'Grains', calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 6, sugar: 5 },
    { name: 'Oats', category: 'Grains', calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, sugar: 1 },
    { name: 'Quinoa (cooked)', category: 'Grains', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9 },

    // Proteins
    { name: 'Chicken Breast (cooked)', category: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
    { name: 'Salmon (cooked)', category: 'Protein', calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
    { name: 'Eggs (boiled)', category: 'Protein', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
    { name: 'Tofu', category: 'Protein', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.7 },
    { name: 'Lentils (cooked)', category: 'Protein', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 1.8 },
    { name: 'Chickpeas (cooked)', category: 'Protein', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, sugar: 4.8 },

    // Dairy
    { name: 'Milk (whole)', category: 'Dairy', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1 },
    { name: 'Greek Yogurt', category: 'Dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2 },
    { name: 'Cheddar Cheese', category: 'Dairy', calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5 },
    { name: 'Paneer', category: 'Dairy', calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0, sugar: 1.2 },

    // Vegetables
    { name: 'Broccoli', category: 'Vegetables', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7 },
    { name: 'Spinach', category: 'Vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
    { name: 'Tomato', category: 'Vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
    { name: 'Carrot', category: 'Vegetables', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
    { name: 'Potato (boiled)', category: 'Vegetables', calories: 87, protein: 2, carbs: 20, fat: 0.1, fiber: 1.8, sugar: 0.9 },

    // Fruits
    { name: 'Apple', category: 'Fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10 },
    { name: 'Banana', category: 'Fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12 },
    { name: 'Orange', category: 'Fruits', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9 },
    { name: 'Mango', category: 'Fruits', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 14 },
    { name: 'Strawberries', category: 'Fruits', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },

    // Nuts & Seeds
    { name: 'Almonds', category: 'Nuts', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 13, sugar: 4.4 },
    { name: 'Peanuts', category: 'Nuts', calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sugar: 4 },
    { name: 'Walnuts', category: 'Nuts', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6 },
    { name: 'Chia Seeds', category: 'Seeds', calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, sugar: 0 },

    // Indian Foods
    { name: 'Roti (whole wheat)', category: 'Indian', calories: 297, protein: 11, carbs: 51, fat: 6.7, fiber: 7.3, sugar: 2.7 },
    { name: 'Dal (cooked)', category: 'Indian', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 1.8 },
    { name: 'Idli', category: 'Indian', calories: 156, protein: 3.9, carbs: 30, fat: 2.3, fiber: 0.8, sugar: 0.5 },
    { name: 'Dosa', category: 'Indian', calories: 168, protein: 3.9, carbs: 29, fat: 3.7, fiber: 1.4, sugar: 0.8 },
];

export const searchFood = (query: string): FoodItem[] => {
    const lowerQuery = query.toLowerCase();
    return foodDatabase.filter(food =>
        food.name.toLowerCase().includes(lowerQuery) ||
        food.category.toLowerCase().includes(lowerQuery)
    );
};

export const calculateNutrients = (food: FoodItem, grams: number) => {
    const multiplier = grams / 100;
    return {
        calories: Math.round(food.calories * multiplier),
        protein: Math.round(food.protein * multiplier * 10) / 10,
        carbs: Math.round(food.carbs * multiplier * 10) / 10,
        fat: Math.round(food.fat * multiplier * 10) / 10,
        fiber: Math.round(food.fiber * multiplier * 10) / 10,
        sugar: Math.round(food.sugar * multiplier * 10) / 10,
    };
};
