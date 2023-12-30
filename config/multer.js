const multer = require('multer')
const path = require('path');



// category multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/adminassets/categoryimages');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

  

  // product multer
const storages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/adminassets/productimages'));
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    }
  });
  
  const uploads = multer({
    storage: storages,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
  const uploadFields = uploads.fields([
    { name: "image1" },
    { name: "image2" },
    { name: "image3" },
    { name: "image4" },
  ]);


  const bannerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../public/adminassets/bannerimages"));
    },
    filename: (req, file, cb) => {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });
  const bannerUpload = multer({ storage: bannerStorage });
  

  module.exports = {
  upload,
  uploadFields,
  bannerUpload
  }