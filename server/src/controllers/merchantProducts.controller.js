import Product from '../db/models/Product.js';

export async function listProducts(req, res, next) {
  try {
    const { merchantId } = req.query;
    if (!merchantId) {
      const err = new Error('merchantId is required');
      err.status = 400;
      err.publicMessage = 'merchantId is required.';
      throw err;
    }
    const products = await Product.find({ merchantId }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { merchantId, name, category, price, inventory } = req.body;
    if (!merchantId || !name || !category || price == null || inventory == null) {
      const err = new Error('Missing required fields');
      err.status = 400;
      err.publicMessage = 'name, category, price, and inventory are required.';
      throw err;
    }
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      err.publicMessage = 'That product no longer exists.';
      throw err;
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    // Soft delete — keeps historical order/audit references intact.
    const product = await Product.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      err.publicMessage = 'That product no longer exists.';
      throw err;
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
}