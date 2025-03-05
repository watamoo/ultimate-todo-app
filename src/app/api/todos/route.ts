import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

// 全Todoの取得
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { position: 'asc' },
      include: { category: true },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to get todos:', error);
    return NextResponse.json({ error: 'Failed to get todos' }, { status: 500 });
  }
}

// Todoの作成
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 現在の最大positionを取得
    const highestPositionTodo = await prisma.todo.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    
    const newPosition = highestPositionTodo ? highestPositionTodo.position + 1 : 0;
    
    // 新しいTodoを作成
    const todo = await prisma.todo.create({
      data: {
        ...data,
        position: newPosition,
      },
      include: { category: true },
    });
    
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

// 複数Todoの更新（並び替え用）
export async function PATCH(request: NextRequest) {
  try {
    const { updates } = await request.json();
    
    // トランザクションで複数の更新を実行
    const result = await prisma.$transaction(
      updates.map((update: { id: string; position: number }) =>
        prisma.todo.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update todo positions:', error);
    return NextResponse.json({ error: 'Failed to update todo positions' }, { status: 500 });
  }
}
