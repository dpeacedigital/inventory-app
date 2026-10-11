"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Receipt, CheckCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
}

interface Sale {
  id: string;
  totalAmount: number;
  createdAt: string;
  user?: { name: string; role: string };
  items: {
    quantity: number;
    unitPrice: number;
    product: { name: string; sku: string };
  }[];
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      if (prodData.products) setProducts(prodData.products);

      const salesRes = await fetch("/api/sales");
      const salesData = await salesRes.json();
      if (salesData.sales) setSales(salesData.sales);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: selectedProductId, quantity: Number(qty) }],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Sale completed and stock deducted successfully!");
        setQty(1);
        setSelectedProductId("");
        loadData();
      } else {
        alert(data.error || "Sale failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sales & Checkout Terminal</h1>
              <p className="text-sm text-slate-500">Record outgoing sales and track live customer transactions</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Sale Terminal */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              Make a Quick Sale
            </h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Select Product</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="">-- Choose item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.name} - ${p.sellingPrice.toFixed(2)} ({p.quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition"
              >
                Complete Sale
              </button>
            </form>
          </div>

          {/* Transaction History Log */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-600" />
                Recent Transaction History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Sold By</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                          {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {s.user ? `${s.user.name} (${s.user.role})` : "Direct / Guest"}
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-medium">
                          {s.items.map((i, idx) => (
                            <div key={idx}>
                              {i.product.name} × {i.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          ${s.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
