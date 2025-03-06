"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TodoItemComponent } from './todo-item';
import { TodoForm } from './todo-form';
import { CategoryList } from './category-list';
import { Category, Priority, TodoFormValues, TodoItem } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { fetchCategories, fetchTodos, createTodo, updateTodo, updateTodoPositions } from '@/lib/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';

export function TodoContainer() {
  const { toast } = useToast();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null);
  const [filterCompleted, setFilterCompleted] = useState<string>('all');

  // Fetch todos and categories
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [todosData, categoriesData] = await Promise.all([
        fetchTodos(),
        fetchCategories()
      ]);
      setTodos(todosData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'エラー',
        description: 'データの取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...todos];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(lowerSearch) || 
        (todo.description && todo.description.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(todo => todo.categoryId === filterCategory);
    }
    
    // Apply priority filter
    if (filterPriority) {
      filtered = filtered.filter(todo => todo.priority === filterPriority);
    }
    
    // Apply completed filter
    if (filterCompleted === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (filterCompleted === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    }
    
    setFilteredTodos(filtered);
  }, [todos, searchTerm, filterCategory, filterPriority, filterCompleted]);

  // Handlers
  const handleCreateTodo = async (data: TodoFormValues) => {
    const newTodo = await createTodo(data);
    setTodos(prev => [...prev, newTodo]);
    setShowForm(false);
    toast({
      title: 'タスクを作成しました',
      description: `「${data.title}」を作成しました`,
    });
  };

  const handleUpdateTodo = async (data: TodoFormValues) => {
    if (!editingTodo) return;
    const updatedTodo = await updateTodo(editingTodo.id, data);
    setTodos(prev => prev.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo));
    setEditingTodo(null);
    toast({
      title: 'タスクを更新しました',
      description: `「${data.title}」を更新しました`,
    });
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleTodoStatusChange = (id: string, completed: boolean) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed } : todo
    ));
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside the list or no movement
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Reorder the todos
    const items = Array.from(filteredTodos);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    // Update the positions
    const updates = items.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    // Update UI immediately
    setFilteredTodos(items);

    // Update all todos with new positions
    const updatedTodoIds = new Set(items.map(item => item.id));
    setTodos(prev => {
      const unaffectedTodos = prev.filter(todo => !updatedTodoIds.has(todo.id));
      return [...unaffectedTodos, ...items].sort((a, b) => a.position - b.position);
    });

    // Save to backend
    try {
      await updateTodoPositions(updates);
    } catch (error) {
      console.error('Failed to update positions:', error);
      toast({
        title: 'エラー',
        description: 'タスクの並び替えに失敗しました',
        variant: 'destructive',
      });
      // Revert to original order on error
      fetchData();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory(null);
    setFilterPriority(null);
    setFilterCompleted('all');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">タスク</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setEditingTodo(null);
                  setShowForm(!showForm);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 space-y-3">
                <div className="flex items-center relative">
                  <Search className="absolute left-2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="タスクを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Select 
                      value={filterCategory || ''} 
                      onValueChange={(value) => setFilterCategory(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリー: 全て" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">カテゴリー: 全て</SelectItem>
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
                  
                  <div>
                    <Select 
                      value={filterPriority || ''} 
                      onValueChange={(value) => setFilterPriority(value as Priority || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="優先度: 全て" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">優先度: 全て</SelectItem>
                        <SelectItem value="LOW">低</SelectItem>
                        <SelectItem value="MEDIUM">中</SelectItem>
                        <SelectItem value="HIGH">高</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select 
                      value={filterCompleted} 
                      onValueChange={setFilterCompleted}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ステータス: 全て" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ステータス: 全て</SelectItem>
                        <SelectItem value="active">未完了</SelectItem>
                        <SelectItem value="completed">完了済み</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                  >
                    フィルターをリセット
                  </Button>
                </div>
              </div>
            )}
            
            {showForm && !editingTodo && (
              <div className="mb-4">
                <TodoForm 
                  categories={categories}
                  onSubmit={handleCreateTodo}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {editingTodo && (
              <div className="mb-4">
                <TodoForm 
                  categories={categories}
                  initialValues={editingTodo}
                  isEditing
                  onSubmit={handleUpdateTodo}
                  onCancel={() => setEditingTodo(null)}
                />
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">タスクがありません</p>
                {(searchTerm || filterCategory || filterPriority || filterCompleted !== 'all') && (
                  <Button 
                    variant="link" 
                    onClick={resetFilters}
                    className="mt-2"
                  >
                    フィルターをリセット
                  </Button>
                )}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="todos">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {filteredTodos.map((todo, index) => (
                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoItemComponent
                                todo={todo}
                                onEdit={setEditingTodo}
                                onDelete={handleDeleteTodo}
                                onStatusChange={handleTodoStatusChange}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <CategoryList categories={categories} onCategoryChange={fetchData} />
      </div>
    </div>
  );
}
