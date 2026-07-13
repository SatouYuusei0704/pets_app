import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

//いつも選んでいるフードを保存
//settings コレクションの中の "current" という名前の1件だけを常に使い回す
const SETTINGS_DOC = doc(db, 'settings', 'current');

//現在選択中のフードIDを取得するAPI
export async function GET() {
    try {
        const snapshot = await getDoc(SETTINGS_DOC);

        //一度もフードを選んでいない場合は、ドキュメントなし
        if (!snapshot.exists()) {
            return NextResponse.json({ selectedFoodId: null });
        } 
        return NextResponse.json({ selectedFoodId: snapshot.data().selectedFoodId ?? null  });
    } catch (error) {
        console.error('設定取得エラー:', error);
        return NextResponse.json({ error: '設定取得に失敗しました' }, { status: 500 });
    }
}

//選択中のフードID保存を切り替えするAPI
export async function PUT(request: NextRequest) {
    const { selectedFoodId } = await request.json();

    try {
        //merge: true にすることで、他にフィールドが増えても上書きで消さずに済む
        await setDoc(SETTINGS_DOC, { selectedFoodId }, { merge: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('設定更新エラー:', error);
        return NextResponse.json({ error: '設定の更新に失敗しました' }, { status: 500 });
    }
}