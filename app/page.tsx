"use client";

import { useState, useEffect } from "react";
// グラフ用の部品
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
// ★追加：アイコン用の部品（ヒーローアイコン）
import { TrashIcon, CurrencyYenIcon, ChartPieIcon, BanknotesIcon } from "@heroicons/react/24/outline";

// データ型の定義
interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  date: string;
}

const EXPENSE_CATEGORIES = ["食費", "日用品", "交通費", "交際費", "趣味", "家賃", "その他"];
const INCOME_CATEGORIES = ["給料", "副業", "お小遣い", "投資配当", "その他"];

// ★変更：グラフの色を少し落ち着いたモダンなパレットに変更
const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6", "#6B7280"];

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

  const [inputType, setInputType] = useState("出金");
  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("食費");

  // カテゴリー初期値のリセット
  useEffect(() => {
    if (inputType === "出金") {
      setSelectedCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setSelectedCategory(INCOME_CATEGORIES[0]);
    }
  }, [inputType]);

  // 追加処理
  const handleAddTransaction = () => {
    if (amount === 0) return;
    const newTransaction: Transaction = {
      id: Date.now(),
      type: inputType,
      category: selectedCategory,
      amount: amount,
      date: new Date().toLocaleDateString(),
    };
    setTransactions([...transactions, newTransaction]);
    setAmount(0);
  };

  // 削除処理
  const handleDelete = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // 計算ロジック
  const totalExpense = transactions
    .filter((t) => t.type === "出金")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = transactions.reduce((sum, t) => {
    return t.type === "入金" ? sum + t.amount : sum - t.amount;
  }, 0);

  const remaining = budget - totalExpense;

  // グラフ用データ作成
  const graphData = EXPENSE_CATEGORIES.map((category) => {
    const value = transactions
      .filter((t) => t.type === "出金" && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: category, value: value };
  }).filter((d) => d.value > 0);

  return (
    // ★変更：背景色を少し青みがかった洗練されたグレーに
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-slate-100 text-slate-800 font-sans">
      
      {/* ★変更：ヘッダーをグラデーションテキストにしてリッチに */}
      <header className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          My Asset Manager
        </h1>
        <p className="text-slate-500 text-sm mt-2">スマートな収支管理アシスタント</p>
      </header>

      <div className="w-full max-w-md space-y-6">
        
        {/* 予算エリア */}
        {/* ★変更：影を大きく柔らかく(shadow-xl)、角丸を大きく(rounded-2xl)、ボーダーをグラデーションに */}
        <div className="bg-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-400 to-purple-500"></div>
          <div className="pl-4">
            <label className="block text-sm font-bold mb-2 text-indigo-700 flex items-center gap-2">
              <CurrencyYenIcon className="h-5 w-5" />
              今月の予算目標
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-right text-2xl font-bold mb-4 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
            <div className="flex justify-between text-sm items-center bg-slate-50 p-3 rounded-lg">
              <div className="flex flex-col">
                 <span className="text-slate-500 text-xs">支出合計</span>
                 <span className="font-bold text-slate-700">¥{totalExpense.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-xs">残り予算</span>
                <span className={`font-bold text-lg ${remaining < 0 ? "text-rose-500" : "text-emerald-600"}`}>
                  ¥{remaining.toLocaleString()}
                </span>
              </div>
            </div>
            {remaining < 0 && (
              <p className="text-rose-500 text-xs mt-2 font-bold text-center bg-rose-50 py-1 rounded">⚠️ 予算オーバーです！</p>
            )}
          </div>
        </div>

        {/* 円グラフ表示エリア */}
        {totalExpense > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <h2 className="font-bold mb-4 text-slate-700 flex items-center gap-2">
              <ChartPieIcon className="h-6 w-6 text-indigo-500" />
              支出の割合
            </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graphData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // ★変更：ドーナツ型にしてモダンに
                    outerRadius={80}
                    paddingAngle={5} // ★変更：隙間をあけておしゃれに
                    label
                  >
                    {graphData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 貯金総額 */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-xl text-center text-white">
          <p className="text-sm opacity-80 mb-1 flex justify-center items-center gap-2">
            <BanknotesIcon className="h-5 w-5" />
            現在の貯金総額
          </p>
          <p className="text-5xl font-extrabold mt-2">¥{currentBalance.toLocaleString()}</p>
        </div>

        {/* 入力エリア */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setInputType("出金")}
              className={`flex-1 py-2 rounded-lg font-bold transition-all duration-200 ${
                inputType === "出金" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
              }`}
            >
              出金
            </button>
            <button
              onClick={() => setInputType("入金")}
              className={`flex-1 py-2 rounded-lg font-bold transition-all duration-200 ${
                inputType === "入金" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
              }`}
            >
              入金
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">カテゴリー</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            >
              {inputType === "出金" 
                ? EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)
                : INCOME_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)
              }
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 mb-1">金額</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">¥</span>
              <input
                type="number"
                placeholder="0"
                value={amount === 0 ? "" : amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full p-3 pl-8 border border-slate-200 rounded-xl text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <button
            onClick={handleAddTransaction}
            className={`w-full py-4 rounded-xl font-bold text-white transition transform active:scale-95 shadow-lg ${
              inputType === "出金" 
                ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700" 
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            }`}
          >
            登録する
          </button>
        </div>

        {/* 履歴リスト */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="font-bold mb-4 text-slate-700">取引履歴</h2>
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {transactions.length === 0 ? (
              <p className="text-slate-400 text-center text-sm py-4">履歴はまだありません</p>
            ) : (
              transactions.map((t) => (
                <li key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 transition hover:shadow-md">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${t.type === "入金" ? "text-indigo-500" : "text-rose-500"}`}>
                        {t.type}
                      </span>
                      <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-600">
                        {t.category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1">{t.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg ${t.type === "入金" ? "text-indigo-700" : "text-rose-700"}`}>
                      {t.type === "入金" ? "+" : "-"}¥{t.amount.toLocaleString()}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-rose-500 bg-white p-2 rounded-full shadow-sm transition">
                      <TrashIcon className="h-5 w-5" />
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