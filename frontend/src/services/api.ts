import {
  Category,
  Meal,
  MealWithCategory,
  CreateMealRequest,
  UpdateMealRequest,
  CreateCategoryRequest,
} from '../types';

const API_BASE = '/api';

// Categories
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const response = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }
  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
}

// Meals
export async function getMeals(): Promise<MealWithCategory[]> {
  const response = await fetch(`${API_BASE}/meals`);
  if (!response.ok) {
    throw new Error('Failed to fetch meals');
  }
  return response.json();
}

export async function getMeal(id: string): Promise<MealWithCategory> {
  const response = await fetch(`${API_BASE}/meals/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch meal');
  }
  return response.json();
}

export async function createMeal(data: CreateMealRequest): Promise<MealWithCategory> {
  const response = await fetch(`${API_BASE}/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create meal');
  }
  return response.json();
}

export async function updateMeal(id: string, data: UpdateMealRequest): Promise<MealWithCategory> {
  const response = await fetch(`${API_BASE}/meals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update meal');
  }
  return response.json();
}

export async function deleteMeal(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/meals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete meal');
  }
}
