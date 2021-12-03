const jwt = require('jsonwebtoken')
const Student = require('../models/student')
const Subject = require('../models/subject')
const Faculty = require('../models/faculty')
const Attendence = require('../models/attendence')
const Mark = require('../models/marks')


const validateFacultyLoginInput = require('../validation/facultyLogin')
const validateFetchStudentsInput = require('../validation/facultyFetchStudent')
const validateFacultyUpdatePassword = require('../validation/FacultyUpdatePassword')
const validateFacultyUploadMarks = require('../validation/facultyUploadMarks')

module.exports = {
    facultyLogin: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyLoginInput(req.body);
            // Check Validation
            if (!isValid) {
              return res.status(400).json(errors);
            }
            const { registrationNumber, password } = req.body;

            const faculty = await Faculty.findOne({ registrationNumber })
            if (!faculty) {
                errors.registrationNumber = 'Registration number not found';
                return res.status(404).json(errors);
            }

            const isCorrect = password==faculty.password
            if (!isCorrect) {
                errors.password = 'Invalid Credentials';
                return res.status(404).json(errors);
            }
            
        jwt.sign(
            {id: faculty.id, faculty},
            process.env.ACCESS_SECRET_KEY,
            (err, token) => {
                if(err)
                {
                   console.log(err)  
                    res.send(err);                    
                }
                res.send({
                    success: true,
                    token: 'Bearer ' + token
                });
            }
        );

        }
        catch (err) {
            console.log("Error in faculty login", err.message)
        }
    },
    fetchStudents: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFetchStudentsInput(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { department, year, section } = req.body;
            const subjectList = await Subject.find({ department, year })
            if (subjectList.length === 0) {
                errors.department = 'No Subject found in given department';
                return res.status(404).json(errors);
            }
            const students = await Student.find({ department, year, section })
            if (students.length === 0) {
                errors.department = 'No Student found'
                return res.status(404).json(errors);
            }
            res.status(200).json({
                result: students.map(student => {
                    var student = {
                        _id: student._id,
                        registrationNumber: student.registrationNumber,
                        name: student.name
                    }
                    return student
                }),
                subjectCode: subjectList.map(sub => {
                    return sub.subjectCode
                })
            })
        }
        catch (err) {
            console.log("error in faculty fetchStudents", err.message)
        }

    },
    markAttendence: async (req, res, next) => {
        try {
            const { selectedStudents, subjectCode, department,
                year,
                section } = req.body
            
            const sub = await Subject.findOne({ subjectCode })

            //All Students
            const allStudents = await Student.find({ department, year, section })
            
            let  selectedStudent = Object.keys(selectedStudents).map(key => selectedStudents[key]);

            var filteredArr = await allStudents.filter(function (item) {
                return selectedStudent.indexOf(item.id) === -1
            });

            //Absent Student, total lectures by faculty increased by one
        await filteredArr.forEach(async(filteredArr)=>
        {
                const pre = await Attendence.findOne({ student: filteredArr._id, subject: sub._id })
                if (!pre) {
                    const attendence = new Attendence({
                        student: filteredArr,
                        subject: sub._id
                    })
                    attendence.totalLecturesByFaculty += 1
                    await attendence.save()
                }
                else {
                    pre.totalLecturesByFaculty += 1
                    await pre.save()
                }
        })



        await selectedStudent.forEach(async(selectedStudent)=>
        {
                const pre = await Attendence.findOne({ student: selectedStudent, subject: sub._id })
                if (!pre) {
                    const attendence = new Attendence({
                        student: selectedStudent,
                        subject: sub._id
                    })
                    attendence.totalLecturesByFaculty+=1
                    attendence.lectureAttended += 1
                    await attendence.save()
                }
                else {
                    pre.totalLecturesByFaculty += 1
                    pre.lectureAttended += 1
                    await pre.save()
                }
        })
        res.status(200).json({ message: "done" })

    }
        catch (err) {
            console.log("error", err.message)
            return res.status(400).json({ message: `Error in marking attendence${err.message}` })
        }
    },
    uploadMarks: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyUploadMarks(req.body);

            // Check Validation
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { subjectCode, exam, totalMarks, marks, department, year,
                section } = req.body
            const subject = await Subject.findOne({ subjectCode })
            const isAlready = await Mark.find({ exam, department, section, subjectCode:subject._id })
            if (isAlready.length !== 0) {
                errors.exam = "You have already uploaded marks of given exam"
                return res.status(400).json(errors);
            }
            for (var i = 0; i < marks.length; i++) {
                const newMarks = await new Mark({
                    student: marks[i]._id,
                    subject: subject._id,
                    exam,
                    department,
                    section,
                   
                    marks: marks[i].value,
                    totalMarks
                })
                await newMarks.save()
            }
            res.status(200).json({message:"Marks uploaded successfully"})
        }
        catch (err) {
            console.log("Error in uploading marks",err.message)
        }
        
    },
    getAllSubjects: async (req, res, next) => {
        try {
            const allSubjects = await Subject.find({})
            if (!allSubjects) {
                return res.status(404).json({ message: "You havent registered any subject yet." })
            }
            res.status(200).json({ allSubjects })
        }
        catch (err) {
            res.status(400).json({ message: `error in getting all Subjects", ${err.message}` })
        }
    },
    updatePassword: async (req, res, next) => {
        try {
            const { errors, isValid } = validateFacultyUpdatePassword(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const { registrationNumber, oldPassword, newPassword, confirmNewPassword } = req.body
            if (newPassword !== confirmNewPassword) {
                errors.confirmNewPassword = 'Password Mismatch'
                return res.status(404).json(errors);
            }
            const faculty = await Faculty.findOne({ registrationNumber })
            const isCorrect = await oldPassword==faculty.password
            if (!isCorrect) {
                errors.oldPassword = 'Invalid old Password';
                return res.status(404).json(errors);
            }
            faculty.password = newPassword;
            await faculty.save()
            res.status(200).json({ message: "Password Updated" })
        }
        catch (err) {
            console.log("Error in updating password", err.message)
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const { email, gender, facultyMobileNumber} = req.body

            const faculty = await Faculty.findOne({ email })
            if (gender) {
                faculty.gender = gender
                await faculty.save()
            }
            if (facultyMobileNumber) {
                faculty.facultyMobileNumber = facultyMobileNumber
                await faculty.save()
            }

            await faculty.save()
            res.status(200).json(faculty)
        }
        catch (err) {
            console.log("Error in updating Profile", err.message)
        }
    }
}