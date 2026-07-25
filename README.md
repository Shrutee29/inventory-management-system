# 📦 Inventory Management System

A full-stack Inventory Management System built with **Django REST Framework** and **React (Vite)**. The application provides secure authentication, inventory tracking, supplier management, order processing, and an admin dashboard for efficient stock management.

---

## 🚀 Features

### 🔐 Authentication
- User Registration & Login
- JWT Authentication
- Role-based Access Control (Admin & Customer)
- Protected Routes

### 📦 Product Management
- Add Product
- Edit Product
- Delete Product
- Soft Delete (Archive products that have previous orders)
- Search Products
- Filter by Category
- Pagination

### 🏷 Category Management
- Add Category
- Edit Category
- Delete Category
- Active/Inactive Status

### 🚚 Supplier Management
- Add Supplier
- Edit Supplier
- Delete Supplier
- Supplier Details Management

### 🛒 Shopping Cart
- Add Products to Cart
- Update Quantity
- Remove Products
- Cart Summary

### 📋 Order Management
- Place Orders
- View Order History
- Complete Orders
- Cancel Orders
- Automatic Stock Update

### 📊 Dashboard
- Inventory Overview
- Product Statistics
- Order Statistics
- Stock Summary

### ✨ UI Features
- Responsive Design
- Toast Notifications
- Confirmation Dialogs
- Pagination
- Search & Filters
- Modern Dark Theme

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router

## Backend
- Django
- Django REST Framework
- Simple JWT

## Database
- SQLite (Development)

---

# 📂 Project Structure

```
inventory-management-system/
│
├── backend/
│   ├── config/
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── suppliers/
│   ├── orders/
│   ├── dashboard/
│   ├── inventory/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/Shrutee29/inventory-management-system.git
```

```bash
cd inventory-management-system
```

---

## Backend Setup

```bash
cd backend
```

Create Virtual Environment

```bash
python -m venv venv
```

Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

Run Migrations

```bash
python manage.py migrate
```

Start Backend

```bash
python manage.py runserver
```

---

## Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install Packages

```bash
npm install
```

Run Frontend

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the frontend folder.

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

# 📸 Application Modules

- Login
- Register
- Dashboard
- Products
- Categories
- Suppliers
- Shopping Cart
- Orders

---

# 🔄 Inventory Flow

1. Admin adds Categories
2. Admin adds Suppliers
3. Admin adds Products
4. Customer adds products to Cart
5. Customer places Order
6. Stock is automatically updated
7. Admin completes or cancels orders
8. Products with previous orders are archived instead of permanently deleted

---

# 📌 Future Improvements

- Purchase Orders
- Reports & Analytics
- Email Notifications
- Image Uploads
- Barcode Scanner
- Export Orders to Excel/PDF

---

# 👨‍💻 Author

**Shrutee**

GitHub:
https://github.com/Shrutee29

---

# 📄 License

This project is developed for learning and assessment purposes.