const express = require("express");
const router = express.Router();

const {getAllUsers} = require("./../controllers/user")
const {protect} = require('./../middleware/protect')

router.use(protect)

router.get("/", getAllUsers)

module.exports = router