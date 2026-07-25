import { useEffect, useMemo, useState } from 'react';

import CartDrawer from '@/components/CartDrawer';
import Pagination from '@/components/Pagination';
import ProductModal from '@/components/ProductModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';

export default function ProductsPage() {
  const { addItem } = useCart();
  const { isAdmin } = useAuth();
  const { pushToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reloadProducts, setReloadProducts] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const response = await api.get('/api/categories/?page_size=100');
      setCategories(response.data.results || []);
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('page_size', pageSize);
      if (search) params.set('search', search);
      if (categoryId) params.set('category', categoryId);

      const response = await api.get(`/api/products/?${params.toString()}`, { signal: controller.signal });
      setProducts(response.data.results || []);
      setCount(response.data.count || 0);
      setLoading(false);
    };

    loadProducts().catch((error) => {
      if (error.name !== 'CanceledError') {
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, [categoryId, page, pageSize, search, reloadProducts]);

  const filtersEnabled = useMemo(() => Boolean(search || categoryId), [categoryId, search]);

  const handleAdd = (product) => {
    if (product.stock_quantity <= 0) {
      pushToast({ title: 'Out of stock', description: 'This product cannot be added.', tone: 'error' });
      return;
    }

    addItem(product);
    pushToast({ title: 'Added to cart', description: product.name });
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sand-200">Browse products</p>
            <h1 className="title-font mt-3 text-4xl font-bold text-white">Find inventory, filter fast, and place orders</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Search the catalog, narrow by category, and send items directly to checkout.
            </p>
          </div>
          <div className="flex items-center gap-3">
  {isAdmin && (
    <button
  type="button"
  onClick={() => setShowProductModal(true)}
  className="rounded-xl bg-accent-500 px-5 py-3 font-semibold text-white transition hover:bg-accent-400"
>
  + Add Product
</button>
  )}

  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
    {filtersEnabled ? 'Filters active' : 'Showing all active products'}
  </div>
</div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, SKU, or description"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-accent-400/50"
          />
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent-400/50"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-ink-900">
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          {loading ? (
            <div className="glass-panel rounded-[2rem] p-8 text-center text-slate-300">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="glass-panel rounded-[2rem] p-8 text-center text-slate-300">No products match the current filters.</div>
          ) : (
            products.map((product) => (
              <article key={product.id} className="glass-panel rounded-[2rem] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                      <span>{product.sku}</span>
                      <span className="rounded-full bg-white/[0.08] px-3 py-1 normal-case tracking-normal text-slate-200">
                        {product.category_name || product.category}
                      </span>
                    </div>
                    <h2 className="title-font text-2xl font-semibold text-white">{product.name}</h2>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300">{product.description || 'No description provided.'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                    <p className="text-sm text-slate-400">Price</p>
                    <p className="text-2xl font-semibold text-sand-200">${Number(product.price).toFixed(2)}</p>
                    <p className={`mt-2 text-sm font-semibold ${product.stock_quantity > 0 ? 'text-accent-200' : 'text-red-300'}`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Category active: {product.is_active ? 'Yes' : 'No'}</p>
                  <div className="flex gap-2">

  {isAdmin && (
    <>
      <button
  type="button"
  onClick={() => {
    setSelectedProduct(product);
    setShowProductModal(true);
  }}
  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
>
  Edit
</button>
      <button
  type="button"
  onClick={async () => {
    if (!window.confirm("Delete this product?")) return;

    try {
  const response = await api.delete(`/api/products/${product.id}/`);

  const message = response.data?.detail || "";

if (message.includes("archived")) {
  pushToast({
    title: "Product Archived",
    description: message,
    tone: "warning",
  });
} else {
  pushToast({
    title: "Product Deleted",
    description: "Product deleted successfully.",
    tone: "success",
  });
}

  setReloadProducts((prev) => !prev);

} catch (err) {
  console.log(err.response?.data);
  console.log(err.response?.status);

  const message =
    err.response?.data?.detail ||
    err.response?.data?.error ||
    "Failed to delete product.";

  pushToast({
    title: "Delete Failed",
    description: message,
    tone: "error",
  });
}
  }}
  className="rounded-lg bg-red-600 px-4 py-2 text-white"
>
  Delete
</button>
    </>
  )}

  <button
    type="button"
    onClick={() => handleAdd(product)}
    disabled={product.stock_quantity <= 0}
    className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Add to cart
  </button>

</div>
                </div>
              </article>
            ))
          )}

          <Pagination page={page} pageSize={pageSize} totalCount={count} onPageChange={setPage} />
        </section>

        <CartDrawer />
      </div>
     <ProductModal
  open={showProductModal}
  product={selectedProduct}
  onClose={() => {
    setShowProductModal(false);
    setSelectedProduct(null);
  }}
  onSuccess={() => {
    setReloadProducts(prev => !prev);
  }}
/>

    </div>
  );
}