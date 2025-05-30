const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student.model");
const PORT = 5005;

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
const cohorts = require('./cohorts.json');
const students = require('./students.json');


// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();


// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//MONGOOSE
mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api")
  .then(x => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to MongoDB", err));


// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/", (req, res) => {
  res.send("Welcome to the Cohort Tools API!");
});

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

app.get("/api/cohorts", (req, res) => {
  res.json(cohorts);
});

app.get("/api/students", (req, res) => {
  Student.find({})
  .then((students) => {
    console.log("Retreived students:", students);
    res.json(students);
  })
  .catch((error) => {
    console.error("Error", error);
    res.status(500).json({error:"Failed"});
  });
});


// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});