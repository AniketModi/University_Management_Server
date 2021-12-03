const express = require('express')
const router = express.Router()
const verifytoken=require('../config/verifytoken')

const { adminLogin, addFaculty, addStudent,
    addSubject, getAllFaculty, getAllStudents, getAllSubjects,
    addAdmin, 
    getAllStudent,
    getAllSubject} = require('../controller/adminController')

router.post('/login', adminLogin)
router.post('/addAdmin',verifytoken, addAdmin )
router.post('/getAllFaculty', verifytoken,getAllFaculty)
router.post('/getAllStudent', verifytoken, getAllStudent)
router.post('/getAllSubject', verifytoken, getAllSubject)
router.post('/addFaculty', verifytoken, addFaculty)
router.get('/getFaculties', verifytoken, getAllFaculty)
router.post('/addStudent', verifytoken,addStudent)
router.get('/getStudents', verifytoken, getAllStudents)
router.post('/addSubject', verifytoken, addSubject)
router.get('/getSubjects', verifytoken,getAllSubjects)

module.exports = router