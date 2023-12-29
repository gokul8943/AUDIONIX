const Address = require('../models/addressModels');
const { deleteOne } = require('../models/productModels');
const User = require('../models/userModels');

const addressview = async (req, res) => {
    try {
        const id = req.session.user_id
        const address = await Address.find({ user: id });
        res.render('address', { address })
    } catch (error) {
        console.log(error.message);
    }
}

const addaddressload = async (req, res) => {
    try {
        const userId = req.query.userId
        const userData = await User.findById(userId);
        res.render('addressadd', { user: userData })
    } catch (error) {
        console.log(error.message);
    }
}

const addaddress = async (req, res) => {
    try {
        const user = req.session.user_id;
        const name = req.body.name;
        const mobile = req.body.mobile;
        const pincode = req.body.pincode;
        const district = req.body.district;
        const address = req.body.address;
        const city = req.body.city;
        const state = req.body.state;
        const addresstype = req.body.addresstype;

        const addresses = new Address({
            user: user,
            name: name,
            mobile: mobile,
            pincode: pincode,
            district: district,
            address: address,
            city: city,
            state: state,
            addresstype: addresstype
        })
        const addressData = await addresses.save();
        if (req.query.checkout) {
            res.redirect('/checkout')
        } else {
            res.redirect('/address')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const addressedit = async (req, res) => {
    try {
        const id = req.query.id
        const addressData = await Address.findById(id);
        res.render('addressedit', { addressData });
    } catch (error) {
        console.log(error.message);

    }
}
const updateaddress = async (req, res) => {
    try {
        const id = req.body.addressId
        const addressData = await Address.findById(id)

        if (req.body.name) {
            addressData.name = req.body.name;
        }
        if (req.body.mobile) {
            addressData.mobile = req.body.mobile;
        }
        if (req.body.pincode) {
            addressData.pincode = req.body.pincode;
        }
        if (req.body.district) {
            addressData.district = req.body.district;
        }
        if (req.body.address) {
            addressData.address = req.body.address
        }
        if (req.body.city) {
            addressData.city = req.body.city
        }
        if (req.body.state) {
            addressData.state = req.body.state;
        }
        if (req.body.addresstype) {
            addressData.addresstype = req.body.addresstype;
        }

        await addressData.save();
        console.log(addressData);
        if (addressData) {
            res.redirect('/address')
        } else {
            res.render('addressedit', { message: "address not updated" })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const deleteaddress = async (req, res) => {
    try {
        const addressId = req.query.addressId
        const userId = req.query.userId
        await Address.deleteOne({ _id: addressId })

        const user = await User.findById(userId)
        const addresses = await Address.find({ user: userId })
        res.render('address', { addresses, user })
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    addressview,
    addaddressload,
    addaddress,
    addressedit,
    updateaddress,
    deleteaddress
};