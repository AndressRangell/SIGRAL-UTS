const { Router } = require('express');
const { authJwt, requireRole } = require('../middlewares/authJwt');
const { listEmployees, createEmployee, findByDocument } = require('../controllers/employeeController');

const router = Router();

router.get('/', authJwt(true), listEmployees);
router.get('/by-document/:documentId', authJwt(true), findByDocument);
router.post('/', authJwt(true), requireRole('admin'), createEmployee);

module.exports = router;


