const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const { department } = req.query;
    const categories = await Category.findAll(department);
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById
};
