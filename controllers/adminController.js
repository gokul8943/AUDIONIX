const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const Order = require('../models/ordermodel');
const category = require('../models/categoryModels');
const Product = require('../models/productModels');
const dateUtils = require('../helpers/dateUtils')
const { getDailyDataArray,
  getMonthlyDataArray,
  getYearlyDataArray,
} = require('../helpers/charDate');

const loginLoad = async (req, res) => {
  try {
    res.render('adminLogin');
  } catch (error) {
    console.log(error.message);
  }
}

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await User.findOne({ email: email });
    if (adminData) {
      const passwordMach = await bcrypt.compare(password, adminData.password);
      if (passwordMach) {
        if (adminData.is_superAdmin == 1) {
          req.session.adminData = adminData;
          req.session.admin = adminData.id;
          res.redirect("/admin/dashboard");
        } else {
          res.render("login", { error: "You are not authorised to login" });
        }
      } else {
        res.render("login", { error: "Email and password is incorrect" });
      }
    } else {
      res.render("login", { error: "Email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadDashboard = async (req, res) => {
  try {
    const [
      totalRevenue,
      totalUsers,
      totalOrders,
      totalProducts,
      totalCategories,
      orders,
      monthlyEarnings,
      newUsers,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'Payment Successful' } },
        { $group: { _id: null, totalAmount: { $sum: 'totalAmount' } } },
      ]),
      User.countDocuments({ is_blocked: false, is_verified: true }),
      Order.countDocuments(),
      Product.countDocuments(),
      category.countDocuments(),
      Order.find().limit(10).sort({ orderDate: -1 }),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Payment Successful",
            orderDate: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
              )
            },
          },
        },
        { $group: { _id: null, monthlyAmount: { $sum: "$totalAmount" } } },
      ]),
      User.find({ is_blocked: false, is_verified: true })
        .sort({ date: -1 })
        .limit(5),
    ]);
    const adminData = req.session.adminData;
    const totalRevenueValue =
      totalRevenue.lenght > 0 ? totalRevenue[0].totalAmount : 0;
    const monthlyEarningsValue =
      monthlyEarnings.lenght > 0 ? monthlyEarnings[0].monthlyAmount : 0;

    const monthlyDataArray = await getMonthlyDataArray();
    const dailyDataArray = await getDailyDataArray();
    const yearlyDataArray = await getYearlyDataArray();

    res.render('dashboard', {
      admin: adminData,
      orders,
      newUsers,
      totalRevenue: totalRevenueValue,
      totalOrders,
      totalProducts,
      totalCategories,
      totalUsers,
      monthlyEarnings: monthlyEarningsValue,
      monthlyMonths: monthlyDataArray.map((item) => item.month),
      monthlyOrderCounts: monthlyDataArray.map((item) => item.count),
      dailyDays: dailyDataArray.map((item) => item.day),
      dailyOrderCounts: dailyDataArray.map((item) => item.count),
      yearlyYears: yearlyDataArray.map((item) => item.year),
      yearlyOrderCounts: yearlyDataArray.map((item) => item.count),
    });
  } catch (error) {
    console.log(error.message);
  }
}

// user listing

const userload = async (req, res) => {
  try {

    const admin = req.session.adminData
    const user = await User.find();
    res.render('userlist', { users: user, admin });
  } catch (error) {
    console.log(error.message);
  }
}

const blockuser = async (req, res) => {
  try {
    const userId = req.query.id;
    const action = req.query.action;

    if (action === 'block') {
      await User.findByIdAndUpdate(userId, { is_blocked: 1 });
      delete req.session.user_id;
    } else if (action === 'unblock') {
      await User.findByIdAndUpdate(userId, { is_blocked: 0 });
    }

    res.redirect('userlist');
  } catch (error) {
    console.log(error.message);
  }
}

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/admin')
  } catch (error) {
    console.log(error.message)
  }
}

const salesreport = async (req, res) => {
  try {
    const admin = req.session.adminData

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    let query = { paymentStatus: "Payment Successful" };
    if (req.query.paymentMethod) {
      if (req.query.paymentMethod === "Online Payment") {
        query.paymentMethod = "Online Payment"
      } else if (req.query.paymentMethod === "wallet") {
        query.paymentMethod = "wallet"
      } else if (req.query.paymentMethod === "cash on Delivery") {
        query.paymentMethod = "Cash On Delivery"
      }
    }
    if (req.query.status) {
      if (req.query.status === "Daily") {
        query.orderDate = dateUtils.getDailyDateRange();
      } else if (req.query.status === "weekly") {
        query.orderDate = dateUtils.getDailyDateRange();
      } else if (req.query.status === "yearly") {
        query.orderDate = dateUtils.getDailyDateRange();
      }
    }

    if (req.query.startDate && req.query.endDate) {
      query.orderDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }
    console.log(query);
    const totalOrdersCount = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrdersCount / perPage);
    const skip = (page - 1) * perPage;

    const orders = await Order.find(query)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(perPage);

    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalAmount,
      0
    );

    const returnedOrder = orders.filter(
      (order) => order.status === 'Returned'
    );

    const totalSales = orders.length;

    const totalProductssold = orders.reduce(
      (acc, order) => acc + order.items.length, 0
    );
    res.render('salesreport', {
      orders,
      admin,
      totalRevenue,
      returnedOrder,
      totalSales,
      totalProductssold,
      req,
      totalPages,
      currentPage: page,
    })

  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loginLoad,
  verifyLogin,
  loadDashboard,
  userload,
  blockuser,
  logout,
  salesreport
};
