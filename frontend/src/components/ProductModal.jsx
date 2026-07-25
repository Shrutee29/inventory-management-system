import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export default function ProductModal({
  open,
  onClose,
  onSuccess,
  product,
}) {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
  category: "",
  supplier: "",
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  stock_quantity: "",
  is_active: true,
});
 useEffect(() => {
  if (!open) return;

  const loadData = async () => {
    try {
      const categoryRes = await api.get("/api/categories/?page_size=100");
      console.log("Categories:", categoryRes.data);

      const supplierRes = await api.get("/api/suppliers/?page_size=100");
      console.log("Supplier Response:");
      console.log(supplierRes.data);

      setCategories(categoryRes.data.results || []);
      setSuppliers(supplierRes.data);
      console.log("Categories State", categoryRes.data.results);
      console.log("Suppliers State", supplierRes.data);
    } catch (err) {
      console.log(err.response);
      console.log(err.response?.data);
      console.log(err.response?.status);
    }
  };

  loadData();
}, [open]);
const resetForm = () => {
  setFormData({
    category: "",
    supplier: "",
    name: "",
    slug: "",
    sku: "",
    description: "",
    price: "",
    stock_quantity: "",
    is_active: true,
  });
};
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};
useEffect(() => {
  if (product) {
    setFormData({
      category: product.category,
      supplier: product.supplier,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      is_active: product.is_active,
    });
  } else {
    resetForm();
  }
}, [product]);
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.category) {
  alert("Please select a category.");
  return;
}

if (!formData.supplier) {
  alert("Please select a supplier.");
  return;
}

if (!formData.name.trim()) {
  alert("Product name is required.");
  return;
}

if (!formData.sku.trim()) {
  alert("SKU is required.");
  return;
}

if (formData.price === "") {
  alert("Price is required.");
  return;
}

if (Number(formData.price) <= 0) {
  alert("Price must be greater than 0.");
  return;
}

if (formData.stock_quantity === "") {
  alert("Stock quantity is required.");
  return;
}

if (Number(formData.stock_quantity) < 0) {
  alert("Stock quantity cannot be negative.");
  return;
}

  try {
    if (product) {
  await api.put(`/api/products/${product.id}/`, formData);
} else {
  await api.post("/api/products/", formData);
}
alert(product ? "Product updated successfully!" : "Product added successfully!");

resetForm();
if (onSuccess) {
  onSuccess();
}

onClose();
  } catch (error) {
    console.log(error.response?.data);
    alert("Failed to add product.");
  }
};
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-ink-900 p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
  {product ? "Edit Product" : "Add Product"}
</h2>

          <button
  type="button"
  onClick={() => {
    resetForm();
    onClose();
  }}
  className="text-slate-400 hover:text-white"
>
  ✕
</button>
        </div>

        <form
  onSubmit={handleSubmit}
  className="mt-6 space-y-5"
>

  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Category
    </label>

    <select
  name="category"
  value={formData.category}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
>
  <option value="">Select category</option>

  {categories.map((category) => (
    <option
      key={category.id}
      value={category.id}
      style={{ color: "black" }}
    >
      {category.name}
    </option>
  ))}
</select>
  </div>

  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Supplier
    </label>

    <select
  name="supplier"
  value={formData.supplier}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
>
  <option value="">Select supplier</option>

  {suppliers.map((supplier) => (
    <option
      key={supplier.id}
      value={supplier.id}
      style={{ color: "black" }}
    >
      {supplier.company_name}
    </option>
  ))}
</select>
  </div>

  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Product Name
    </label>

    <input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
/>
  </div>

  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Slug (Optional)
    </label>

    <input
  type="text"
  name="slug"
  value={formData.slug}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
/>
  </div>

  <div>
    <label className="mb-2 block text-sm text-slate-300">
      SKU
    </label>

    <input
  type="text"
  name="sku"
  value={formData.sku}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
/>
  </div>

  <div>
    <label className="mb-2 block text-sm text-slate-300">
      Description
    </label>

    <textarea
  rows="3"
  name="description"
  value={formData.description}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
/>
  </div>

  <div className="grid grid-cols-2 gap-4">

    <div>
      <label className="mb-2 block text-sm text-slate-300">
        Price
      </label>

      <input
  type="number"
  min="0.01"
  name="price"
  value={formData.price}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
/>
    </div>

    <div>
      <label className="mb-2 block text-sm text-slate-300">
        Stock Quantity
      </label>

      <input
   type="number"
  min="0"
  name="stock_quantity"
  value={formData.stock_quantity}
  onChange={handleChange}
  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
/>
    </div>

  </div>

  <label className="flex items-center gap-3 text-slate-300">
    <input
  type="checkbox"
  name="is_active"
  checked={formData.is_active}
  onChange={handleChange}
/>
    Active
  </label>

  <div className="flex justify-end gap-3">

    <button
  type="button"
  onClick={() => {
    resetForm();
    onClose();
  }}
  className="rounded-xl border border-white/10 px-5 py-3 text-white"
>
  Cancel
</button>

    <button
      type="submit"
      className="rounded-xl bg-accent-500 px-5 py-3 font-semibold text-white"
    >
      {product ? "Update Product" : "Save Product"}
    </button>

  </div>

</form>
      </div>
    </div>
  );
}