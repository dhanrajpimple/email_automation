const express = require("express");
const {
  sendNormalEmail,
  sendFreelancingEmail,
  sendAgentEmail,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/normal", sendNormalEmail);
router.post("/freelancing", sendFreelancingEmail);
router.post("/agent", sendAgentEmail);

module.exports = router;
