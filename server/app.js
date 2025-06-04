const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student.model");
const Cohort = require("./models/Cohort.model");
const PORT = 5005;

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// const cohorts = require('./cohorts.json');
// const students = require('./students.json');


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


//COHORT ROUTES

//Fetch all cohorts
app.get("/api/cohorts", (req, res) => {
  Cohort.find().then(allCohorts => {
    res.status(200).json(allCohorts);
  }).catch(error => res.status(500).json(error));
});

//Fetch cohort by ID
app.get("/api/cohorts/:id", (req, res) => {
  const {id} = req.params;
  Cohort.findById(id).then(foundCohort =>{
    res.status(200).json(foundCohort);
  }).catch(error => res.status(500).json(error))
});

//Create a new cohort
app.post("/api/cohorts", (req, res) =>{
  const {cohortSlug, cohortName, program, format, campus, startDate, endDate, inProgress, programManager, leadTeacher, totalHours} = req.body;
  Cohort.create({cohortSlug, cohortName, program, format, campus, startDate, endDate, inProgress, programManager, leadTeacher, totalHours}).then(newCohort => {
    res.status(201).json(newCohort);
  }).catch(error => res.status(500).json(error));
});

//Edit an existing cohort
app.put("/api/cohorts/:id", (req, res)=>{
  const {id} = req.params;
  Cohort.findByIdAndUpdate(id, req.body, {new:true}).then(editedCohort=>{
    res.status(200).json(editedCohort);
  }).catch(error => res.status(500).json(error));
});

//Delete a specific cohort
app.delete("/api/cohorts/:id", (req, res)=>{
  const {id} = req.params;
  Cohort.findByIdAndDelete(id).then(()=>{
    res.status(204).json({message: `Cohort ${id} has been deleted`});
  }).catch(error => res.status(500).json(error));
});




//STUDENT ROUTES

//Fetch all students
// app.get("/api/students", (req, res) =>{
//   Student.find().then(allStudents => {
//     res.status(200).json(allStudents);
//   }).catch(error => res.status(500).json(error));
// });

app.get("/api/students", (req, res) => {
  Student.find()
  .populate("cohort")
  .then((allStudents) => {
    res.status(200).json(allStudents);
  }).catch(error => res.status(500).json(error));
});

//Fetch all students of a specific cohort
// app.get("/api/students/cohort/:cohortId", (req, res) =>{
//   const {cohortId} = req.params;
//   Student.find({cohort: cohortId}).then(foundStudents => {
//     res.status(200).json(foundStudents);
//   }).catch(error => res.status(500).json(error));
// });

app.get("/api/students/cohort/:cohortId", (req, res) => {
  const {cohortId} = req.params;
  Student.find({cohort: cohortId})
  .populate("cohort")
  .then((foundStudents) => {
    res.status(200).json(foundStudents);
  }).catch(error => res.status(500).json(error));
})

//Fetch student by ID
// app.get("/api/students/:studentId", (req, res) => {
//   const {studentId} = req.params;
//   Student.findById(studentId).then(foundStudent =>{
//     res.status(200).json(foundStudent);
//   }).catch(error => res.status(500).json(error))
// });

app.get("/api/students/:studentId", (req,res) => {
  const {studentId} = req.params;
  Student.findById(studentId)
  .populate("cohort")
  .then((foundStudent)=>{
    res.status(200).json(foundStudent);
  }).catch(error => res.status(500).json(error));
});



//Create a new student with cohort ID
app.post("/api/students", (req, res) => {
  const {firstName, lastName, email, phone, linkedinUrl, languages, program, background, image, projects, cohort} = req.body;
  Student.create({firstName, lastName, email, phone, linkedinUrl, languages, program, background, image, projects, cohort}).then(newStudent => {
    res.status(201).json(newStudent);
  }).catch(error => res.status(500).json(error));
});

//Edit an existing student
app.put("/api/students/:studentId", (req, res) => {
  const {studentId} = req.params;
  Student.findByIdAndUpdate(studentId, req.body, {new:true}).then(editedStudent => {
    res.status(200).json(editedStudent);
  }).catch(error => res.status(500).json(error));

  });

//Delete a student by ID
app.delete("/api/students/:studentId", (req, res)=>{
  const {studentId} = req.params;
  Student.findByIdAndDelete(studentId).then(()=>{
    res.status(204).json({message: `Student ${studentId} has been deleted`});
  }).catch(error => res.status(500).json(error));
});


// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});