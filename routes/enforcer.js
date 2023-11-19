const router = require("express").Router();
const {
  createEnforcerAccount,
  updateEnforcerAccount,
} = require("../controllers/enforcer");

router.post("/enforcer/create", createEnforcerAccount);
router.post("/enforcer/update", updateEnforcerAccount);

module.exports = router;
