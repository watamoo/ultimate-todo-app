"use client";

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Priority, TodoItem } from '@/types';
import { CalendarClock, Edit, Trash2, AlertCircle, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { deleteTodo, updateTodo } from '@/lib/utils/api';

type PriorityColors = {
  [key in Priority]: string;
};

const priorityColors: PriorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

interface TodoItemProps {
  todo: TodoItem;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, completed: boolean) => void;
}

export function TodoItemComponent({ todo, onEdit, onDelete, onStatusChange }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTodo(todo.id);
      onDelete(todo.id);
      toast({
        title: 'タスクを削除しました',
        description: `「${todo.title}」を削除しました`,
      });
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast({
        title: 'エラー',
        description: 'タスクの削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (checked: boolean) => {
    try {
      await updateTodo(todo.id, { completed: checked });
      onStatusChange(todo.id, checked);
    } catch (error) {
      console.error('Failed to update todo status:', error);
      toast({
        title: 'エラー',
        description: 'タスクのステータス更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={`mb-3 overflow-hidden ${todo.completed ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={todo.completed} 
            onCheckedChange={handleStatusChange}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </h3>
              <div className="flex space-x-1">
                {todo.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[todo.priority]}`}>
                    {todo.priority === 'HIGH' && <ArrowUp className="h-3 w-3 inline mr-1" />}
                    {todo.priority}
                  </span>
                )}
              </div>
            </div>
            
            {todo.description && (
              <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                {todo.description}
              </p>
            )}
            
            <div className="flex flex-wrap mt-3 gap-2 text-xs text-gray-500">
              {todo.dueDate && (
                <div className="flex items-center">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  {format(new Date(todo.dueDate), 'yyyy/MM/dd')}
                </div>
              )}
              
              {todo.category && (
                <div 
                  className="flex items-center px-2 py-1 rounded-full" 
                  style={{ backgroundColor: `${todo.category.color}25` }}
                >
                  <span 
                    className="h-2 w-2 rounded-full mr-1" 
                    style={{ backgroundColor: todo.category.color }}
                  />
                  {todo.category.name}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-2 space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(todo)}
            disabled={isDeleting}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
