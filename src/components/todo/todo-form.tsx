"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Priority, TodoFormValues, TodoItem } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface TodoFormProps {
  categories: Category[];
  onSubmit: (values: TodoFormValues) => Promise<void>;
  initialValues?: TodoItem;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function TodoForm({ 
  categories, 
  onSubmit, 
  initialValues, 
  isEditing = false,
  onCancel 
}: TodoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: TodoFormValues = {
    title: '',
    description: '',
    dueDate: null,
    priority: 'MEDIUM',
    categoryId: null,
  };

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<TodoFormValues>({
    defaultValues: initialValues ? {
      title: initialValues.title,
      description: initialValues.description || '',
      dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : null,
      priority: initialValues.priority,
      categoryId: initialValues.categoryId,
    } : defaultValues,
  });

  const dueDate = watch('dueDate');
  const priority = watch('priority');
  const categoryId = watch('categoryId');

  const handleFormSubmit = async (data: TodoFormValues) => {
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
        description: isEditing ? 'タスクの更新に失敗しました' : 'タスクの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'タスクを編集' : '新しいタスク'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              {...register('title', { required: 'タイトルは必須です' })}
              placeholder="タスクのタイトル"
              className="w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              {...register('description')}
              placeholder="説明（オプション）"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">期日</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'yyyy/MM/dd') : <span>選択...</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate || undefined}
                    onSelect={(date) => setValue('dueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 h-auto p-0 text-xs text-muted-foreground"
                  onClick={() => setValue('dueDate', null)}
                >
                  クリア
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">優先度</label>
              <Select 
                value={priority} 
                onValueChange={(value: Priority) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="優先度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">低</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリー</label>
              <Select 
                value={categoryId || 'none'} 
                onValueChange={(value) => setValue('categoryId', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <span 
                          className="h-2 w-2 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }} 
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
