/* ═══════════════════════════════════════════════════════════════
   TREND IN LAW — docs/api.js
   Drop this ONE script tag at the top of every HTML page:
     <script src="api.js"></script>

   Then call e.g.:
     const products = await API.products.getAll();
     const result   = await API.orders.place(cartData);
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Base URL ───────────────────────────────────────────────
  //  In development:  http://localhost:5000/api
  //  In production:   change to your live domain, e.g. https://trendinlaw.com/api
  const BASE_URL = 'http://localhost:5000/api';

  // ── Token Storage ──────────────────────────────────────────
  //  The JWT is saved to localStorage on login and read here
  //  automatically for every protected request.
  const getToken = () => localStorage.getItem('til_auth_token');
  const setToken = (t) => localStorage.setItem('til_auth_token', t);
  const clearToken = () => localStorage.removeItem('til_auth_token');

  // ── Core Fetch Wrapper ─────────────────────────────────────
  async function request(method, endpoint, body = null, requiresAuth = false) {
    const headers = { 'Content-Type': 'application/json' };

    if (requiresAuth) {
      const token = getToken();
      if (!token) {
        throw new Error('You must be logged in to perform this action.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data     = await response.json();

    if (!response.ok) {
      // Throw with the server's error message so callers can display it
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  }

  // ════════════════════════════════════════════════════════════
  //  AUTH API
  // ════════════════════════════════════════════════════════════
  const auth = {
    /**
     * Register a new account.
     * @param {{ firstName, lastName, email, password }} userData
     */
    register: async (userData) => {
      const res = await request('POST', '/auth/register', userData);
      if (res.token) setToken(res.token);
      return res;
    },

    /**
     * Log in with email and password.
     * @param {{ email, password }} credentials
     */
    login: async (credentials) => {
      const res = await request('POST', '/auth/login', credentials);
      if (res.token) setToken(res.token);
      return res;
    },

    /**
     * Log out — clears local token and tells the server.
     */
    logout: async () => {
      try { await request('POST', '/auth/logout'); } catch (_) {}
      clearToken();
    },

    /**
     * Get the profile of the currently logged-in user.
     */
    getMe: () => request('GET', '/auth/me', null, true),

    /** Check if a user is currently logged in (token exists). */
    isLoggedIn: () => !!getToken(),
  };

  // ════════════════════════════════════════════════════════════
  //  PRODUCTS API
  // ════════════════════════════════════════════════════════════
  const products = {
    /**
     * Get all products. Pass optional filters.
     * @param {{ category?: string, search?: string }} [filters]
     */
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      return request('GET', `/products${params ? '?' + params : ''}`);
    },

    /**
     * Get a single product by its ID.
     * @param {string} id
     */
    getById: (id) => request('GET', `/products/${id}`),
  };

  // ════════════════════════════════════════════════════════════
  //  ORDERS API
  // ════════════════════════════════════════════════════════════
  const orders = {
    /**
     * Place a new order. Requires login.
     * Reads cart from localStorage (til_cart) automatically.
     *
     * @param {{ customerDetails, shippingAddress, paymentMethod }} checkoutData
     */
    place: async (checkoutData) => {
      const cart = JSON.parse(localStorage.getItem('til_cart') || '[]');

      if (!cart.length) {
        throw new Error('Your cart is empty. Add items before placing an order.');
      }

      // Calculate total server-side verified amount
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal >= 3000 ? 0 : 200;
      const total    = subtotal + shipping;

      const orderPayload = {
        items: cart.map(item => ({
          productId: item.id,        // your til_cart uses 'id', API expects 'productId'
          name:      item.name,
          price:     item.price,
          quantity:  item.quantity,
          size:      item.size  || 'N/A',
          color:     item.color || 'N/A',
          image:     item.image || '',
        })),
        customerDetails:  checkoutData.customerDetails,
        shippingAddress:  checkoutData.shippingAddress,
        paymentMethod:    checkoutData.paymentMethod,
        totalAmount:      total,
      };

      const res = await request('POST', '/orders', orderPayload, true);

      // Clear cart on success
      localStorage.removeItem('til_cart');

      return res;
    },

    /**
     * Get order history for the logged-in user.
     */
    getMyOrders: () => request('GET', '/orders', null, true),

    /**
     * Track an order by its ID (public — no login needed).
     * @param {string} orderId
     */
    track: (orderId) => request('GET', `/orders/track/${orderId}`),
  };

  // ════════════════════════════════════════════════════════════
  //  CONTACT API
  // ════════════════════════════════════════════════════════════
  const contact = {
    /**
     * Submit a contact form message.
     * @param {{ name, email, subject, message }} formData
     */
    send: (formData) => request('POST', '/contact', formData),
  };

  // ════════════════════════════════════════════════════════════
  //  RETURNS API
  // ════════════════════════════════════════════════════════════
  const returns = {
    /**
     * Submit a return or exchange request.
     * @param {{ orderId, email, productName, reason, type }} formData
     *   type must be 'Return' or 'Exchange'
     */
    submit: (formData) => request('POST', '/returns', formData),
  };

  // ── Expose globally ────────────────────────────────────────
  window.API = { auth, products, orders, contact, returns };

})();