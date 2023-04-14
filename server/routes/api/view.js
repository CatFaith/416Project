const express = require('express');
const router = express.Router();
const View = require("../../controllers/view.controller");

router.post("/addView",  View.addView);
router.post("/deleteView",  View.deleteView);
router.post("/getView",  View.getView);
router.post("/editView",  View.editView);
router.post("/getViewForGoogleSheet",  View.getViewForGoogleSheet);

module.exports = router;