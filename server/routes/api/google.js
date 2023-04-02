const express = require('express');
const router = express.Router();
const View = require("../../controllers/google.controller");

router.post("/getGoogleSheetData",  View.getGoogleSheetData);
router.post("/editGoogleSheetData",  View.editGoogleSheetData);

module.exports = router;