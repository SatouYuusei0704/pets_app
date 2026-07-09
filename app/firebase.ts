import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 提示していただいた Firebase の接続設定
const firebaseConfig = {
  apiKey: "AIzaSyAyRuRzEsWi52AyMcGTY82PszYAOUrxHgQ",
  authDomain: "pets-app-1ddc4.firebaseapp.com",
  projectId: "pets-app-1ddc4",
  storageBucket: "pets-app-1ddc4.firebasestorage.app",
  messagingSenderId: "109591846396",
  appId: "1:109591846396:web:0c69ed767629a52cf42679"
};

// Next.jsのサーバーサイドで何度も初期化が走るのを防ぐ安全な書き方
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 他のファイルからデータベース（db）を使えるようにエクスポートする
export const db = getFirestore(app);
