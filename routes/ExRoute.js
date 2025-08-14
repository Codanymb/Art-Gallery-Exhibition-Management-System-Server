const express = require("express");
const {AddExhibition,getAllEx,updateEx, deleteEx}= require ("../controllers/ExController");
const router = express.Router();
const { owner, authenticatedUser , Clerk} = require("../middleware/authMiddleware");

router.post("/Add", owner , AddExhibition);
router.get("/getEx" ,owner,  getAllEx);
router.put('/update/:exhibition_id', owner, updateEx);
router.delete('/delete/:exhibition_id', owner,deleteEx);






module.exports = router