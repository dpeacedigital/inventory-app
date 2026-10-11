"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Search, 
  ShoppingCart,
  UserCheck,
  CheckCircle,
  Tag,
  LogOut
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice?: number;
  sellingPrice: number;
  quantity: number;
  lowStockAlert: number;
  description?: string;
}

interface Summary {
  totalStockUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userRole, setUserRole] = useState<string>("GUEST");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "General",
    costPrice: "",
    sellingPrice: "",
    quantity: "",
    lowStockAlert: "5",
    description: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setUserRole(data.userRole || "GUEST");
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: "",
          sku: "",
          category: "General",
          costPrice: "",
          sellingPrice: "",
          quantity: "",
          lowStockAlert: "5",
          description: "",
        });
        setToastMessage("Product posted successfully!");
        setTimeout(() => setToastMessage(""), 4000);
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickBuy = async (productId: string, productName: string) => {
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId, quantity: 1 }],
        }),
      });

      if (res.ok) {
        setToastMessage(`Purchased 1 unit of ${productName}!`);
        setTimeout(() => setToastMessage(""), 4000);
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Purchase failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isStaffOrAdmin = userRole === "ADMIN" || userRole === "STAFF";

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Navigation Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              🛍️
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-none block">Storefront</span>
              <span className="text-xs text-slate-500">
                Logged in as: <strong className="text-emerald-700">{userRole}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isStaffOrAdmin && (
              <Link
                href="/sales"
                className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>Sales Terminal</span>
              </Link>
            )}

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition"
            >
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>{userRole === "GUEST" ? "Login" : "Switch Account"}</span>
            </Link>

            {/* ONLY VISIBLE TO ADMIN OR STAFF */}
            {isStaffOrAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* SHOP METRICS (HIDDEN FROM CUSTOMERS, VISIBLE TO ADMIN/STAFF ONLY) */}
        {summary && isStaffOrAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Stock Units</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.totalStockUnits} Units</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Inventory Value</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  ${summary.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock Warnings</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{summary.lowStockCount} Items</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Available Products</h2>
            <p className="text-sm text-slate-500">Browse store items and live stock</p>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Product Cards */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No products available</h3>
            <p className="text-sm text-slate-500 mb-6">
              {isStaffOrAdmin ? "Add your first product to display it for customers." : "Check back soon for available items."}
            </p>
            {isStaffOrAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isLowStock = product.quantity <= product.lowStockAlert;
              const isOutOfStock = product.quantity <= 0;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Tag className="w-3 h-3" />
                        {product.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {product.sku}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pt-2">
                      <div>
                        <span className="text-xs text-slate-400 block">Price</span>
                        <span className="text-xl font-extrabold text-slate-900">
                          ${product.sellingPrice.toFixed(2)}
                        </span>
                      </div>
                      {product.costPrice !== undefined && (
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Cost: ${product.costPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">In Stock:</span>
                      {isOutOfStock ? (
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
                      ) : isLowStock && isStaffOrAdmin ? (
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Low: {product.quantity} left
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {product.quantity} units
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                      disabled={isOutOfStock}
                      onClick={() => handleQuickBuy(product.id, product.name)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isOutOfStock ? "Sold Out" : "Buy Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Creation Modal */}
      {showModal && isStaffOrAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Post New Product (Admin / Staff)</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Product Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Wireless Mouse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">SKU / Code</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. WM-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Category</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Electronics"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Customer Selling Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Quantity</label>
                  <input
                    required
                    type="number"
                    placeholder="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Low Stock Alert Limit</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={formData.lowStockAlert}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short note about the product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition"
                >
                  Save & Post Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
