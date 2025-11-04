const Employee = require('../models/Employee');

async function listEmployees(req, res, next) {
  try {
    const items = await Employee.find({ active: true }).sort({ fullName: 1 }).limit(500);
    res.json(items);
  } catch (err) { next(err); }
}

async function createEmployee(req, res, next) {
  try {
    const item = await Employee.create(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function findByDocument(req, res, next) {
  try {
    const { documentId } = req.params;
    const e = await Employee.findOne({ documentId, active: true });
    if (!e) return res.status(404).json({ message: 'Empleado no encontrado' });
    res.json(e);
  } catch (err) { next(err); }
}

module.exports = { listEmployees, createEmployee, findByDocument };


