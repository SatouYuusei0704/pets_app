'use client'; // Next.jsでボタンクリックなどの「動き」を出すために必須の1行です

import React, { useState } from 'react';

// 1. TypeScriptの型定義
interface DogFood {
  id: string;
  name: string;
  caloriesPer100g: number;
}

export default function Home() {
  // 2. サンプルのフードデータ
  const sampleFood: DogFood = {
    id: 'food_01',
    name: 'チキン風味カリカリ（成犬用）',
    caloriesPer100g: 350,
  };

  // 3. 与えた量（g）の状態管理
  const [amount, setAmount] = useState<number>(0);

  // 4. カロリー計算ロジック
  const calculateCalories = (grams: number, kCalPer100g: number): number => {
    if (grams <= 0) return 0;
    return Math.round((grams / 100) * kCalPer100g);
  };

  const totalCalories = calculateCalories(amount, sampleFood.caloriesPer100g);

  // 5. Tailwind CSS を使ったスタイリッシュな画面デザイン
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        
        {/* ヘッダー */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
          🐾 ごはんのカロリー計算
        </h2>
        
        {/* フード情報表示ボックス */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-orange-800 mb-1">現在のフード</p>
          <p className="text-gray-700 font-medium">
            {sampleFood.name} 
            <span className="text-sm text-gray-500 font-normal ml-2">({sampleFood.caloriesPer100g} kcal / 100g)</span>
          </p>
        </div>

        {/* 入力フォーム */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            与えた量 (g) を入力してください
          </label>
          <input 
            type="number" 
            placeholder="例: 50"
            value={amount || ''} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* 計算結果表示ボックス */}
        <div className="bg-blue-50 rounded-xl p-5 text-center mb-6 border border-blue-100">
          <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">計算された総カロリー</span>
          <h3 className="text-4xl font-black text-blue-700 mt-1">
            {totalCalories} <span className="text-xl font-bold">kcal</span>
          </h3>
        </div>

        {/* Firebase保存用ボタン */}
        <button 
          onClick={() => alert(`【保存準備OK】\n量: ${amount}g\nカロリー: ${totalCalories}kcal\nこの内容をFirebaseに保存する設定へ進みましょう！`)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          この内容で記録する
        </button>

      </div>
    </main>
  );
}
