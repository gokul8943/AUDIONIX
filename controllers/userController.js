const User = require('../models/userModels');
const Products = require('../models/productModels');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModels');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const upload = require('multer');
const Banner = require('../models/BannerModel');


function generateOTP(length) {
    const characters = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
    }

    return otp;
}

// homepage

const loadHome = async (req, res) => {
    try {

        const currentDate = new Date();
        const categoryList = await Category.find({ is_listed: true });
        const productList = await Products.find({ is_listed: true });
        const banner = await Banner.find({
            startDate: { $lt: currentDate },
            endDate: { $gt: currentDate },
            isListed: true,
        }).populate("product");
        if (req.session.user_id) {
            const userData = req.session.user_id;
            res.render("home", {
                User: userData,
                category: categoryList,
                products: productList,
                banner,
            });
        } else {
            res.render("home", {
                category: categoryList,
                products: productList,
                banner,
                User: null,
            });
        }

    } catch (error) {
        console.log(error.message);
    }
}
// login

const loginload = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}



// signup

const signupload = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

// userinsert

const insertUser = async (req, res) => {
    try {
        console.log(req.body)
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.username,
            email: req.body.email,
            mobile: req.body.phone,
            password: spassword,

        });
        console.log(user)

        const userData = await user.save();
        if (userData) {
            req.session.user_id = userData._id;
            sendVerifyMail(req.body.username, req.body.email, userData._id, req);
            res.redirect('/registerOtp');
        } else {
            return res.status(500).send('Registration failed');
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('An error occurred while registering.');
    }
};
// otppage

const loadOtp = async (req, res) => {
    try {
        res.render('otpPage');
    } catch (error) {
        console.log(error.message);
    }
}

// for send mail


const sendVerifyMail = async (name, email, user_id, req) => {

    try {
        console.log("email is send")
        const otp = generateOTP(4);

        console.log(`Generated OTP: ${otp}`);
        req.session.otp = otp;
        req.session.otpGeneratedTime = Date.now();
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'audionix05@gmail.com',
                pass: 'vexp gyho lwyc wodu'
            }
        });

        const mailOptions = {
            from: 'audionix05@gmail.com',
            to: email,
            subject: 'For OTP verification ',
            text: `Your OTP: ${otp}`,
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("OTP has been sent:- ", info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }

}

//   verify the otp signup

const verifyOTP = async (req, res) => {
    try {
        const userOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;

        const storedOTP = req.session.otp;

        if (userOTP === storedOTP) {

            const userId = req.session.user_id;
            await User.updateOne({ _id: userId }, { $set: { is_verified: true } });

            delete req.session.otp;
            delete req.session.user_id;
            res.redirect('/login');
        } else {

            res.render('otpPage', { message: "Invalid OTP. Please try again." });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('An error occurred while verifying OTP.');
    }
};
//  otpPage load

const otpMatch = async (req, res) => {
    try {
        const otpGeneratedTime = req.session.otpGeneratedTime;
        res.render('otpPage', { otpGeneratedTime })
    } catch (error) {
        console.log(error.message)
    }
}


// resned otp

const resendOTP = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);

        if (userData) {
            const otpGeneratedTime = new Date().getTime();
            req.session.otpGeneratedTime = otpGeneratedTime;

            delete req.session.otp;

            sendVerifyMail(userData.name, userData.email, userData._id, req);

            res.render("otpPage", {
                message: "OTP has been resent.",
                otpGeneratedTime: otpGeneratedTime,
            });
        } else {
            res.render("otpPage", {
                message: "User not found",
                otpGeneratedTime: otpGeneratedTime,
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const resendverify = (req, res) => {
    try {
        const userOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;

        const storedOTP = req.session.otp;

        if (userOTP === storedOTP) {
            const userId = req.session.user_id;

            delete req.session.otp;
            res.redirect('/login')


        } else {
            res.render('otpPage', { message: "Invalid OTP. Please try again." });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('An error occurred while verifying OTP.');
    }
};

// loginverifiaction

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_verified == false) {
                    res.render("login", {
                        error: "please varify your mail.",
                        User: null,
                    });
                } else if (userData.is_blocked == 1) {
                    res.render("login", {
                        error: "Your Account is suspended",
                        User: null,
                    });

                }
                req.session.user_id = userData._id;
                res.redirect('/home');
            }
            else {
                res.render('login', { message: "Email and password is incorrect", email });
            }
        }
        else {
            res.render('home');
        }

    } catch (error) {
        console.log(error.message);
    }
};


