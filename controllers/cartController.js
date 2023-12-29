const Cart = require('../models/cartModels');
const Wishlist = require('../models/wishlistModels')

const cartview = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );
    const cart = userCart ? userCart.items : [];
    const subtotal = calculateSubtotal(cart);
    const productTotal = calculateProductTotal(cart);
    const subtotalWithShipping = subtotal;

    let outOfStockError = false;

    if (cart.length > 0) {
      for (const cartItem of cart) {
        const product = cartItem.product;

        if (product.quantity < cartItem.quantity) {
          outOfStockError = true;
          break;
        }
      }
    }
    let maxQuantityErr = false;
    if (cart.length > 0) {
      for (const cartItem of cart) {
        const product = cartItem.product;

        if (cartItem.quantity > 2) {
          maxQuantityErr = true;
          break;
        }
      }
    }

    res.render("cart", {
      User: userId,
      cart,
      productTotal,
      subtotalWithShipping,
      outOfStockError,
      maxQuantityErr,
    });
  } catch (error) {
    console.log(error.message);
  }

}
const calculateSubtotal = (cart) => {
  let subtotal = 0;
  for (const cartItem of cart) {
    subtotal += cartItem.product.discountPrice * cartItem.quantity;
  }
  return subtotal;
};

const calculateProductTotal = (cart) => {
  const productTotals = [];
  for (const cartItem of cart) {
    const total = cartItem.product.discountPrice * cartItem.quantity;
    productTotals.push(total);
  }
  return productTotals;
};
const removeCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;

    const existingCart = await Cart.findOne({ user: userId });
    if (existingCart) {
      const updatedItems = existingCart.items.filter(
        (item) => item.product.toString() !== productId
      );

      existingCart.items = updatedItems;
      existingCart.total = updatedItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );

      await existingCart.save();

      res.json({ success: true, toaster: true });
    } else {
      res.json({ success: false, error: "Cart not found" });
    }

  } catch (error) {
    console.log(error.message)
  }
}

const updatecartcount = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;
    const newQuantity = parseInt(req.query.quantity);

    const existingCart = await Cart.findOne({ user: userId });
    if (existingCart) {
      const existingCartItem = existingCart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingCartItem) {
        existingCartItem.quantity = newQuantity;
        existingCart.total = existingCart.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );

        await existingCart.save();
      }
      res.json({ success: true });
    } else {
      res.json({ success: false, error: "Cart not found" });
    }

  } catch (error) {
    console.log(error.message);
  }
}
const addtocart = async (req, res) => {
  try {
    const ProductId = req.query.productId;
    const userId = req.session.user_id;
    const { qty } = req.body;
    console.log(userId)
    const existingCart = await Cart.findOne({ user: userId });
    let newCart = {};
    if (req.query.wishlist) {
      const existingCart = await Wishlist.findOne({ user: userId })
      if (existingCart) {
        const updatedItems = existingCart.items.filter(
          (item) => item.product.toString() !== ProductId
        );
        existingCart.items = updatedItems;
        await existingCart.save();
      }
    }
    if (existingCart) {
      const existingCartItem = existingCart.items.find((item) => item.product.toString() === ProductId);

      if (existingCartItem) {
        existingCartItem.quantity += parseInt(qty);
      } else {
        existingCart.items.push({
          product: ProductId,
          quantity: parseInt(qty),
        });
      }

      existingCart.total = existingCart.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );

      await existingCart.save();

    } else {
      newCart = new Cart({
        user: userId,
        items: [{ product: ProductId, quantity: parseInt(qty) }],
        total: parseInt(qty, 10),
      });

      await newCart.save();
    }

    req.session.cartLength = (existingCart || newCart).items.length;
    res.redirect('/cart');
  } catch (error) {
    console.log(error)
  }
}



module.exports = {
  cartview,
  addtocart,
  calculateSubtotal,
  calculateProductTotal,
  removeCart,
  updatecartcount
}