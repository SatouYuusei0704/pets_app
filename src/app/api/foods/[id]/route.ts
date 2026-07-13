//フォルダ名を `[id]` にすることで `/api/foods/abc123` のようなURLの `abc123` 部分を受け取れる（Next.jsの規約）
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

type RouteContext = { params:Promise<{ id: string }> };

//ドッグフードの情報を更新するAPI
export async function PATCH(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;//URLの `/api/foods/abc123` の `abc123` 部分がここに入る
    const { name, caloriesPer100g } = await request.json();

    if(typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: '名前を正しく入力してください' }, { status: 400 });
    }
    if(typeof caloriesPer100g !== 'number' || caloriesPer100g <= 0) {
        return NextResponse.json({ error: 'カロリーを正しく入力してください' }, { status: 400 });
    }

    try{
        await updateDoc(doc(db, 'foods', id), { name, caloriesPer100g });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('フード更新エラー:', error);
        return NextResponse.json({ error: 'フード更新に失敗しました' }, { status: 500 });
    }
}

//ドッグフードの情報を削除するAPI
export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    try{
        await deleteDoc(doc(db, 'foods', id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('フード削除エラー:', error);
        return NextResponse.json({ error: 'フード削除に失敗しました' }, { status: 500 });
    }
}