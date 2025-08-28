const express = require("express");
const {AddExhibition,getAllEx,updateEx, deleteEx,getEachEx, addArtPieceToEx}= require ("../controllers/ExController");
const router = express.Router();
const { owner, authenticatedUser , clerk} = require("../middleware/authMiddleware");

router.post("/Add", owner , AddExhibition);
router.get("/getEx" ,  getAllEx);
router.get("/getEachEx/:exhibition_id" ,owner,  getEachEx);
router.put('/update/:exhibition_id', owner, updateEx);
router.delete('/delete/:exhibition_id', owner,deleteEx);
router.post("/AssignArt", owner , addArtPieceToEx)








module.exports = router