import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

// 特定のカテゴリーの取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { todos: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to get category:', error);
    return NextResponse.json({ error: 'Failed to get category' }, { status: 500 });
  }
}

// 特定のカテゴリーの更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const category = await prisma.category.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// 特定のカテゴリーの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // このカテゴリーに属するTodoをすべて取得
    const todos = await prisma.todo.findMany({
      where: { categoryId: params.id },
      select: { id: true },
    });

    // トランザクションで実行
    await prisma.$transaction([
      // このカテゴリーに属するTodoのカテゴリーIDをnullにする
      prisma.todo.updateMany({
        where: { categoryId: params.id },
        data: { categoryId: null },
      }),
      // カテゴリーを削除
      prisma.category.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
