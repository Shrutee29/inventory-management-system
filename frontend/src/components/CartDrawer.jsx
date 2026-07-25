import { useToast } from '@/context/ToastContext';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';

export default function CartDrawer() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { pushToast } = useToast();

  const checkout = async () => {
    if (!items.length) {
      pushToast({ title: 'Cart is empty', description: 'Add at least one product before checkout.', tone: 'info' });
      return;
    }

    const payload = {
      items: items.map((item) => ({ product: item.product.id, quantity: item.quantity })),
    };

    await api.post('/api/orders/', payload);
    clearCart();
    pushToast({ title: 'Order placed', description: 'Your order was created successfully.' });
  };

  return (
    <section className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="title-font text-xl font-semibold text-white">Cart</p>
          <p className="text-sm text-slate-400">Review quantities before checkout.</p>
        </div>
        <button type="button" onClick={clearCart} className="text-sm font-semibold text-sand-200 hover:text-sand-100">
          Clear all
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
            No items yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{item.product.name}</p>
                  <p className="text-sm text-slate-400">SKU {item.product.sku}</p>
                </div>
                <button type="button" onClick={() => removeItem(item.product.id)} className="text-sm text-red-300 hover:text-red-200">
                  Remove
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="h-9 w-9 rounded-full border border-white/10 text-lg text-white transition hover:bg-white/10"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.product.stock_quantity}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
                    className="w-16 rounded-xl border border-white/10 bg-ink-900 px-3 py-2 text-center text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="h-9 w-9 rounded-full border border-white/10 text-lg text-white transition hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
                <p className="font-semibold text-sand-200">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={checkout}
          className="mt-4 w-full rounded-2xl bg-accent-500 px-4 py-3 font-semibold text-white transition hover:bg-accent-400"
        >
          Place order
        </button>
      </div>
    </section>
  );
}