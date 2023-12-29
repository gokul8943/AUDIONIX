const express = require('express');
const user_route = express();
const controller = require('../controllers/userController');
const addressController = require('../controllers/addressController');
const cartcontroller = require('../controllers/cartController');
const ordercontroller = require('../controllers/orderController');
const couponController = require('../controllers/couponController')
const pdfController = require('../controllers/pdfContoller')
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('../config/config');
const multer = require('multer');
const {isLogin,isLogout} =require('../middleware/auth');
const nocahce = require('nocache');
const  wishlistController  = require('../controllers/wishlistController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/assets/userprofile'); 
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage: storage });

user_route.set('views','./views/user');

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

user_route.use(nocahce())

// home

user_route.get('/',isLogout,controller.loadHome);

// login
user_route.get('/login',isLogout,controller.loginload);
user_route.post('/login',controller.verifyLogin);

user_route.get('/logout',isLogin,controller.logout)

user_route.get('/home',isLogin,controller.loadHome);

user_route.get('/forgot',isLogout,controller.emailgetting);
user_route.post('/forgot',controller.mailverify);

user_route.get('/otppage',controller.otpMatch);                                              
user_route.post('/otppage',controller.otpverifiy);

user_route.get('/forgotpassword',isLogout,controller.forgot);
user_route.post('/forgotpassword',controller.forgotverifiy);


  
// signup
user_route.get('/signup',isLogout,controller.signupload);
user_route.post('/signup',controller.insertUser);

user_route.get('/registerOtp',controller.otpMatch);
user_route.post('/registerOtp',controller.verifyOTP);

user_route.get('/resendotp',controller.resendOTP);
user_route.post('/resendotp',controller.resendverify);



// productlisting
user_route.get('/shop',controller.productlisting);

user_route.get('/productview',controller.productview);


// profile
user_route.get('/profile',isLogin,controller.profilePage);

user_route.get('/editprofile',isLogin,controller.editprofile);
user_route.post('/profiledit',upload.single('image'),controller.updateProfile);

// chnagepassword
user_route.get('/changepassword',controller.changepassword)
user_route.post('/changepassword',controller.changeverify);

user_route.get('/passchange',isLogin,controller.resetpassword)
user_route.post('/passchange',controller.resetverify);

// address
user_route.get('/address',isLogin,addressController.addressview);

user_route.get('/addressadd',isLogin,addressController.addaddressload);
user_route.post('/addressadd',addressController.addaddress);

user_route.get('/addressedit',isLogin,addressController.addressedit);
user_route.post('/addressedit',addressController.updateaddress);


// cart
user_route.get('/cart',isLogin,cartcontroller.cartview)
user_route.post('/addtocart',cartcontroller.addtocart)

user_route.put("/updateCart",cartcontroller.updatecartcount);
user_route.delete("/removeCartItem",cartcontroller.removeCart);

// order

user_route.get('/checkout',isLogin,ordercontroller.checkoutView);
user_route.post('/orderplaced',ordercontroller.orderprocesses)

user_route.get('/ordersucess',isLogin,ordercontroller.ordersucess);

user_route.get('/orderdetails',isLogin,ordercontroller.orderDetails)

user_route.get('/details',isLogin,ordercontroller.detailing);

user_route.get("/cancelOrder", isLogin,ordercontroller.changeOrderStatus);
user_route.get('/returnOrder',isLogin,ordercontroller.changeOrderStatus);

// coupon
user_route.get('/coupon',couponController.userCoupon);
user_route.post('/applyCoupon',ordercontroller.applyCoupon)
// razorpay
user_route.post('/razorpayOrder',ordercontroller.razorpayOrder)

// wallet
user_route.get('/wallet',controller.wallet);

// invoice
user_route.get('/generate-invoice/:orderId',pdfController.generateInvoice)

// wishlist
user_route.get('/wishlist',isLogin,wishlistController.wishlist);
user_route.post('/addtowishlist',wishlistController.wishlistAdd);
user_route.delete('/removewishlist',wishlistController.removeFrom);

module.exports = user_route;