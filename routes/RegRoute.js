const express = require("express");
const {registerForExhibition, getAllReg,getEachReg}= require ("../controllers/RegController");
const router = express.Router();
const { owner, authenticatedUser , clerk} = require("../middleware/authMiddleware");

router.post("/exReg" ,authenticatedUser,  registerForExhibition);
router.get("/getReg" ,clerk,  getAllReg);
router.get("/getEachReg/:registration_id" ,clerk,  getEachReg);


module.exports = router