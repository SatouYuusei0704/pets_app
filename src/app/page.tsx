'use client';

import { useState, useEffect } from 'react';
import styles from './styles/page.module.css';
import { DogFood } from './types/food';

export default function Home() {
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<string>('standby'); // standby, saving, success, error
  const [mounted, setMounted] = useState<boolean>(false);
  
  //登録済みのフード一覧、firestoreから取得
  const [foods, setFoods] = useState<DogFood[]>([]);
  //現在選択中のフード一覧
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  //フード登録・編集フォーム用のstate
  const [formName, setFormName] = useState<string>('');
  const [formCalories, setFormCalories] = useState<number>(0);
  // nullなら「新規登録モード」、idが入っていれば「そのフードを編集中」という意味で使う
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  // 画面がブラウザで完全に読み込まれるまで待つ安全装置
  useEffect(() => {
    setMounted(true);
  }, []);
  //画面の準備ができたら、フード一覧と現在の選択状態をサーバーから読み込む
  useEffect(() => {
    if (!mounted) return;

    const loadFoodsAndSettings = async () => {
      try {
        // 一覧取得と選択状態の取得を同時に走らせる（お互い依存しないため）
        const [foodsRes, settingsRes] = await Promise.all([
          fetch('/api/foods'),
          fetch('/api/settings'),
        ]);
        const foodsData: DogFood[] = await foodsRes.json();
        const settingsData: { selectedFoodId: string | null } = await settingsRes.json();

        setFoods(foodsData);
        setSelectedFoodId(settingsData.selectedFoodId);
      } catch (error) {
        console.error('初期データ取得エラー:', error);
      }
    };

    loadFoodsAndSettings();
  }, [mounted]);

  // foods配列とselectedFoodIdから「今使うフード」を導出する
  // （別途stateで持たず、常にfoodsの最新内容から探すことでズレを防ぐ）
  const selectedFood = foods.find((food) => food.id === selectedFoodId) ?? null;

  const calculateCalories = (grams: number, kCalPer100g: number): number => {
    if (grams <= 0) return 0;
    return Math.round((grams / 100) * kCalPer100g);
  };

  const totalCalories = calculateCalories(amount, selectedFood?.caloriesPer100g ?? 0);

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

  //フードを切り替える：selectedFoodIdをローカルで更新しつつ、サーバー側の設定も更新する
  const handleSelectFood = async (foodId: string | null) => {
    setSelectedFoodId(foodId);//先に画面を更新
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedFoodId: foodId }),
      });
    } catch (error) {
      console.error('フード選択更新エラー:', error);
    }
  };
  //フォームの「編集」ボタンを押したときの処理：フォームに既存の値を詰める
  const handleStartEdit = (food: DogFood) => {
    setFormName(food.name);
    setFormCalories(food.caloriesPer100g);
    setEditingFoodId(food.id);
  };
  
  //フォームの入力をリセットする（新規登録モードに戻す）
  const resetForm = () => {
    setFormName('');
    setFormCalories(0);
    setEditingFoodId(null);
  };

  //フォームの「保存」ボタン：editingFoodIdの有無で新規登録／更新を切り替える
  const handleFormSubmit = async () => {
    if (formName.trim() === '' || formCalories <= 0) {
      alert('名前とカロリーを正しく入力してください');
      return;
    }

    try {
      if (editingFoodId) {
        // 編集モード：PUTで更新し、foods配列の該当要素だけ差し替える
        await fetch(`/api/foods/${editingFoodId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, caloriesPer100g: formCalories }),
        });
        setFoods((prev) =>
          prev.map((food) =>
            food.id === editingFoodId
              ? { ...food, name: formName, caloriesPer100g: formCalories }
              : food
          )
        );
      } else {
        // 新規登録モード：POSTで作成し、返ってきたデータをfoods配列に追加する
        const res = await fetch('/api/foods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, caloriesPer100g: formCalories }),
        });
        const created: DogFood = await res.json();
        setFoods((prev) => [...prev, created]);

        // 初めて登録したフードなら、自動的にそれを選択状態にする
        if (!selectedFoodId) {
          handleSelectFood(created.id);
        }
      }
      resetForm();
    } catch (error) {
      console.error('フード保存エラー:', error);
    }
  };

  // フードを削除する。選択中のものを消した場合は、残りの先頭を新たな選択にする（無ければnull）
  const handleDeleteFood = async (foodId: string) => {
    try {
      await fetch(`/api/foods/${foodId}`, { method: 'DELETE' });

      const remaining = foods.filter((food) => food.id !== foodId);
      setFoods(remaining);

      if (selectedFoodId === foodId) {
        const fallbackId = remaining[0]?.id ?? null;
        setSelectedFoodId(fallbackId);
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedFoodId: fallbackId }),
        });
      }
    } catch (error) {
      console.error('フード削除エラー:', error);
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
          {foods.length === 0 ?(
            // フードが1件も登録されていない場合
            <p className={styles.foodName}>まだフードが登録されていません</p>
          ) : (
            <>
            {/* 登録済みフードを切り替えるドロップダウン */}
              <select
                value={selectedFoodId ?? ''}
                onChange={(e) => handleSelectFood(e.target.value)}
              >
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}（{food.caloriesPer100g} kcal / 100g）
                  </option>
                ))}
              </select>

              {/* 登録済みフードの一覧＋編集・削除ボタン */}
              <ul>
                {foods.map((food) => (
                  <li key={food.id}>
                    {food.name}（{food.caloriesPer100g} kcal / 100g）
                    <button type="button" onClick={() => handleStartEdit(food)}>編集</button>
                    <button type="button" onClick={() => handleDeleteFood(food.id)}>削除</button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* フード登録・編集フォーム */}
          <div>
            <input
              type="text"
              placeholder="フード名"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <input
              type="number"
              placeholder="カロリー(kcal/100g)"
              value={formCalories || ''}
              onChange={(e) => setFormCalories(Number(e.target.value))}
            />
            <button type="button" onClick={handleFormSubmit}>
              {editingFoodId ? '更新する' : '追加する'}
            </button>
            {editingFoodId && (
              <button type="button" onClick={resetForm}>編集をキャンセル</button>
            )}
          </div>
        </div>
          <p className={styles.foodName}>
            {selectedFood?.name}{' '}
            <span className={styles.foodCalories}>
              ({selectedFood?.caloriesPer100g} kcal / 100g)
            </span>
          </p>

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
