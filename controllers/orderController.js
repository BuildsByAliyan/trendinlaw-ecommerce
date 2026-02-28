// ═══════════════════════════════════════════════════════════════
//  controllers/orderController.js
// ═══════════════════════════════════════════════════════════════

const { readData, writeData } = require('../utils/fileHelper');
const { v4: uuidv4 }          = require('uuid');

const ORDER_FILE   = 'orders.json';
const PRODUCT_FILE = 'products.json';

// ── POST /api/orders ───────────────────────────────────────────
//  Body expected:
//  {
//    items: [ { productId, name, price, quantity, size, color } ],
//    customerDetails: { fullName, phone, email },
//    shippingAddress: "123 Main St, Karachi",
//    paymentMethod: "COD" | "Card" | "EasyPaisa",
//    totalAmount: 1299.00
//  }
exports.createOrder = async (req, res) => {
    const userId = req.user.id; // set by verifyToken middleware

    const { items, customerDetails, shippingAddress, paymentMethod, totalAmount } = req.body;

    // ── Input validation ─────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order must contain at least one item.' });
    }
    if (!customerDetails || !customerDetails.fullName || !customerDetails.phone || !customerDetails.email) {
        return res.status(400).json({ message: 'Customer details (fullName, phone, email) are required.' });
    }
    if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required.' });
    }
    if (!paymentMethod) {
        return res.status(400).json({ message: 'Payment method is required.' });
    }
    if (totalAmount === undefined || isNaN(parseFloat(totalAmount))) {
        return res.status(400).json({ message: 'A valid total amount is required.' });
    }

    try {
        const orders   = await readData(ORDER_FILE);
        const products = await readData(PRODUCT_FILE);

        // ── Stock validation ──────────────────────────────────
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                return res.status(404).json({
                    message: `Product "${item.name}" (ID: ${item.productId}) no longer exists.`,
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`,
                });
            }
        }

        // ── Build order object ────────────────────────────────
        const newOrder = {
            id:              uuidv4(),
            userId,
            customerDetails: {
                fullName: customerDetails.fullName.trim(),
                phone:    customerDetails.phone.trim(),
                email:    customerDetails.email.trim(),
            },
            items: items.map(item => ({
                productId: item.productId,
                name:      item.name,
                price:     parseFloat(item.price),
                quantity:  parseInt(item.quantity, 10),
                size:      item.size  || 'N/A',
                color:     item.color || 'N/A',
                image:     item.image || '',
            })),
            totalAmount:     parseFloat(totalAmount),
            shippingAddress: shippingAddress.trim(),
            paymentMethod,
            status:          'Pending',
            createdAt:       new Date().toISOString(),
            updatedAt:       new Date().toISOString(),
        };

        // ── Decrement product stock ───────────────────────────
        const updatedProducts = products.map(product => {
            const ordered = items.find(i => i.productId === product.id);
            if (ordered) {
                return { ...product, stock: product.stock - ordered.quantity };
            }
            return product;
        });

        // ── Persist both files ────────────────────────────────
        orders.push(newOrder);
        await writeData(ORDER_FILE, orders);
        await writeData(PRODUCT_FILE, updatedProducts);

        return res.status(201).json({
            message:  'Order placed successfully! Thank you for shopping with Trend In Law.',
            orderId:  newOrder.id,
            status:   newOrder.status,
        });

    } catch (err) {
        console.error('createOrder Error:', err.message);
        return res.status(500).json({ message: 'Server error placing your order. Please try again.' });
    }
};

// ── GET /api/orders ────────────────────────────────────────────
//  Returns all orders belonging to the authenticated user.
exports.getOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const orders     = await readData(ORDER_FILE);
        const userOrders = orders
            .filter(o => o.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json(userOrders);

    } catch (err) {
        console.error('getOrders Error:', err.message);
        return res.status(500).json({ message: 'Server error fetching your orders.' });
    }
};

// ── GET /api/orders/track/:orderId ─────────────────────────────
//  Public endpoint — anyone with an order ID can track it.
//  Used by docs/track.html
exports.trackOrder = async (req, res) => {
    const { orderId } = req.params;

    if (!orderId || orderId.trim() === '') {
        return res.status(400).json({ message: 'Order ID is required.' });
    }

    try {
        const orders = await readData(ORDER_FILE);
        const order  = orders.find(o => o.id === orderId.trim());

        if (!order) {
            return res.status(404).json({
                message: `No order found with ID "${orderId}". Please check and try again.`,
            });
        }

        // Return safe tracking info (no user ID or other sensitive fields)
        return res.status(200).json({
            orderId:         order.id,
            status:          order.status,
            items:           order.items,
            totalAmount:     order.totalAmount,
            shippingAddress: order.shippingAddress,
            paymentMethod:   order.paymentMethod,
            createdAt:       order.createdAt,
            updatedAt:       order.updatedAt,
            customerName:    order.customerDetails?.fullName,
        });

    } catch (err) {
        console.error('trackOrder Error:', err.message);
        return res.status(500).json({ message: 'Server error tracking order.' });
    }
};