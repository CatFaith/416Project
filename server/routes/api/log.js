const express = require('express');
const router = express.Router();
const Log = require("../../controllers/log.controller");

router.post("/addLog",  Log.addLog);


module.exports = router;
