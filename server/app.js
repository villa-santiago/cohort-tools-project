require("dotenv").config();


const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const Student = require("./models/Student.model");
const Cohort = require("./models/Cohort.model");
const {isAuthenticated} = require("./middleware/jwt.middleware");

const authRoutes = require("./routes/auth.routes");

const userRoutes = require("./routes/user.routes");

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

//AUTH ROUTES

app.use("/auth", authRoutes);

//USER ROUTES

app.use(userRoutes);

//COHORT ROUTES

//Fetch all cohorts
app.get("/api/cohorts", (req, res, next) => {
  Cohort.find()
  .then(allCohorts => {
    if (!allCohorts || allCohorts.length === 0){
      return next({ status: 404, message: "No cohorts found" });
    }
    console.log("All cohorts retrieved");
    res.status(200).json(allCohorts);
  })
  .catch(error => next({status:500, message:"Failed to fetch Cohorts"}));
});


//Fetch cohort by ID
app.get("/api/cohorts/:id", (req, res, next) => {
  const {id} = req.params;
  Cohort.findById(id)
  .then(foundCohort => {
    if (!foundCohort) {
    return next({ status: 404, message: `Cohort ${id} not found`});
    }
    res.status(200).json(foundCohort);
  })
   .catch(error => next({ status: 500, message: `Error retrieving cohort ${id}`}));
  });

//Create a new cohort
app.post("/api/cohorts", (req, res, next) =>{
  const {
    cohortSlug,
    cohortName,
    program,
    format,
    campus,
    startDate,
    endDate,
    inProgress,
    programManager,
    leadTeacher,
    totalHours
  } = req.body;

if (
  !cohortSlug ||
  !cohortName ||
  !program ||
  !format ||
  !campus ||
  !startDate ||
  !endDate ||
  !programManager ||
  !leadTeacher) {
  return next({ status: 400, message: "Missing required fields" });
}

  Cohort.create({
    cohortSlug,
    cohortName,
    program,
    format,
    campus,
    startDate,
    endDate,
    inProgress,
    programManager,
    leadTeacher,
    totalHours
  })
  .then(newCohort => res.status(201).json(newCohort))
  .catch(error => next({ status: 500, message: "Failed to create new cohort" }));
});

//Edit an existing cohort
app.put("/api/cohorts/:id", (req, res, next)=>{
  const {id} = req.params;
  const updateData = req.body;

  if (!updateData || Object.keys(updateData).length === 0) {
    return next({ status: 400, message: "Missing required fields" });
  }

  Cohort.findByIdAndUpdate(id, updateData, {
    new:true,
    runValidators:true})
  .then(editedCohort => {
    if (!editedCohort){
    return next({ status: 404, message: `Cohort ${id} not found` });
    }
    console.log(`Cohort ${id} successfully edited`);
    res.status(200).json(editedCohort);
  })
  .catch(error => {
    if(error.name ==="ValidationError"){
      return next({status:400, message:error.message});
    }
    next({status:500, message:`Failed to update Cohort ${id}`});
  });
  });


//Delete a specific cohort
app.delete("/api/cohorts/:id", (req, res, next)=>{
  const {id} = req.params;
  Cohort.findByIdAndDelete(id)
  .then((deletedCohort)=>{
    if(!deletedCohort){
      return next({ status: 400, message: `Cohort ${id} not found` });
    }
    console.log(`Cohort ${id} successfully deleted`);
    res.status(200).json({message: `Cohort ${id} has been deleted`});
  })
    .catch(error => next({ status: 500, message: `Failed to delete Cohort ${id}` }));
  });




//STUDENT ROUTES

app.get("/api/students", (req, res, next) => {
  Student.find()
  .populate("cohort")
  .then((allStudents) => {
    if(!allStudents || allStudents.length ===0){
      return next({ status: 404, message: "No students found"});
    }
    console.log("All students retrieved");
    res.status(200).json(allStudents);
  })
  .catch(error => next({status:500, message: `Failed to fetch students`}));
});


app.get("/api/students/cohort/:cohortId", (req, res, next) => {
  const {cohortId} = req.params;
  Student.find({cohort: cohortId})
  .populate("cohort")
  .then((foundStudents) => {
    if (!foundStudents || foundStudents.length === 0){
      return next({
        status:400,
        message: `No students found for cohort ${cohortId}`
      });
    }
    console.log(`Students of Cohort ${cohortId} fetched successfully`);
    res.status(200).json(foundStudents);
  })
  .catch(error => next({status:500, message: `Failed to fetch Students of cohort ${cohortId}`}));
})


app.get("/api/students/:studentId", (req,res, next) => {
  const {studentId} = req.params;
  Student.findById(studentId)
  .populate("cohort")
  .then((foundStudent)=>{
    if(!foundStudent){
      return next({ status: 404, message: `Student ${studentId} not found` });
    }
    console.log(`Student ${foundStudent.firstName} ${foundStudent.lastName} retrieved successfully`);
    res.status(200).json(foundStudent);
  })
  .catch(error => next({ status: 500, message: `Failed to retrieve Student ${studentId}` }));

});



//Create a new student with cohort ID
app.post("/api/students", (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    linkedinUrl,
    languages,
    program,
    background,
    image,
    projects,
    cohort
  } = req.body;

   if (
    !firstName ||
    !lastName ||
    !email ||
    !phone) {
    return next({ status: 400, message: "Missing required fields" });
  }
      
    Student.create({
    firstName,
    lastName,
    email,
    phone,
    linkedinUrl,
    languages,
    program,
    background,
    image,
    projects,
    cohort})
    .then(newStudent => {
      console.log(`Student ${newStudent.firstName} ${newStudent.lastName} created successfully`);
    res.status(201).json(newStudent);
  })
  .catch(error => {
    if (error.code === 11000 && error.keyPattern?.email){
      return next ({status:400, message:"Email already exists"});
    }
    next({status:500, message:"Failed to create student"});
  });
});

//Edit an existing student
app.put("/api/students/:studentId", (req, res, next) => {
  const {studentId} = req.params;
  const updateStudentData = req.body;

  if (!updateStudentData || Object.keys(updateStudentData).length === 0){
    return next({status:400, message:"Missing required fields"});
  }


  Student.findByIdAndUpdate(studentId, updateStudentData,
    {
      new:true,
      runValidators:true})
      .then(editedStudent => {
        if(!editedStudent){
          return next({status:404, message:`Student ${studentId} not found`});
        }
    console.log(`Student ${editedStudent.firstName} ${editedStudent.lastName} successfully edited`);
    res.status(200).json(editedStudent);
  })
  .catch(error =>{
    if(error.name ==="ValidationError"){
      return next({status:400, message:error.message});
    }
    next({status:500, message:`Failed to update student ${studentId}`});
  });

  });

//Delete a student by ID
app.delete("/api/students/:studentId", (req, res, next)=>{
  const {studentId} = req.params;
  Student.findByIdAndDelete(studentId)
  .then((deletedStudent)=>{
    if(!deletedStudent){
      return next({status:404, message:`Student ${deletedStudent.firstName} not found`});
    }
    console.log(`Student ${deletedStudent.firstName} ${deletedStudent.lastName} successfully deleted`);
    res.status(200).json({message: `Student ${studentId} has been deleted`});
  })
  .catch(error => next({status:500, message:`Failed to delete student ${studentId}`}));
});

const {errorHandler, notFoundHandler} = require('./middleware/error-handling');
app.use(errorHandler);
app.use(notFoundHandler);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});