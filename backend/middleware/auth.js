import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try{
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if(!user){
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = decoded;
    next();
  } catch(error){
    res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

export default auth;
