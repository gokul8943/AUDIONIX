const Address = require('../models/addressModels');
const User = require('../models/userModels');
const Cart = require('../models/cartModels')
const Order = require('../models/ordermodel');
const Product = require('../models/productModels');
const Coupon = require('../models/couponModels')
const Transaction = require('../models/transactionModel');
const Razorpay = require('razorpay');
require("dotenv").config()
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

// const razorpay = new Razorpay({
//   key_id : RAZORPAY_ID_KEY,
//   key_secret :RAZORPAY_SECRET_KEY
// })
const razorpay = new Razorpay({
  key_id: "rzp_test_8pSgk7L5IGPkos",
  key_secret: "yotnNU9pTMFcTnCZOQ2Lv1sh"
})

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

function calculateDiscountedTotal(total, discountPercentage) {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100.');
  }

  const discountAmount = (discountPercentage / 100) * total;
  const discountedTotal = total - discountAmount;

  return discountedTotal;
};

const checkoutView = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.find({ user: userId })

    const address = await Address.find({ user: userId })

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      model: 'Product',
    });

    const cartItems = cart.items || [];

    const subtotal = calculateSubtotal(cartItems);
    const productTotal = calculateProductTotal(cartItems);
    const subtotalWithShipping = subtotal;
    const outOfStockError = cartItems.some(item => cart.quantity < item.quantity);
    const maxQuantityErr = cartItems.some(item => cart.quantity > 2);

    const currentDate = new Date();
    const coupon = await Coupon.find({
      expiry: { $gt: currentDate },
      is_listed: true,
    }).sort({ createdate: -1 })

    res.render('checkout', {
      user,
      cart: cartItems,
      subtotal,
      productTotal,
      address,
      subtotalWithShipping,
      outOfStockError,
      maxQuantityErr,
      coupon
    })
  } catch (error) {
    console.log(error.message);
  }
}

const orderprocesses = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { address, paymentMethod, couponCode } = req.body;
    console.log(couponCode);
    const user = await User.findById(userId)
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      return res
        .status(500)
        .json({ success: false, error: "User or cart not found." });
    }
    if (!address) {
      return res.status(400).json({ error: 'Billing address not selected' });
    }

    const cartItems = cart.items || [];
    let totalAmount = 0
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      product.quantity -= cartItem.quantity;
      const itemTotal = product.discountPrice * cartItem.quantity;
      totalAmount += parseFloat(itemTotal.toFixed(2));

      await product.save();
    }
    let payStatus = "Pending"
    if (paymentMethod == 'wallet') {
      payStatus = "Payment Successful"
    }
    const order = new Order({
      user: userId,
      address: address,
      orderDate: new Date(),
      status: "Pending",
      paymentMethod: paymentMethod,
      paymentStatus: payStatus,
      deliveryDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
      totalAmount: totalAmount,
      items: cartItems.map(cartItem => {
        const product = cartItem.product;
        const isDiscounted = product.discountStatus &&
          new Date(product.discountStart) <= new Date() &&
          new Date(product.discountEnd) >= new Date();
        const priceToConsider = isDiscounted ? product.discountPrice : product.price;

        return {
          product: product._id,
          quantity: cartItem.quantity,
          price: priceToConsider,
        };
      }),
    });

    await order.save();


    if (paymentMethod === "wallet") {
      if (totalAmount <= user.walletBalance) {
        user.walletBalance -= totalAmount;
        await user.save();

        const transactiondebit = new Transaction({
          user: userId,
          amount: totalAmount,
          type: "debit",
          paymentMethod: order.paymentMethod,
          orderId: order._id,
          description: `Debited from wallet `,
        });
        await transactiondebit.save();
      } else {
        await Order.deleteOne({ _id: order._id });
        return res
          .status(400)
          .json({ success: false, error: "Insufficient Wallet Balance", user });
      }
    }

    res.status(200).json({ success: true, message: 'Order placed successfully' });



  } catch (error) {
    console.log(error.message);
  }
}
const ordersucess = async (req, res) => {
  try {
    const user = req.session.user_id
    await Cart.deleteOne({ user: user });

    const order = await Order.findOne({ user: user })
      .sort({ orderDate: -1 })
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
    if (
      order.paymentMethod == "Pay online" ||
      order.paymentMethod == "Wallet"
    ) {
      order.paymentStatus = "Payment Successful";
      await order.save();
    }
    res.render('ordersucess', { order, User: user })
  } catch (error) {
    console.log(error);
  }
}

