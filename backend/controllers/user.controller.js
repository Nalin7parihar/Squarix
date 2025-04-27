import bcrypt from  "bcryptjs";
import jwt from "jsonwebtoken";
import users from "../model/user.model.js";
const userRegister = async (req, res) => {
  const {name,email, password} = req.body;
  try{
    if(!name || !email || !password) {
      return res.status(400).json({message : "pls fill all the fields"});
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password,salt);
    const user = await users.create({name,email,password : hashedPassword});
    return res.status(201).json({message : "created User Successfully",user});

  }catch(error) {
    console.log(error);
  }
}

const userLogin=  async (req,res) => {
  const {email,password} = req.body;
  try {
    if(!email || !password) {
      return res.status(400).json({message : "pls fill all the fields"});
    }
    const user = await users.findOne({email});
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch || !user) {
      return res.status(400).json({message : "Invalid Credentials"});
    }
    const token = jwt.sign({id : user._id,name : user.email,password : user.password},process.env.JWT_SECRET,{expiresIn : "1d"});
    res.cookie("token",token,{
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
      sameSite : "strict",
      maxAge : 24*60*60*1000 //1 day
    })

    return res.status(200).json({message : "Login Successfully",email : user.email,password : user.password,token});
  } catch (error) {
    console.log(error);
  }
}

const userUpdatePassword = async (req,res) => {
  const {oldPassword,newPassword} = req.body;
  try {
    if(!oldPassword || !newPassword) {
      return res.status(400).json({message : "pls fill all the fields"});
    }
    const user = await users.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword,user.password);
    if(!isMatch) {
      return res.status(400).json({message : "Invalid Credentials"});
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword,salt);
    user.password =  hashedPassword;
    await user.save();
    return res.status(200).json({message : "Password Updated Successfully",oldPassword,newPassword});
  } catch (error) {
    console.log(error);
  }
}

const userDeleteAccount = async (req,res) => {
  try {
    const {id} = req.user;
    const user = await users.findByIdAndDelete(id);
    if(!user) return res.status(404).json({message : "User not found"});
    return res.status(200).json({message : "User deleted Successfully"});
  } catch (error) {
    console.log(error);
  }
}

const getUsers=  async (req,res) => {
    try {
      const userList = await users.find().select("name email");
      if(!userList) return res.status(404).json({message : "No Users found"});
      return res.status(200).json({userList});
    } catch (error) {
      console.log(error);
    }
}
export {userLogin,userRegister,userUpdatePassword,userDeleteAccount,getUsers};