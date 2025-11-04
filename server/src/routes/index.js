const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API v1' });
});

router.use('/users', require('./users'));
router.use('/auth', require('./auth'));
router.use('/incidents', require('./incidents'));
router.use('/employees', require('./employees'));

module.exports = router;
