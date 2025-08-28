const express = require("express");
const {createCart,addToCart, removeFromCart, viewCart, checkOut }= require ("../controllers/CartController");
const router = express.Router();
const { owner, authenticatedUser , clerk} = require("../middleware/authMiddleware");

router.post("/create" ,authenticatedUser,  createCart);
router.post("/addCart" ,authenticatedUser,  addToCart);
router.delete("/removeFromCart", authenticatedUser,removeFromCart);
router.post("/buy" ,authenticatedUser,  checkOut);
router.get("/viewCart" ,authenticatedUser,  viewCart);

module.exports = router

