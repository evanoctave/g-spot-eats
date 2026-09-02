export type Diet =
| 'HIGH-PROTEIN'
| 'HIGH-CARB'
| 'HIGH-FAT'
| 'BALANCED';

export type semiMacro =
| 'protein'
| 'carb'
| 'vegetable'
| 'fat'
| 'mixed'
| 'dessert'
| 'other';

export type RecAction =
| 'approve'
| 'reject'
| 'modify';

export interface Nutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;

    saturatedFat?: number | null;
    unsaturatedFat?: number | null;
    transFat?: number | null;

    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
    cholesterol?: number | null;
}

export interface Serving {
    quantity: number;
    unit: string;

    description?: string;
}