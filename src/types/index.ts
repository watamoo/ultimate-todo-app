import { Priority } from '@prisma/client';

export interface TodoItem {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: Date | null;
  priority: Priority;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: Date;
  updatedAt: Date;
  position: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  todos?: TodoItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoFormValues {
  title: string;
  description?: string;
  dueDate?: Date | null;
  priority: Priority;
  categoryId?: string | null;
}

export interface CategoryFormValues {
  name: string;
  color: string;
}
