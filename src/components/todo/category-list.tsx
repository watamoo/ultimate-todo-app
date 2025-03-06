"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/types';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { CategoryForm } from './category-form';
import { createCategory, deleteCategory, updateCategory } from '@/lib/utils/api';
import { useToast } from '@/components/ui/use-toast';

interface CategoryListProps {
  categories: Category[];
  onCategoryChange: () => void;
}

export function CategoryList({ categories, onCategoryChange }: CategoryListProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateCategory = async (data: { name: string; color: string }) => {
    await createCategory(data);
    setShowForm(false);
    onCategoryChange();
    toast({
      title: 'カテゴリーを作成しました',
      description: `「${data.name}」を作成しました`,
    });
  };

  const handleUpdateCategory = async (data: { name: string; color: string }) => {
    if (!editingCategory) return;
    await updateCategory(editingCategory.id, data);
    setEditingCategory(null);
    onCategoryChange();
    toast({
      title: 'カテゴリーを更新しました',
      description: `「${data.name}」を更新しました`,
    });
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      setIsDeleting(true);
      await deleteCategory(id);
      onCategoryChange();
      toast({
        title: 'カテゴリーを削除しました',
        description: `「${name}」を削除しました`,
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: 'エラー',
        description: 'カテゴリーの削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">カテゴリー</CardTitle>
        <Button 
          onClick={() => {
            setEditingCategory(null);
            setShowForm(!showForm);
          }}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && !editingCategory && (
          <div className="mb-4">
            <CategoryForm 
              onSubmit={handleCreateCategory}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {editingCategory && (
          <div className="mb-4">
            <CategoryForm 
              initialValues={editingCategory}
              isEditing
              onSubmit={handleUpdateCategory}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        )}

        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              カテゴリーがありません
            </p>
          ) : (
            categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-2">
                  <span 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: category.color }} 
                  />
                  <span>{category.name}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingCategory(category)}
                    disabled={isDeleting}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
