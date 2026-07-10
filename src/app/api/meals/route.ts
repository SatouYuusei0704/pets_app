import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// ごはんの記録をFirestoreに保存するAPI
export async function POST(request: NextRequest) {
  const { amountGrams, totalCalories } = await request.json();

  if (typeof amountGrams !== 'number' || amountGrams <= 0) {
    return NextResponse.json({ error: '与えた量を正しく入力してください' }, { status: 400 });
  }

  try {
    // meals という本棚（コレクション）にデータを追加する
    await addDoc(collection(db, 'meals'), {
      date: new Date().toISOString().split('T')[0], // 今日（YYYY-MM-DD）
      amountGrams,
      totalCalories,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firebase保存エラー:', error);
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
  }
}
