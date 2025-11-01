export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Meal {
  id: string;
  name: string;
  categoryId: string;
  difficulty: Difficulty;
  hasLeftovers: boolean;
  lastServedDate: string | null;
  timesServed: number;
  createdAt: string;
}

export interface MealWithCategory extends Meal {
  categoryName: string;
  categoryColor: string;
}

export interface CreateMealRequest {
  name: string;
  categoryId: string;
  difficulty: Difficulty;
  hasLeftovers?: boolean;
}

export interface UpdateMealRequest {
  name?: string;
  categoryId?: string;
  difficulty?: Difficulty;
  hasLeftovers?: boolean;
}

export interface MealPlan {
  id: string;
  weekStartDate: string;
  meals: (MealWithCategory | null)[];
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
}
