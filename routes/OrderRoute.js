const express = require ("express");
const { authenticatedUser , owner} = require("../middleware/authMiddleware");
const {  getAllOrders, UserOrder, getEachOrder} = require("../controllers/orderController");
const router = express.Router();



router.get("/get", owner, getAllOrders);
router.get("/MyOrder", authenticatedUser, UserOrder);
router.get("/getByID/:order_id", owner, getEachOrder);


module.exports = router