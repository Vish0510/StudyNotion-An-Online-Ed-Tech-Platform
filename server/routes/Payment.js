const express = require("express");
const router = express.Router();

// Import Controller
const { capturePayment, verifySignature } = require('../controllers/Payments');
// import middlewares
const { auth, isInstructor, isStudent, isAdmin } = require('../middlewares/auth');

// define routes
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", verifySignature);

module.exports = router;