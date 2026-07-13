import { NextResponse,NextRequest } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, getDocs, query,orderBy} from 'firebase/firestore';
import type { DogFood } from '@/app/types/food';

//登録済みのドッグフード一覧を取得するAPI
export async function GET() {
  try {
    //登録した順にする
    const foodsCollection = collection(db, 'foods');
    const q = query(foodsCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);

    //Firestoreのドキュメント(id+data)を画面で使う形に変換
    const foods: DogFood[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      caloriesPer100g: doc.data().caloriesPer100g,
    }));

    return NextResponse.json(foods);
    } catch (error) {
        console.error('フード取得エラー:', error);
        return NextResponse.json({ error: 'フード取得に失敗しました' }, { status: 500 });
    }
}

//新しいドッグフードを登録するAPI
export async function POST(request: NextRequest) {
    const { name, caloriesPer100g } = await request.json();

    //入力チェック：名前が空、カロリーが0以下の場合は弾く
    if(typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: '名前を正しく入力してください' }, { status: 400 });
    }
    if(typeof caloriesPer100g !== 'number' || caloriesPer100g <= 0) {
        return NextResponse.json({ error: 'カロリーを正しく入力してください' }, { status: 400 });
    }

    try {
        //foods（コレクション）にデータを追加
        const docRef = await addDoc(collection(db, 'foods'), {
            name,
            caloriesPer100g,
            createdAt: new Date(),
        });

        //作成したフードをそのまま画面に返す
        const created: DogFood = {id: docRef.id, name, caloriesPer100g};
        return NextResponse.json(created);
    } catch (error) {
        console.error('フード登録エラー:', error);
        return NextResponse.json({ error: 'フード登録に失敗しました' }, { status: 500 });
    }
}