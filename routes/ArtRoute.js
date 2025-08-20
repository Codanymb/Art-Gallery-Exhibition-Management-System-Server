const express = require("express");
const {AddArt,getAllArts, updateArt, deleteArt, getEachArt}= require ("../controllers/ArtController");
const router = express.Router();
const { owner, authenticatedUser , Clerk} = require("../middleware/authMiddleware");

router.post("/AddArt" ,owner,  AddArt);
router.get("/getArt" ,owner,  getEachArt);
router.get("/getEachArt/:art_piece_id" ,owner,  getEachArt);
router.put('/updateArt/:art_piece_id', owner, updateArt);
router.delete('/deleteArt/:art_piece_id', owner,deleteArt);


module.exports = router