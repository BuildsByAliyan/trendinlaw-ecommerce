# 🖤 TREND IN LAW — Style. Vibe. Reflect.

> A premium full-stack e-commerce platform for a modern clothing brand. Built with a sleek, dark aesthetic and a complete shopping experience — from product discovery to checkout.

---

## 🌐 Live Demo

**[→ View Live Website](https://BuildsByAliyan.github.io/trendinlaw-ecommerce/)**

---

## ✨ Features

- 🔐 **User Authentication** — Register, login, and logout with JWT-based sessions
- 🛍️ **Dynamic Product Catalog** — Products loaded from a REST API with category filters and live search
- 🛒 **Shopping Cart** — Persistent cart with quantity controls, item removal, and subtotal calculation
- 💚 **Wishlist** — Save favourite items across sessions via localStorage
- 📦 **Order Placement** — Full checkout flow with customer details and shipping address
- 🔄 **Returns & Exchanges** — Dedicated form connected to a backend API
- 📍 **Order Tracking** — Track order status by Order ID
- 📬 **Contact Form** — Backend-connected contact and enquiry submission
- 📱 **Fully Responsive** — Optimised for desktop, tablet, and mobile
- 🎞️ **Animated Banner Slideshow** — Auto-rotating hero images on the shop page
- 💬 **WhatsApp Integration** — Direct customer-to-brand messaging button
- 🔔 **Toast Notifications** — Non-intrusive cart and action feedback
- ♾️ **Ticker Marquee** — Animated promotional announcement strip

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES2020+) |
| Backend | Node.js, Express.js |
| Auth | JWT (JSON Web Tokens) |
| Data | JSON-based store (MongoDB-ready) |
| Fonts | Google Fonts — Bebas Neue, Barlow Condensed |
| Icons | Font Awesome 6 |
| Version Control | Git & GitHub |

---

## 📁 Project Structure

```
trendinlaw-ecommerce/
├── index.html               # Homepage
├── shop.html                # Product catalog
├── product.html             # Product detail page
├── order.html               # Checkout page
├── track.html               # Order tracking
├── return-exchange.html     # Returns & exchanges
├── contact.html             # Contact form
├── wishlist.html            # Saved items
├── api.js                   # Frontend API client (all backend calls)
├── image/                   # Brand & hero images
├── product/                 # Product images
└── server/
    ├── server.js            # Express entry point
    ├── routes/              # API route handlers
    ├── controllers/         # Business logic
    └── utils/               # Helper functions
```

---

## 🖥️ How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/CodeWithAliyan/trendinlaw-ecommerce.git

# 2. Navigate into the project folder
cd trendinlaw-ecommerce

# 3. Install backend dependencies
npm install

# 4. Start the Express server
node server/server.js
```

The API server will start at **`http://localhost:5000`**.

To view the frontend, open `index.html` directly in your browser, or serve it with any static file server:

```bash
# Optional: serve the frontend with npx
npx serve .
```

> **Note:** The frontend `api.js` file points to `http://localhost:5000/api` by default. Update the `BASE_URL` constant in `api.js` when deploying to production.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/auth/logout` | Logout current session |
| `GET` | `/api/auth/me` | Get logged-in user profile |
| `GET` | `/api/products` | Fetch all products (supports `?category=` & `?search=`) |
| `GET` | `/api/products/:id` | Fetch a single product |
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/orders` | Get order history (auth required) |
| `GET` | `/api/orders/track/:id` | Track an order publicly |
| `POST` | `/api/contact` | Submit a contact message |
| `POST` | `/api/returns` | Submit a return or exchange request |

---

## 👤 Author

**Aliyan Qureshi**
- GitHub: [@CodeWithAliyan](https://github.com/CodeWithAliyan)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
