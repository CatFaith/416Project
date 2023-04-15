const express = require('express');
const router = express.Router();
const View = require("../../controllers/view.controller");

router.post("/addView",  View.addView);
router.post("/deleteView",  View.deleteView);
router.post("/getView",  View.getView);
router.post("/editView",  View.editView);
router.post("/getViewForGoogleSheet",  View.getViewForGoogleSheet);
router.post("/addViewToGoogleSheet",  View.addViewToGoogleSheet);
router.post("/addRecordToGoogleSheet",  View.addRecordToGoogleSheet);
router.post("/editRecordToGoogleSheet",  View.editRecordToGoogleSheet);
router.post("/deleteRecordToGoogleSheet",  View.deleteRecordToGoogleSheet);

module.exports = router;