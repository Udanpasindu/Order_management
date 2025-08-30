const Department = require('../models/Department');

exports.list = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const dept = new Department({ name, description });
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