//  login otp verification

const loginOtp = (req, res) => {
    try {
        const userOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;

        const storedOTP = req.session.otp;

        if (userOTP === storedOTP) {
            const userId = req.session.user_id;

            delete req.session.otp;
            res.redirect('/home')


        } else {
            res.render('otpPage', { message: "Invalid OTP. Please try again." });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('An error occurred while verifying OTP.');
    }
};


const emailgetting = async (req, res) => {
    try {
        res.render('email')
    } catch (error) {
        console.log(error.message);
    }
}

const mailverify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email })
        req.session.user_id = userData._id
        if (userData) {
            sendVerifyMail(userData.name, userData.email, userData._id, req);
            res.redirect('/otppage')
        } else {
            res.redirect('/forgot', { message: 'user is not found' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const otpcheck = async (req, res) => {
    try {
        res.render('otpPage')
    } catch (error) {
        console.log(error.message)
    }
}

const otpverifiy = async (req, res) => {
    try {
        const verifiyotp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;

        const storedotp = req.session.otp;
        if (verifiyotp === storedotp) {
            const userId = req.session.user_id;

            delete req.session.otp;
            res.redirect('/forgotpassword');
        }
        else {
            res.render('otpPage', { message: 'otp is incorrect' });
        }
    } catch (error) {
        console.log(error.message);
    }
}
const forgot = async (req, res) => {
    try {
        res.render('forgotpassword');
    } catch (error) {
        console.log(error.message);
    }
}

const forgotverifiy = async (req, res) => {
    try {
        const id = req.session.user_id;
        const password = req.body.password;
        const sPassword = await securePassword(password);
        const upadateData = await User.findByIdAndUpdate({ _id: id }, { $set: { password: sPassword } });
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
    }
}
const productlisting = async (req, res) => {
    try {

        const user = req.session.user_id;
        const page = parseInt(req.query.page);
        const searchQuery = req.query.search;

        const productsPerPage = 8;
        let query = { is_listed: true };

        const priceRanges = {
            under1K: { min: 0, max: 1000 },
            "1Kto3K": { min: 1000, max: 3000 },
            "3Kto6K": { min: 3000, max: 6000 },
            "6Kto100K": { min: 6000, max: 10000 },
            "10Kabove": { min: 10000, max: Number.MAX_VALUE },
        };
        if (searchQuery) {
            query.name = { $regex: new RegExp(searchQuery, "i") };
        }
        if (req.query.price && priceRanges[req.query.price]) {
            const { min, max } = priceRanges[req.query.price];
            query.price = { $gte: min, $lte: max };
        }

        if (req.query.category) {
            query.category =
                {
                    $in: Array.isArray(req.query.category)
                        ? req.query.category
                        : [req.query.category],
                } || "";
        }

        if (req.query.brand) {
            query.brand =
                {
                    $in: Array.isArray(req.query.brand)
                        ? req.query.brand
                        : [req.query.brand],
                } || "";
        }
        const totalCount = await Products.countDocuments(query);
        const totalPages = Math.ceil(totalCount / productsPerPage);

        const distinctValues = (
            await Products.aggregate([
                {
                    $group: {
                        _id: null,
                        categories: { $addToSet: "$category" },
                        brands: { $addToSet: "$brand" },

                    },
                },
            ])
        ).shift();
        const distinctCategories = {
            categories: distinctValues.categories || [],
            brands: distinctValues.brands || []
        };

        console.log(query);
        const products = await Products.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * productsPerPage)
            .limit(productsPerPage);

        res.render('productlisting', {
            user,
            Products: products,
            distinctValues: distinctCategories,
            totalPages,
            currentPage: page,
            query,
            req,
        });
    } catch (error) {
        console.log(error.message);
    }
}

const productview = async (req, res) => {
    try {
        const productId = req.query.productId
        const products = await Products.findById(productId);
        res.render('productView', { products });
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req, res) => {
    try {
        delete req.session.user_id
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}


const profilePage = async (req, res) => {
    try {
        const id = req.session.user_id
        const user = await User.findById(id)
        res.render('profile', { user: user });
    } catch (error) {
        console.log(error.message)
    }
}
const editprofile = async (req, res) => {
    try {
        const id = req.session.user_id
        const user = await User.findById(id);
        res.render('editprofile', { user })
    } catch (error) {
        console.log(error.message);
    }
}
const updateProfile = async (req, res) => {
    try {
        const id = req.session.user_id;
        const userData = await User.findById(id);
        console.log(userData);

        if (req.body.name) {
            userData.name = req.body.name;
        }
        if (req.body.email) {
            userData.email = req.body.email;
        }
        if (req.body.mobile) {
            userData.mobile = req.body.mobile
        }
        if (req.files) {
            userData.image = req.file.filename;
        }

        await userData.save();
        if (userData) {
            res.redirect('/profile');
        } else {
            res.redirect('/editprofile')
        }

    } catch (error) {
        console.log(error.message);
    }
}
const deactivateUser = async (req, res) => {
    try {
        const id = req.query.id;
        await User.deleteOne({ _id: id });
        delete req.session.user_id;
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}


const changepassword = async (req, res) => {
    try {
        const id = req.session.user_id;
        const userData = await User.findById(id);
        sendVerifyMail(userData.name, userData.email, userData._id, req);
        res.render('pageotp', { userData })
    } catch (error) {
        console.log(error.message)
    }
}
const changeverify = async (req, res) => {
    try {
        const verifiyotp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;

        const storedotp = req.session.otp;
        if (verifiyotp === storedotp) {
            const userId = req.session.user_id;

            delete req.session.otp;
            res.redirect('/passchange');
        }
        else {
            res.render('pageotp', { message: 'otp is incorrect' });
        }
    } catch (error) {
        console.log(error.message);
    }
}
const resetpassword = async (req, res) => {
    try {
        res.render('changepassword');
    } catch (error) {
        console.log(error.message);
    }
}
const resetverify = async (req, res) => {
    try {
        const id = req.session.user_id;
        const password = req.body.password;
        const sPassword = await securePassword(password);
        const upadateData = await User.findByIdAndUpdate({ _id: id }, { $set: { password: sPassword } });
        res.redirect('/profile');
    } catch (error) {
        console.log(error.message)
    }
}

const wallet = async (req, res) => {
    try {
        const id = req.session.user_id;
        const userData = await User.findById(id);
        const transactions = await Transaction.aggregate([
            { $match: { user: userData._id, paymentMethod: "wallet" } },
            { $sort: { date: -1 } },
        ]);
        console.log(userData, transactions);
        res.render('wallets', { user: userData, transactions })
    } catch (error) {
        console.log(error.message)
    }
};

module.exports = {
    loadHome,
    loginload,
    signupload,
    insertUser,
    loadOtp,
    sendVerifyMail,
    verifyOTP,
    verifyLogin,
    loginOtp,
    otpMatch,
    productlisting,
    emailgetting,
    mailverify,
    otpcheck,
    otpverifiy,
    forgot,
    forgotverifiy,
    logout,
    resendOTP,
    resendverify,
    productview,
    profilePage,
    editprofile,
    updateProfile,
    deactivateUser,
    changepassword,
    changeverify,
    resetpassword,
    resetverify,
    wallet


};
