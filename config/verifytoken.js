const jwt = require("jsonwebtoken");
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Student = require('../models/student')
require('dotenv').config()

function authToken(req, res, next) {
    console.log("REQ HEADERS", req.headers);
    const authHeader = req.headers["authorization"];
    console.log("Authheader**",authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    console.log("\nToken**",token);
    if (token == null) {
      res.sendStatus(401);
    }
  
    jwt.verify(token, process.env.ACCESS_SECRET_KEY, async(err, user) => {
      if (err) {
        res.sendStatus(403);
      }
      
      console.log("User",user);
      req.user = user;
      next();
    });
  }

  module.exports = authToken;
  