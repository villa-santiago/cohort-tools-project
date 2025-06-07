const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");


const router = express.Router();
const saltRounds = 10;

// POST /auth/signup
router.post('/signup', (req, res, next) =>{
    console.log("SIGNUP ROUTE IS WORKING");
    const {email, password, name} = req.body;

    if(email === "" || password === "" || name === ""){
        res.status(400).json({message:"A required field is missing"});
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailRegex.test(email)){
        res.status(400).json({message: "Provide a valid email address."});
        return
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if(!passwordRegex.test(password)){
        res.status(400).json({message:"Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter."});
        return;
    }

    User.findOne({email})
    .then((foundUser) => {
        if(foundUser) {
            res.status(400).json({message:"User already exists"});
            return;
        }

        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);

        return User.create({email, password:hashedPassword, name});
    })
    .then ((createdUser) =>{

        const{email, name, _id} = createdUser;

        const user = {email, name, _id};

        res.status(201).json({user: user});
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({message:"Internal explosion"});
    });
});

// POST /auth/login
router.post('/login', (req, res, next) => {
    const {email, password} = req.body;

    if(email === "" || password === ""){
        res.status(400).json({message: "Provide email and password"});
        return;
    }

    User.findOne({email})
    .then((foundUser) => {
        if(!foundUser){
            console.log("User not found for email", email);
            res.status(401).json({message:"User not found"});
            return;
        }

        console.log("Found user:", foundUser);
        console.log("Stored hashed password:", foundUser.password);

        const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

        if(passwordCorrect){
            console.log("Password correct, creating token");

            const{ _id, email, name} = foundUser;
            const payload = { _id, email, name};

            console.log("JWT payload:", payload);
            console.log("JWT secret from env:", process.env.TOKEN_SECRET);

            const authToken = jwt.sign(
                payload,
                process.env.TOKEN_SECRET,
                {algorithm: 'HS256', expiresIn:"6h"}
            );

            console.log("Auth token created successfully.");

            res.status(200).json({authToken:authToken});
        }
        else {
            console.log("Incorrect password for user:", email);
            res.status(401).json({message:"Unable to authenticate"});
        }
    })
    .catch(err => {
  console.error("Login error:", err);
  res.status(500).json({ message: "Auth error", error: err.message });
});
});

// GET /auth/verify
router.get('/verify', isAuthenticated, (req, res, next) => {
    
    console.log('req.payload', req.payload);

    res.status(200).json(req.payload);

});

module.exports = router;
