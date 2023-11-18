const router = require("express").Router();
const {
  createEnforcerAccount,
  resetEnforcerPassword,
} = require("../controllers/enforcer");

router.post("/enforcer/create", createEnforcerAccount);
router.post("/enforcer/reset", resetEnforcerPassword);

module.exports = router;
