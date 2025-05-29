const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema ({
   firstName: String,
   lastName: String,
   email: String,
   phone: Number,
   linkedinUrl: String,
   languages: [String],
   program: String,
   background: String,
   image: String,
   projects: [String],
//    cohort: ObjectId,

});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;