const orderDetails = async (req, res) => {
  try {
    const user = req.session.user_id;
    const orderData = await Order.find({ user: user }).sort({ orderDate: -1 })
      .populate('user')
      .populate({
        path: 'address',
        model: 'Address',
      })
      .populate({
        path: 'items.product',
        model: 'Product',
      })

    res.render('orderdetails', { order: orderData, user })
  } catch (error) {
    console.log(error.message);
  }
}

const detailing = async (req, res) => {
  try {
    const user = req.session.user_id
    const orderId = req.query.orderId
    const orderData = await Order.findOne({ _id: orderId })
      .populate('user')
      .populate({
        path: 'address',
        model: 'Address',
      })
      .populate({
        path: 'items.product',
        model: 'Product',
      })
    res.render('detailing', { order: orderData, user })
  } catch (error) {
    console.log(error.message);
  }
}

const adminorderlist = async (req, res) => {
  try {
    const admin = req.session.adminData
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const totalcount = await Order.countDocuments();
    const totalPage = Math.ceil(totalcount / limit);
    const orders = await Order.find({}).sort({ orderDate: -1 })
      .populate('user')
      .populate({
        path: 'address',
        model: 'Address',
      })
      .populate({
        path: 'items.product',
        model: 'Product',
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ orderDate: -1 });
    res.render('orderlist', { orders, admin: admin, currentPage: page, totalPage })
  } catch (error) {
    console.log(error.message)
  }
}

const adminorderdetails = async (req, res) => {
  try {
    const admin = req.session.userData;
    const orderId = req.query.orderId

    const orderData = await Order.findOne({ _id: orderId })
      .populate('user')
      .populate({
        path: 'address',
        model: 'Address',
      })
      .populate({
        path: 'items.product',
        model: 'Product',
      })

    res.render('orderdetails', { order: orderData, admin });
  } catch (error) {
    console.log(error.message);
  }
}


const setStatus = async (req, res) => {
  try {
    const orderstatus = req.query.status;
    const orderId = req.query.orderId;
    const update = { $set: { status: orderstatus } }
    if (orderstatus == "Delivered") {
      update.$set.deliveryDate = Date.now();
      update.$set.paymentStatus = 'Payment Successful'
    } else if (orderstatus === "cancelled") {
      const orderData = await Order.findOne({ _id: orderId })
        .populate('user')
        .populate({
          path: 'items.product',
          model: 'Product',
        });
    }
    await Order.findByIdAndUpdate({ _id: orderId }, update);
    res.redirect('/admin/orderlist');
  } catch (error) {
    console.log(error.message)
  }
};

