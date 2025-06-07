const express = require("express");
const User = require("../models/User.model");
const {isAuthenticated} = require("../middleware/jwt.middleware");

const router = express.Router();

router.get("/api/users/:userId", isAuthenticated, (req, res) => {
const {userId} = req.params;

User.findById(userId)
.then(user => {
    if(!user) {
        return res.status(404).json({message:"User not found"}); 
    }
    res.status(200).json(user);
})
.catch(err => {
    console.error("Error retrieving user:", err);
    res.status(500).json({message:"Error"});
});
});

module.exports = router;