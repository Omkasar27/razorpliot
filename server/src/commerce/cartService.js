import Cart from '../db/models/Cart.js';
import Product from '../db/models/Product.js';

export async function getOrCreateCart(userId, merchantId) {
  let cart = await Cart.findOne({ userId, merchantId, status: 'active' });
  if (!cart) {
    cart = await Cart.create({ userId, merchantId, items: [] });
  }
  return cart;
}

export async function addItem(userId, merchantId, { productId, quantity = 1, addedVia = 'customer' }) {
  const product = await Product.findOne({ _id: productId, merchantId, active: true });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    err.publicMessage = 'That product is not available.';
    throw err;
  }

  const cart = await getOrCreateCart(userId, merchantId);
  const existing = cart.items.find((i) => i.productId.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      productId: product._id,
      name: product.name,
      priceAtAdd: product.price,
      quantity,
      addedVia,
    });
  }
  await cart.save();
  return cart;
}

export async function removeItem(userId, merchantId, productId) {
  const cart = await getOrCreateCart(userId, merchantId);
  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  await cart.save();
  return cart;
}

export function cartTotal(cart) {
  return cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
}