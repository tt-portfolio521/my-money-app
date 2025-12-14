"use client";

import { useState, useEffect } from "react";

// 取引データの設計図（カテゴリーを追加）
interface Transaction {
  id: number;
  type: string;     // "入金" or "出金"
  category: string; // ★追加：食費、交通費など
  amount: number;
  date: string;
}

// ★追加：カテゴリーのリスト
const EXPENSE_CATEGORIES = ["食費", "日用品", "交通費", "交際費", "趣味", "家賃", "その他"];
const INCOME_CATEGORIES = ["給料", "副業", "お小遣い", "投資配当", "その他"];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState(0);

  // データの読み込み
  useEffect(() => {
    const savedData = localStorage.getItem("transactions");
    if (savedData) setTransactions(JSON.parse(savedData));
    const savedBudget = localStorage.getItem("budget");
    if (savedBudget) setBudget(parseInt(savedBudget));
  }, []);

  // データの保存
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("budget", budget.toString());
  }, [transactions, budget]);

  // ★変更：入力フォームの状態管理
  const [inputType, setInputType] = useState("出金"); // 今どっちを選んでいるか
  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("食費"); // 選ばれたカテゴリー

  // 入金/出金を切り替えたら、カテゴリーの初期値をリセットする処理
  useEffect(() => {
    if (inputType === "出金") {
      setSelectedCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setSelectedCategory(INCOME_CATEGORIES[0]);
    }
  }, [inputType]);

  // 追加ボタンを押したときの処理
  const handleAddTransaction = () => {
    if (amount === 0) return;

    const newTransaction: Transaction = {
      id: Date.now(),
      type: inputType,
      category: selectedCategory, // ★追加
      amount: amount,
      date: new Date().toLocaleDateString(),
    };

    setTransactions([...transactions, newTransaction]);
    setAmount(0);
  };

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

      <div className="w-full max-w-md space-y-6">
        
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
            <span>支出: ¥{totalExpense.toLocaleString()}</span>
            <span className={remaining < 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
              残り: ¥{remaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 貯金総額 */}
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-sm text-gray-500 mb-1">現在の貯金総額</p>
          <p className="text-4xl font-bold">¥{currentBalance.toLocaleString()}</p>
        </div>

        {/* ★変更：入力エリア */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {/* 1. 入金・出金の切り替えタブ */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputType("出金")}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                inputType === "出金" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              出金
            </button>
            <button
              onClick={() => setInputType("入金")}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                inputType === "入金" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              入金
            </button>
          </div>

          {/* 2. カテゴリー選択 */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 mb-1">カテゴリー</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50"
            >
              {/* 選んでいるタイプに合わせて選択肢を変える */}
              {inputType === "出金" 
                ? EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)
                : INCOME_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)
              }
            </select>
          </div>

          {/* 3. 金額入力 */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 mb-1">金額</label>
            <input
              type="number"
              placeholder="0"
              value={amount === 0 ? "" : amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="w-full p-3 border rounded-lg text-lg"
            />
          </div>

          {/* 4. 登録ボタン */}
          <button
            onClick={handleAddTransaction}
            className={`w-full py-3 rounded-lg font-bold text-white transition ${
              inputType === "出金" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            登録する
          </button>
        </div>

        {/* 履歴リスト */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold mb-4 text-gray-700">取引履歴</h2>
          <ul className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">履歴はまだありません</p>
            ) : (
              transactions.map((t) => (
                <li key={t.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${t.type === "入金" ? "text-blue-500" : "text-red-500"}`}>
                        {t.type}
                      </span>
                      {/* ★追加：カテゴリー表示 */}
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
                        {t.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{t.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      {t.type === "入金" ? "+" : "-"}¥{t.amount.toLocaleString()}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500">
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