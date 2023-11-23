const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secret = process.env.JWT_WEB_TOKEN;

module.exports.verifytoken =(req,res,next)=>{
    const token = req.cookies.token;
    // console.log(token)
    if (token) {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          res.status(401).json({ songs: "Invalid token" });
        }
        req.email=decoded.email
        next()
      });
    } else {
      res.send({ songs: "NOT_LOGGED_IN" });
    }
}