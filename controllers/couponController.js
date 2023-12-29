const Coupon = require('../models/couponModels');
const User = require('../models/userModels')


const couponlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = 8;
        const totalCount = await Coupon.countDocuments();
        const totalPage = Math.ceil(totalCount / limit);
        const coupon = await Coupon.find().sort({ createdDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdDate: -1 });
        res.render('coupon', { coupon, currentPage: page, totalPage, limit })
    } catch (error) {
        console.log(error.message);
    }
}
const couponAddload = async (req, res) => {
    try {
        res.render('couponadd')
    } catch (error) {
        console.log(error.message)
    }
}
const couponadd = async (req, res) => {
    try {
        const admin = req.session.adminData
        let {
            couponcode,
            discount,
            expiryDate,
            limit,
            discountType,
            maxReedemableAmt,
            minCartAmt,
        } = req.body

        const newcoupon = new Coupon({
            code: couponcode,
            discount: discount,
            expiry: expiryDate,
            limit: limit,
            type: discountType,
            maxReedemadbleAmt: maxReedemableAmt,
            minCartAmt: minCartAmt,
        });

        await newcoupon.save();
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error.message);
    }
}
const couponedit = async (req, res) => {
    try {
        const couponId = req.query.couponId
        const couponData = await Coupon.findById({ _id: couponId });

        if (!couponData) {
            return res.status(404).send('Coupon not found');
        }

        const expiry = new Date(couponData.expiry).toISOString().split("T")[0];
        if (couponData) {
            res.render('couponedit', { couponData, expiry });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error')
    }
}
const updatecoupon = async (req, res) => {
    try {
        const couponId = req.body.couponId
        console.log(couponId);
        const couponData = await Coupon.findById(couponId)
        if (req.body.couponcode) {
            couponData.code = req.body.couponcode
        }
        if (req.body.discount) {
            couponData.discount = req.body.discount
        }
        if (req.body.expiryDate) {
            couponData.expiry = req.body.expiryDate
        }
        if (req.body.limit) {
            couponData.limit = req.body.limit
        }
        if (req.body.discountType) {
            couponData.type = req.body.discountType
        }
        if (req.body.maxReedemableAmt) {
            couponData.maxReedemadbleAmt = req.body.maxReedemableAmt
        }
        if (req.body.minCartAmt) {
            couponData.minCartAmt = req.body.minCartAmt
        } await couponData.save();
        if (couponData) {
            res.redirect('/admin/coupon')
        } else {
            res.render('couponedit', { message: "coupon is not updated" });
        }
    } catch (error) {
        console.log(error.message)
    }
}

const blockcoupon = async (req, res) => {
    try {
        const id = req.query.couponId;
        const couponData = await Coupon.findById({ _id: id });
        if (couponData.is_listed === false) {
            couponData.is_listed = true;
        } else {
            couponData.is_listed = false;
        }
        await couponData.save();
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message)
    }
}

const coupondetails = async (req, res) => {
    try {
        const admin = req.session.adminData;
        const couponId = req.query.couponId
        const coupon = await Coupon.findById(couponId)
            .populate("usersUsed")
            .sort({ _id: -1 })
            .exec();
        const users = coupon.usersUsed;
        res.render('couponDetails', { coupon, admin, users })
    } catch (error) {
        console.log(error.message);
    }
}
const userCoupon = async (req, res) => {
    try {
        const currentDate = new Date();
        const user = req.session.user_id;
        const coupon = await Coupon.find({
            expiry: { $gt: currentDate },
            is_listed: true,
        }).sort({ createdate: -1 })
        res.render('coupon', { user, coupon })
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    couponlist,
    couponAddload,
    couponadd,
    couponedit,
    updatecoupon,
    userCoupon,
    blockcoupon,
    coupondetails

}