"use client";

import { useState, useEffect } from "react";

// ★追加：データの「型（設計図）」を定義してあげる
interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
}

export default function Home() {
  // 家計簿のデータ（履歴）
  // ★修正：<Transaction[]> をつけて「これは取引データのリストだよ」と教える
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // 今月の予算（目標金額）
  const [budget, setBudget] = useState(0);

  // 画面が開かれたときにデータを読み込む
  useEffect(() => {
    const savedData = localStorage.getItem("transactions");
    if (savedData) {
      setTransactions(JSON.parse(savedData));
    }
    const savedBudget = localStorage.getItem("budget");
    if (savedBudget) {
      setBudget(parseInt(savedBudget));
    }
  }, []);

  // データが変わるたびに保存する
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("budget", budget.toString());
  }, [transactions, budget]);

  // 入力フォームの状態
  const [amount, setAmount] = useState(0);

  // 追加ボタンを押したときの処理
  // ★修正：typeが文字列であることを明記
  const handleAddTransaction = (type: string) => {
    if (amount === 0) return;

    const newTransaction: Transaction = {
      id: Date.now(),
      type: type,
      amount: amount,
      date: new Date().toLocaleDateString(),
    };

    setTransactions([...transactions, newTransaction]);
    setAmount(0);
  };

  // 削除機能
  const handleDelete = (id: number) => {
    const newTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(newTransactions);
  };

  // 計算ロジック
  const totalExpense = transactions
    .filter((t) => t.type === "出金")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = transactions.reduce((sum, t) => {
    return t.type === "入金" ? sum + t.amount : sum - t.amount;
  }, 0);

  const remaining = budget - totalExpense;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">収支管理アプリ</h1>

      <div className="w-full max-w-md space-y-4">
        
        {/* 予算設定エリア */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <label className="block text-sm font-bold mb-2 text-gray-600">今月の予算目標</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded text-right text-xl font-bold mb-2"
          />
          <div className="flex justify-between text-sm">
            <span>使った金額: ¥{totalExpense.toLocaleString()}</span>
            <span className={remaining < 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
              残り: ¥{remaining.toLocaleString()}
            </span>
          </div>
          {remaining < 0 && (
            <p className="text-red-500 text-xs mt-1 font-bold">⚠️ 予算オーバーです！</p>
          )}
        </div>

        {/* 現在の貯金箱 */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500 mb-1">現在の貯金総額</p>
          <p className="text-4xl font-bold">¥{currentBalance.toLocaleString()}</p>
        </div>

        {/* 入力エリア */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <input
            type="number"
            placeholder="金額を入力"
            value={amount === 0 ? "" : amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            className="w-full p-3 border rounded-lg mb-4 text-lg"
          />
          <div className="flex gap-4">
            <button
              onClick={() => handleAddTransaction("入金")}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition"
            >
              入金
            </button>
            <button
              onClick={() => handleAddTransaction("出金")}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition"
            >
              出金
            </button>
          </div>
        </div>

        {/* 履歴リスト */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold mb-4 text-gray-700">取引履歴</h2>
          <ul className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">履歴はまだありません</p>
            ) : (
              transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-bold ${
                        t.type === "入金" ? "text-blue-500" : "text-red-500"
                      }`}
                    >
                      {t.type}
                    </span>
                    <span className="text-xs text-gray-400">{t.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      {t.type === "入金" ? "+" : "-"}¥{t.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}