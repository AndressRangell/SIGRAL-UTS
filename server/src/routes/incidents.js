const { Router } = require('express');
const { authJwt, requireRole } = require('../middlewares/authJwt');
const { body, validationResult } = require('express-validator');
const { createIncident, listIncidents, stats } = require('../controllers/incidentController');

const router = Router();

router.get('/', authJwt(true), listIncidents);
router.post(
  '/',
  authJwt(true),
  // require admin or user? assume both roles can create; enforce auth only; adjust if needed
  [
    body('employee').isMongoId(),
    body('dateTime').isISO8601(),
    body('eventType').isString().isLength({ min: 2 }),
    body('eventClassification').isString().isLength({ min: 2 }),
    body('causativeAgent').isString().isLength({ min: 2 }),
    body('bodyPartAffected').isString().isLength({ min: 2 }),
    body('consequence').isString().isLength({ min: 2 }),
    body('shift').isString().isLength({ min: 2 }),
    body('location').isString().isLength({ min: 2 }),
    body('witnesses').optional().isArray(),
    body('witnesses.*').optional().isString(),
    body('preventiveAction').optional().isString(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createIncident
);
router.get('/stats', authJwt(true), stats);

module.exports = router;



