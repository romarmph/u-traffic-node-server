const router = require("express").Router();
const {
  createAdminAccount,
  updateAdminAccount,
} = require("../controllers/admin");

router.post("/admin/create", createAdminAccount);
router.post("/admin/update", updateAdminAccount);

module.exports = router;
