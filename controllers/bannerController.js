
const Banner = require('../models/BannerModel');
const Category = require('../models/categoryModels');
const Product = require('../models/productModels');
const path = require('path');

const bannerload = async (req, res) => {
    try {
        const admin = req.session.adminData;
        const page = parseInt(req.query.page) || 1;
        let query = {};
        const limit = 7;
        const totalCount = await Banner.countDocuments(query);

        const totalPage = Math.ceil(totalCount / limit);

        if (req.query.bannerType) {
            if (req.query.bannerType === "New Arrival") {
                query.bannerType = "New Arrival";
            } else if (req.query.bannerType === "Deals and Promotions") {
                query.bannerType = "Deals and Promotions";
            } else if (req.query.bannerType === "Seasonal Sales") {
                query.bannerType = "Seasonal Sales";
            }
        }
        const banner = await Banner.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ startDate: -1 });
        res.render('banner', { admin, banner, currentPage: page, totalPage })
    } catch (error) {
        console.log(error.message);
    }
}

const banneraddload = async (req, res) => {
    try {
        const category = await Category.find()
        const product = await Product.find()
        const admin = req.session.adminData;
        res.render('banneradd', { category, product, admin })
    } catch (error) {
        console.log(error.message)
    }
}
const bannerAdd = async (req, res) => {
    try {
        const admin = req.session.adminData;
        let {

            title,
            subtitle,
            link,
            offer,
            fromDate,
            expiryDate,
        } = req.body;

        const newBanner = new Banner({
            title,
            image: req.file.filename,
            subtitle,
            link,
            offer,
            startDate: fromDate,
            endDate: expiryDate
        });
        newBanner.bannerType = req.body.bannerType;
        await newBanner.save();

        res.redirect('/admin/bannerlist')
    } catch (error) {
        console.log(error.message);
    }
}
const banneredit = async (req, res) => {
    try {
        let BannerId = req.query.bannerId;

        const banner = await Banner.findById(BannerId).populate("product")
        const startDate = banner.startDate ? new Date(banner.startDate).toISOString().split("T")[0] : "";
        const endDate = banner.endDate ? new Date(banner.endDate).toISOString().split("T")[0] : "";
        res.render('banneredit', {
            banner,
            startDate,
            endDate,
        });
    } catch (error) {
        console.log(error.message);
    }
}
const updatebanner = async (req, res) => {
    try {
        const id = req.query.bannerId
        console.log(id)
        const bannerData = await Banner.findById(id)

        console.log(bannerData);
        if (req.body.title) {
            bannerData.title = req.body.title;
        }
        if (req.body.bannerType) {
            bannerData.bannerType = req.body.bannerType;
        }
        if (req.body.link) {
            bannerData.link = req.body.link;
        }
        if (req.body.subtitle) {
            bannerData.subtitle = req.body.subtitle;
        }
        if (req.body.offer) {
            bannerData.offer = req.body.offer;
        }

        if (req.body.fromDate) {
            bannerData.startDate = req.body.fromDate;
        }
        if (req.body.expiryDate) {
            bannerData.endDate = req.body.expiryDate;
        }
        if (req.file) {
            bannerData.image = req.file.filename;
        }
        await bannerData.save();
        res.redirect('/admin/banneredit')
    } catch (error) {
        console.log(error.message);
    }
}
const blockbanner = async (req, res) => {
    try {
        const id = req.query.bannerId;
        const bannerData = await Banner.findById(id)

        if (bannerData.isListed === false) {
            bannerData.isListed = true;
        } else {
            bannerData.isListed = false;
        }
        await bannerData.save();
        res.redirect('/admin/bannerlist')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    bannerload,
    banneraddload,
    bannerAdd,
    banneredit,
    updatebanner,
    blockbanner
}