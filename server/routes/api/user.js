const express = require('express');
const router = express.Router();
const User = require("../../controllers/user.controller");

router.post("/deleteUser",  User.deleteUser);
router.post("/editUser",  User.editUser);
router.post("/getUser",  User.getUser);
router.post("/getUserList",  User.getUserList);

module.exports = router;