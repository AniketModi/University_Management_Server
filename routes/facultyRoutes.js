const express = require('express')
const verifytoken=require('../config/verifytoken')

const router = express.Router()

const { fetchStudents, markAttendence, facultyLogin, getAllSubjects,
    updatePassword,uploadMarks, updateProfile } = require('../controller/facultyController')

router.post('/login', facultyLogin)

router.post('/updateProfile',verifytoken,updateProfile)

router.post('/fetchStudents', verifytoken,fetchStudents)

router.post('/fetchAllSubjects', verifytoken,getAllSubjects)

router.post('/markAttendence',verifytoken, markAttendence)

router.post('/uploadMarks',verifytoken, uploadMarks)

router.post('/updatePassword',verifytoken,  updatePassword)

module.exports = router
