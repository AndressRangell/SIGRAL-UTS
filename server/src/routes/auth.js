const { Router } = require('express');
const { login, me } = require('../controllers/authController');
const { authJwt } = require('../middlewares/authJwt');

const router = Router();

router.post('/login', login);
router.get('/me', authJwt(true), me);

module.exports = router;





