const express = require("express");
const {
  sendNormalEmail,
  sendFreelancingEmail,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/normal", sendNormalEmail);
router.post("/freelancing", sendFreelancingEmail);

module.exports = router;
