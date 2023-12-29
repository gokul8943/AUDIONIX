const Categories = require('../models/categoryModels');
const bcrypt = require('bcrypt');
const upload = require('multer');


const categoryload = async (req, res) => {
  try {
    const categories = await Categories.find();
    res.render('category', { Categories: categories, req });
  } catch (error) {
    console.log(error.message);
  }
}

const categoryAdd = async (req, res) => {
  try {
    let category = new Categories({
      name: req.body.name,
      description: req.body.description,
      image: req.file.filename,
      is_listed: true,
    });
    const existingCategory = await Categories.findOne({ name: { $regex: new RegExp(category.name, "i") } });
    if (existingCategory) {
      res.redirect('/admin/category?existCategory=true')
    } else {
      const CategoryData = await category.save();

      if (CategoryData) {
        res.redirect('/admin/category')
      } else {
        res.redirect('/admin/category', { message: 'category not added' });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}
const categoryEdit = async (req, res) => {
  try {

    const id = req.query.id;
    const categoryData = await Categories.findById(id);
    if (categoryData) {
      res.render('categoryedit', { categoryData, req });
    }
    else {
      res.redirect('/admin/category');
    }
  }
  catch (error) {
    console.log(error.message);
  }
}

const updatecategory = async (req, res) => {
  try {
    const id = req.body.categoryId;
    const categoryData = await Categories.findById(id);

    if (req.body.name) {
      categoryData.name = req.body.name;
    }
    if (req.body.description) {
      categoryData.description = req.body.description;
    }
    if (req.file) {
      categoryData.image = req.file.filename;
    }
    const existingCategory = await Categories.findOne({ name: { $regex: new RegExp(categoryData.name, "i") } });
    if (existingCategory) {
      res.redirect('/admin/category?existCategory=true')
    } else {
      const categoryEdit = await categoryData.save();

      if (categoryEdit) {
        res.redirect('/admin/categoryedit');
      } else {
        res.render('', { message: 'Category not updated' });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}
const categoryBlock = async (req, res) => {
  try {
    const categoryId = req.query.id
    const categoryData = await Categories.findById(categoryId)
    if (categoryData.is_listed == true) {
      categoryData.is_listed = false;
    }
    else if (categoryData.is_listed == false) {
      categoryData.is_listed = true;
    }
    await categoryData.save();
    res.redirect('/admin/category');
  } catch (error) {
    console.log(error.message);
  }

}

module.exports = {
  categoryload,
  categoryAdd,
  categoryEdit,
  updatecategory,
  categoryBlock
}