const cancelorder = async (req, res) => {
  try {
    const orderId = req.query.orderId
    let order = await Order.findOne({ _id: orderId })
      .populate('user')
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: 'items.product',
        model: 'Product',
      });
    const user = order.user;
    for (const item of order.items) {
      const productId = item.product._id;
      const orderedQuantity = item.quantity;
      const product = await Product.findById(productId);

      if (product) {
        product.quantity += orderedQuantity;
        await product.save();
      }
    }
    order.status = "Cancelled";
    if (
      order.paymentMethod == "wallet" ||
      (order.paymentMethod == "Pay online" &&
        order.paymentStatus == "Payment Successful")
    ) {
      order.paymentStatus = "Refunded";
    } else {
      order.paymentStatus = "Declined";
    }
    await order.save();

    if (
      order.paymentMethod == "wallet" ||
      order.paymentMethod == "Pay online"
    ) {
      user.walletBalance += order.totalAmount;
      await user.save();
      const transactiondebit = new Transaction({
        user: user._id,
        amount: order.totalAmount,
        type: "credit",
        paymentMethod: order.paymentMethod,
        orderId: order._id,
        description: `Credited to wallet`,
      });
      await transactiondebit.save();
    }


    res.redirect('/admin/orderlist');
  } catch (error) {
    console.log(error.message)
  }
}
const changeOrderStatus = async (req, res) => {
  try {
    const OrderStatus = req.query.status;
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate({
      path: "items.product",
      model: "Product",
    });
    if (OrderStatus == "Cancelled") {
      for (const item of order.items) {
        const productId = item.product._id;
        const orderedQuantity = item.quantity;
        const product = await Product.findById(productId);

        if (product) {
          product.quantity += orderedQuantity;
          await product.save();
        }
      }
    }
    if (OrderStatus == "Delivered") {
      order.deliveryDate = new Date();
      order.paymentStatus = "Payment Successful";
    }

    order.status = OrderStatus;
    if (req.query.reason) {
      order.reason = req.query.reason;

    }
    await order.save();

    if (req.query.orderDetails) {
      res.redirect(`/admin/orderDetails?orderId=${orderId}`);
    } else if (order.status == "Return Requested" || order.status == "Cancel Requested") {
      res.redirect(`/orderDetails?orderId=${orderId}`);
    } else {
      res.redirect("/admin/orderList");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body
    console.log(couponCode);
    const userId = req.session.user_id;
    const coupon = await Coupon.findOne({ code: couponCode })
    let errorMessage;
    if (!coupon) {
      errorMessage = "coupon not found"
      return res.json({ errorMessage })
    }
    const currentDate = new Date();

    if (coupon.expiry && currentDate > coupon.expiry) {
      errorMessage = "coupon expiry";
      return res.json({ errorMessage })
    }

    if (coupon.usersUsed.length >= coupon.limit) {
      errorMessage = "Coupon limit Reached";
      return res.json({ errorMessage });
    }
    if (coupon.usersUsed.includes(userId)) {
      errorMessage = "You already used this coupon";
      return res.json({ errorMessage });
    }
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
    const cartItems = cart.items || [];
    const orderTotal = calculateSubtotal(cartItems);

    if (coupon.type === 'fixed' && parseFloat(coupon.discount) > parseFloat(orderTotal)) {
      errorMessage = "Flat amount discount is higher than cart value";
    }

    if (coupon.minCartAmt > orderTotal) {
      errorMessage = "The amount is less than minimum Cart amount";
      return res.json({ errorMessage });
    }
    let discountedTotal = 0;

    if (coupon.type === "percentage") {
      discountedTotal = calculateDiscountedTotal(orderTotal, coupon.discount);
      console.log(discountedTotal);
    } else if (coupon.type === "fixed") {
      discountedTotal = orderTotal - coupon.discount;
      console.log(discountedTotal + "fixed");


    }
    if (coupon.maxReedemadbleAmt < discountedTotal) {
      errorMessage = "The Discount cant be applied. It is beyond maximum redeemable amount";
      return res.json({ errorMessage });
    }

    return res.json({ discountedTotal, errorMessage });
  } catch (error) {
    console.log(error.message);
  }
}

async function applyCoup(couponCode, discountedTotal, userId) {
  const coupon = await Coupon.findOne({ code: couponCode });
  console.log(couponCode);
  if (!coupon) {
    return { error: "Coupon not found." };
  }
  const currentDate = new Date();
  if (currentDate > coupon.expiry) {
    return { error: "Coupon has expired." };
  }
  if (coupon.usersUsed.length >= coupon.limit) {
    return { error: "Coupon limit reached." };
  }

  if (coupon.usersUsed.includes(userId)) {
    return { error: "You have already used this coupon." };
  }
  if (coupon.type === "percentage") {
    discountedTotal = calculateDiscountedTotal(
      discountedTotal,
      coupon.discount
    );
  } else if (coupon.type === "fixed") {
    discountedTotal = discountedTotal - coupon.discount;
  }
  coupon.limit--;
  coupon.usersUsed.push(userId);
  await coupon.save();
  return discountedTotal;
}

const createRazorpayOrder = async (amount) => {
  return new Promise((resolve, reject) => {
    const options = {
      amount: amount * 100,
      currency: "INR",
    };

    razorpay.orders.create(options, (error, order) => {
      if (error) {
        reject(error);
      } else {
        resolve(order);
      }
    });
  });
};

const razorpayOrder = async (req, res) => {
  try {
    
    const userId = req.session.user_id;
    const { address, paymentMethod, couponCode } = req.body;

    const user = await User.findById(userId);
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      console.error("User or cart not found.");
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (!product) {
        return res
          .status(400)
          .json({ success: false, error: "Product Not Found" });
      }

      if (product.quantity < cartItem.quantity) {
        return res
          .status(400)
          .json({ success: false, error: "Product Out Of Stock" });
      }
      const isDiscounted = product.discountStatus &&
        new Date(product.discountStart) <= new Date() &&
        new Date(product.discountEnd) >= new Date();

      const priceToConsider = isDiscounted ? product.discountPrice : product.price
      product.quantity -= cartItem.quantity;
      const GST = (18 / 100) * totalAmount;

      const itemTotal = priceToConsider * cartItem.quantity + GST;
      totalAmount += parseFloat(itemTotal.toFixed(2));

      await product.save();
    }

    if (couponCode) {
      totalAmount = await applyCoup(couponCode, totalAmount, userId);
    }
    totalAmount = parseInt(totalAmount);

    const order = new Order({
      user: userId,
      address: address,
      orderDate: new Date(),
      status: "Pending",
      paymentMethod: paymentMethod,
      deliveryDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
      totalAmount: totalAmount,
      items: cartItems.map(cartItem => {
        const product = cartItem.product;
        const isDiscounted = product.discountStatus &&
          new Date(product.discountStart) <= new Date() &&
          new Date(product.discountEnd) >= new Date();
        const priceToConsider = isDiscounted ? product.discountPrice : product.price;

        return {
          product: product._id,
          quantity: cartItem.quantity,
          price: priceToConsider,
        };
      }),
    });

    await order.save();

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: order._id,
    };

    razorpay.orders.create(options, async (err, razorpayOrder) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        return res
          .status(400)
          .json({ success: false, error: "Payment Failed", user });
      } else {
        res.status(200).json({
          message: "Order placed successfully.",
          order: razorpayOrder,
        });
      }
    });
  } catch (error) {
    console.error("An error occurred while placing the order: ", error);
    return res.status(400).json({ success: false, error: "Payment Failed" });
  }
};
const returnorder = async (req, res) => {
  try {
    const orderId = req.query.orderId;


    const order = await Order.findOne({ _id: orderId })
      .populate("user")
      .populate({
        path: "items.product",
        model: "Product",
      });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const user = order.user;
    user.walletBalance += order.totalAmount;
    await user.save();

    await order.save();

    for (const item of order.items) {
      const productId = item.product._id;
      const orderedQuantity = item.quantity;
      const product = await Product.findById(productId);

      if (product) {
        product.quantity += orderedQuantity;
        await product.save();
      }
    }

    const transactiondebit = new Transaction({
      user: user._id,
      amount: order.totalAmount,
      type: 'credit',
      paymentMethod: order.paymentMethod,
      orderId: order._id,
      description: `Credited from wallet`
    })
    await transactiondebit.save();
    order.status = "Return Successfull";
    order.paymentStatus = "Refunded";
    await order.save();
    res.redirect(`/admin/orderdetails?orderId=${orderId}`)
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  checkoutView,
  calculateProductTotal,
  calculateSubtotal,
  calculateDiscountedTotal,
  orderprocesses,
  ordersucess,
  orderDetails,
  detailing,
  adminorderlist,
  adminorderdetails,
  setStatus,
  cancelorder,
  changeOrderStatus,
  applyCoupon,
  createRazorpayOrder,
  razorpayOrder,
  returnorder
}
