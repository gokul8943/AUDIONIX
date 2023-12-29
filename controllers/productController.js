
const { Connection } = require('mongoose');
const Products = require('../models/productModels');
const Categories = require('../models/categoryModels');
const sharp = require('sharp');
const path = require('path');


const productlist = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const totalcount = await Products.countDocuments();
    const totalPage = Math.ceil(totalcount / limit);
    const product = await Products.find().sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ date: -1 })
    res.render('productlist', { Products: product, totalPage, currentPage: page, });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error")
  }
}
const productaddload = async (req, res) => {
  try {
    const categories = await Categories.find({ is_listed: true });
    res.render('productadd', { Categories: categories });
  } catch (error) {
    res.status(500).send("internal server error")
  }
}

const productadd = async (req, res) => {
  try {
    const name = req.body.name;
    const price = req.body.price;
    const discountPrice = req.body.discountPrice;
    const brand = req.body.brand;
    const color = req.body.color;
    const description = req.body.description;
    const type = req.body.type;
    const driverUnits = req.body.driverUnits;
    const batteryCapacity = req.body.batteryCapacity;
    const design = req.body.design;
    const quantity = req.body.quantity;
    const category = req.body.category;
    const connect = req.body.connect;
    const noise = req.body.noise;
    const microPhone = req.body.microPhone;
    const image = []
    if (req.files) {
      for (i = 1; i <= 4; i++) {
        const fieldName = `image${i}`;

        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];
          const sharpImage = sharp(file.path);

          const metadata = await sharpImage.metadata();
          const width = metadata.width;
          const height = metadata.height;

          const aspectRatio = width / height;

          const targetSize = { width: 700, height: 700 };

          if (width > targetSize.width || height > targetSize.height) {
            sharpImage.resize({
              width: targetSize.width,
              height: targetSize.height,
              fit: "cover",
            });
          } else {
            sharpImage.resize(targetSize.width, targetSize.height);
          }
          const tempFilename = `${file.filename.replace(
            /\.\w+$/,
            ""
          )}_${Date.now()}.png`;
          const resizedImagePath = path.join(
            __dirname,
            "../public/adminassets/productimages",
            tempFilename
          );
          await sharpImage.toFile(resizedImagePath);
          image.push(tempFilename);
        }
      }
    }
    const product = new Products({
      name: name,
      price: price,
      discountPrice: discountPrice,
      brand: brand,
      color: color,
      description: description,
      type: type,
      driverUnits: driverUnits,
      batteryCapacity: batteryCapacity,
      design: design,
      quantity: quantity,
      category: category,
      connect: connect,
      noise: noise,
      microPhone: microPhone,
      image: image,
    });

    const productData = await product.save();
    if (productData) {
      res.redirect('/admin/product');
    } else {
      res.redirect('/admin/productAdd')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const productedit = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Products.findById({ _id: id });
    if (productData) {
      const categories = await Categories.find();
      res.render('productedit', { productData, Categories: categories });
    } else {
      res.redirect('/admin/productedit');
      res.status(404).send("Page not found");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const updateproduct = async (req, res) => {
  try {
    const id = req.body.productId;
    const productData = await Products.findById(id);
    console.log(productData)
    if (!productData) {
      return res.status(404).send("Product not Found");
    }

    if (req.body.name) {
      productData.name = req.body.name;
    }
    if (req.body.price) {
      productData.price = req.body.price
    }
    if (req.body.discountPrice) {
      productData.discountPrice = req.body.discountPrice
    }

    if (req.body.description) {
      productData.description = req.body.description
    }
    if (req.body.brand) {
      productData.brand = req.body.brand;
    }
    if (req.body.color) {
      productData.color = req.body.color
    }
    if (req.body.type) {
      productData.type = req.body.type;
    }

    if (req.body.driverUnits) {
      productData.driverUnits = req.body.driverUnits
    }

    if (req.body.batteryCapcity) {
      productData.batteryCapcity = req.body.batteryCapcity
    };
    if (req.body.design) {
      productData.design = req.body.design
    }

    if (req.body.quantity) {
      productData.quantity = req.body.quantity
    }
    if (req.body.category) {
      productData.category = req.body.category
    }

    if (req.body.connect) {
      productData.connect = req.body.connect
    }
    if (req.body.noise) {
      productData.noise = req.body.noise
    }

    if (req.body.microPhone) {
      productData.microPhone = req.body.microPhone
    }
    if (req.body.deleteImages) {
      const imagesToDelete = req.body.deleteImages.split(",").map(Number);

      imagesToDelete.forEach((index) => {
        if (productData.image[index]) {
          productData.image.splice(index, 1);
        }
      });
    }

    for (let i = 1; i <= 4; i++) {
      const fieldName = `image${i}`;

      if (req.files && req.files[fieldName]) {
        const file = req.files[fieldName][0];

        const image = sharp(file.path);

        const metadata = await image.metadata();
        const width = metadata.width;
        const height = metadata.height;

        const targetSize = { width: 700, height: 700 };

        if (width > targetSize.width || height > targetSize.height) {
          image.resize({
            width: targetSize.width,
            height: targetSize.height,
            fit: "cover",
          });
        } else {
          image.resize(targetSize.width, targetSize.height);
        }

        const tempFilename = `${file.filename.replace(
          /\.\w+$/,
          ""
        )}_${Date.now()}.jpg`;
        const editedImagePath = path.join(
          __dirname,
          "../public/adminassets/productimages",
          tempFilename
        );
        await image.toFile(editedImagePath);

        productData.image[i - 1] = tempFilename;
      }
    }
    await productData.save();

    if (productData) {
      res.redirect('/admin/product')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const productblock = async (req, res) => {
  try {
    const productId = req.query.id
    const productData = await Products.findById(productId)
    if (productData.is_listed == true) {
      productData.is_listed = false;
    }
    else if (productData.is_listed == false) {
      productData.is_listed = true;
    }
    await productData.save();
    res.redirect('/admin/product')

  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  productlist,
  productaddload,
  productadd,
  productedit,
  updateproduct,
  productblock
}