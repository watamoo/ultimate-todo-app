"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, CategoryFormValues } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface CategoryFormProps {
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  initialValues?: Category;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function CategoryForm({ 
  onSubmit, 
  initialValues, 
  isEditing = false,
  onCancel 
}: CategoryFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: CategoryFormValues = {
    name: '',
    color: '#6366F1', // Default indigo color
  };

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<CategoryFormValues>({
    defaultValues: initialValues ? {
      name: initialValues.name,
      color: initialValues.color,
    } : defaultValues,
  });

  const handleFormSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      if (!isEditing) {
        reset(defaultValues);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      toast({
        title: 'エラー',
        description: isEditing ? 'カテゴリーの更新に失敗しました' : 'カテゴリーの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'カテゴリーを編集' : '新しいカテゴリー'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名前</label>
            <Input
              {...register('name', { required: 'カテゴリー名は必須です' })}
              placeholder="カテゴリー名"
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">色</label>
            <div className="flex items-center space-x-2">
              <Input
                {...register('color', { required: '色は必須です' })}
                type="color"
                className="w-12 h-10 p-1"
              />
              <Input
                {...register('color')}
                placeholder="カラーコード"
                className="flex-1"
              />
            </div>
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '処理中...' : isEditing ? '更新' : '作成'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
