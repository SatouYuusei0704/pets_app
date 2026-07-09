'use client';

import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, addDoc } from 'firebase/firestore'; 

interface DogFood {
  id: string;
  name: string;
  caloriesPer100g: number;
}

export default function Home() {
  const sampleFood: DogFood = {
    id: 'food_01',
    name: 'チキン風味カリカリ（成犬用）',
    caloriesPer100g: 350,
  };

  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<string>('standby'); // standby, saving, success, error
  const [mounted, setMounted] = useState<boolean>(false);

  // 画面がブラウザで完全に読み込まれるまで待つ安全装置
  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateCalories = (grams: number, kCalPer100g: number): number => {
    if (grams <= 0) return 0;
    return Math.round((grams / 100) * kCalPer100g);
  };

  const totalCalories = calculateCalories(amount, sampleFood.caloriesPer100g);

  // Firebaseにデータを保存する関数
  const handleSave = async () => {
    if (amount <= 0) {
      alert('与えた量を入力してください');
      return;
    }
    
    setStatus('saving');

    try {
      // meals という本棚（コレクション）にデータを追加する
      await addDoc(collection(db, 'meals'), {
        date: new Date().toISOString().split('T')[0], // 今日（YYYY-MM-DD）
        amountGrams: amount,
        totalCalories: totalCalories,
        createdAt: new Date()
      });
      setStatus('success');
      // 3秒後にステータスを待機状態に戻す
      setTimeout(() => setStatus('standby'), 3000);
    } catch (error) {
      console.error('Firebase保存エラー:', error);
      setStatus('error');
    }
  };

  // 準備ができる前は待機中であることを明示
  if (!mounted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
        アプリを起動中...
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '16px', padding: '24px', boxSizing: 'border-box' }}>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', margin: '0 0 24px 0' }}>
          🐾 ごはんのカロリー計算
        </h2>
        
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#9a3412', margin: '0 0 4px 0' }}>現在のフード</p>
          <p style={{ color: '#374151', margin: 0, fontWeight: '500' }}>
            {sampleFood.name} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>({sampleFood.caloriesPer100g} kcal / 100g)</span>
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
            与えた量 (g) を入力してください
          </label>
          <input 
            type="number" 
            placeholder="例: 50"
            value={amount || ''} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            style={{ width: '100%', padding: '12px 16px', fontSize: '18px', border: '1px solid #d1d5db', borderRadius: '12px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #dbeafe', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', letterSpacing: '0.05em' }}>計算された総カロリー</span>
          <h3 style={{ fontSize: '36px', fontWeight: '900', color: '#1d4ed8', margin: '4px 0 0 0' }}>
            {totalCalories} <span style={{ fontSize: '20px', fontWeight: 'bold' }}>kcal</span>
          </h3>
        </div>

        <button 
          onClick={handleSave}
          disabled={status === 'saving'}
          style={{ width: '100%', backgroundColor: status === 'saving' ? '#9ca3af' : (status === 'success' ? '#10b981' : '#f97316'), color: '#ffffff', fontWeight: 'bold', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '16px', cursor: status === 'saving' ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
        >
          {status === 'standby' && 'この内容で記録する'}
          {status === 'saving' && '保存中... ⏳'}
          {status === 'success' && '保存完了！ ✅'}
          {status === 'error' && '保存失敗 ❌ 再試行'}
        </button>

      </div>
    </main>
  );
}
