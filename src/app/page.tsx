'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

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

  // バックエンドのAPI（/api/meals）に保存を依頼する
  const handleSave = async () => {
    if (amount <= 0) {
      alert('与えた量を入力してください');
      return;
    }

    setStatus('saving');

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountGrams: amount, totalCalories }),
      });

      if (!res.ok) {
        throw new Error('保存に失敗しました');
      }

      setStatus('success');
      // 3秒後にステータスを待機状態に戻す
      setTimeout(() => setStatus('standby'), 3000);
    } catch (error) {
      console.error('保存エラー:', error);
      setStatus('error');
    }
  };

  // 準備ができる前は待機中であることを明示
  if (!mounted) {
    return <div className={styles.loadingScreen}>アプリを起動中...</div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h2 className={styles.title}>🐾 ごはんのカロリー計算</h2>

        <div className={styles.foodBox}>
          <p className={styles.foodLabel}>現在のフード</p>
          <p className={styles.foodName}>
            {sampleFood.name}{' '}
            <span className={styles.foodCalories}>
              ({sampleFood.caloriesPer100g} kcal / 100g)
            </span>
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>与えた量 (g) を入力してください</label>
          <input
            type="number"
            placeholder="例: 50"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={styles.input}
          />
        </div>

        <div className={styles.calorieBox}>
          <span className={styles.calorieLabel}>計算された総カロリー</span>
          <h3 className={styles.calorieValue}>
            {totalCalories} <span className={styles.calorieUnit}>kcal</span>
          </h3>
        </div>

        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className={`${styles.saveButton} ${status === 'saving' ? styles.saving : ''} ${status === 'success' ? styles.success : ''}`}
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
