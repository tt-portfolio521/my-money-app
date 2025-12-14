"use client";

import { useState, useEffect } from "react";

type Transaction = {
  id: number;
  date: string;
  amount: number;
  type: "入金" | "出金";
};

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 1. アプリを開いた瞬間に、保存されたデータを読み込む
  useEffect(() => {
    const savedBalance = localStorage.getItem("balance");
    const savedTransactions = localStorage.getItem("transactions");

    if (savedBalance) setBalance(Number(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  // 2. 所持金や履歴が変わるたびに、自動で保存する
  useEffect(() => {
    localStorage.setItem("balance", balance.toString());
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [balance, transactions]);

  const handleDeposit = () => {
    if (amount <= 0) return;
    setBalance(balance + amount);
    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      amount: amount,
      type: "入金",
    };
    setTransactions([newTransaction, ...transactions]);
    setAmount(0);
  };

  const handleWithdraw = () => {
    if (amount <= 0) return;
    setBalance(balance - amount);
    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      amount: amount,
      type: "出金",
    };
    setTransactions([newTransaction, ...transactions]);
    setAmount(0);
  };

  // 3. 履歴を削除する機能
  const handleDelete = (id: number, type: string, amount: number) => {
    // 削除する履歴の分だけ、所持金を元に戻す（逆の計算をする）
    if (type === "入金") {
      setBalance(balance - amount);
    } else {
      setBalance(balance + amount);
    }

    // IDが一致しないものだけを残す＝一致するものを消す（filter関数）
    const newTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(newTransactions);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">収支管理アプリ</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mb-6">
        <p className="text-gray-500 text-sm mb-1">現在の所持金</p>
        <p className="text-4xl font-bold text-gray-800 mb-6">
          ¥{balance.toLocaleString()}
        </p>

        <div className="mb-4">
          <input
            type="number"
            value={amount === 0 ? "" : amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="shadow-sm border border-gray-300 rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
            placeholder="金額を入力"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDeposit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded transition shadow"
          >
            入金
          </button>
          <button
            onClick={handleWithdraw}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded transition shadow"
          >
            出金
          </button>
        </div>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-700 mb-3">取引履歴</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {transactions.length === 0 ? (
            <p className="p-6 text-gray-400 text-center text-sm">
              履歴はまだありません
            </p>
          ) : (
            <ul>
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="border-b last:border-b-0 p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-sm ${
                        t.type === "入金" ? "text-blue-500" : "text-red-500"
                      }`}
                    >
                      {t.type}
                    </span>
                    <span className="text-xs text-gray-400">{t.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-700">
                      {t.type === "入金" ? "+" : "-"}¥
                      {t.amount.toLocaleString()}
                    </span>
                    {/* 削除ボタン */}
                    <button
                      onClick={() => handleDelete(t.id, t.type, t.amount)}
                      className="text-gray-400 hover:text-red-500 transition px-2 py-1 text-xl"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}