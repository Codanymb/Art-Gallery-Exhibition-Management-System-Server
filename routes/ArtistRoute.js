const express = require("express");
const {AddArtist, getAllArtists, updateArtist, deleteArtist}= require ("../controllers/ArtistController");
const router = express.Router();
const { owner, authenticatedUser , Clerk} = require("../middleware/authMiddleware");

router.post("/AddA" ,owner,  AddArtist);
router.get("/get" ,owner,  getAllArtists);
router.put('/update/:artist_id', owner, updateArtist);
router.delete('/deleteA/:artist_id', owner, deleteArtist);




module.exports = router