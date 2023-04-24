const express = require('express');
const router = express.Router();
const App = require("../../controllers/app.controller");

router.post("/createApp",  App.createApp);
router.post("/deleteApp",  App.deleteApp);
router.post("/getApp",  App.getApp);
router.post("/editApp",  App.editApp);
router.post("/setPublished",  App.setPublished);
router.post("/shareApp",  App.shareApp);
router.post("/getAppAfterLogin",  App.getAppAfterLogin);
router.post("/checkAuthorization",  App.checkAuthorization);
// router.post("/getAppDetailById",  App.getAppDetailById);

module.exports = router;