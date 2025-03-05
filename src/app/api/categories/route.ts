import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

// 全カテゴリーの取得
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to get categories:', error);
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 });
  }
}

// カテゴリーの作成
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const category = await prisma.category.create({
      data,
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
