const express = require("express");
const {AddArt}= require ("../controllers/ArtController");
const router = express.Router();
const { owner, authenticatedUser , Clerk} = require("../middleware/authMiddleware");

router.post("/AddArt" ,owner,  AddArt);





module.exports = router