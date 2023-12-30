const express = require('express');
const admin_route = express();
const controller = require("../controllers/adminController");
const controllers = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController');
const excelController = require('../controllers/excelController');
const multer = require('multer');
const path = require('path')
const fs = require('fs')
const { isLogin, isLogout } = require("../middleware/adminAuth");


admin_route.set('views', './views/admin');
admin_route.use(express.static('public'));

const {upload,bannerUpload,uploadFields } = require('../config/multer')


admin_route.get('/', isLogout, controller.loginLoad);
admin_route.post('/', controller.verifyLogin);
admin_route.get('/dashboard', isLogin, controller.loadDashboard);

admin_route.get('/logout', isLogin, controller.logout);

// userlist
admin_route.get('/userlist', isLogin, controller.userload);

admin_route.get('/blockuser', isLogin, controller.blockuser);


// category
admin_route.get('/category', isLogin, controllers.categoryload);
admin_route.post('/category', upload.single('image'), controllers.categoryAdd);

admin_route.get('/categoryedit', isLogin, controllers.categoryEdit);
admin_route.post('/categoryedit', upload.single('image'), controllers.updatecategory);

admin_route.get('/categoryblock', controllers.categoryBlock);

// product
admin_route.get('/product', isLogin, productController.productlist);

admin_route.get('/productAdd', isLogin, productController.productaddload);
admin_route.post('/product', uploadFields, productController.productadd);

admin_route.get('/productedit', isLogin, productController.productedit);
admin_route.post('/productedit', uploadFields, productController.updateproduct);

admin_route.get('/productblock', productController.productblock);


// order
admin_route.get('/orderlist', isLogin, orderController.adminorderlist);

admin_route.get('/orderdetails', isLogin, orderController.adminorderdetails)

admin_route.get('/orderstatus', isLogin, orderController.setStatus)

admin_route.get('/refundOrder', isLogin, orderController.returnorder)
admin_route.get('/cancelOrder', isLogin, orderController.cancelorder)
// coupon
admin_route.get('/coupon', isLogin, couponController.couponlist);

admin_route.get('/couponadd', isLogin, couponController.couponAddload);
admin_route.post('/couponadd', couponController.couponadd);

admin_route.get('/couponedit', isLogin, couponController.couponedit)
admin_route.post('/couponedit', couponController.updatecoupon)

admin_route.post('/couponUnlist', couponController.blockcoupon);
admin_route.get('/couponDetails', isLogin, couponController.coupondetails);
admin_route.get('/couponblock', couponController.blockcoupon);

// banner
admin_route.get('/bannerlist', isLogin, bannerController.bannerload);

admin_route.get('/banneradd', isLogin, bannerController.banneraddload);
admin_route.post('/banneradd', bannerUpload.single('image'), bannerController.bannerAdd)

admin_route.get('/banneredit', isLogin, bannerController.banneredit)
admin_route.post('/banneredit', bannerController.updatebanner)

admin_route.post('/blockBanner', bannerController.blockbanner)

// salesreport
admin_route.get('/salesReport', isLogin, controller.salesreport);

admin_route.get('/excelsalesreport', isLogin, excelController.getExcelSalesReport)

module.exports = admin_route;
