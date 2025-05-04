import bcrypt from  "bcryptjs";
import jwt from "jsonwebtoken";
import users from "../model/user.model.js";
import "dotenv/config.js";
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

const userLogin = async (req,res) => {
  const {email,password} = req.body;
  try {
    if(!email || !password) {
      return res.status(400).json({message : "Please fill all fields"});
    }
    const user = await users.findOne({email});
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({message : "Invalid credentials"});
    }

    // Create token with user info
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set token in both cookie and response
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Keep this - requires HTTPS
      // Change SameSite based on environment
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Return user info without sensitive data
    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token // Also send token in response for Bearer auth
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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

const userLogout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire the cookie immediately
      secure: process.env.NODE_ENV === "production", // Match login settings
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", // Match login settings
    });
    return res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    console.log("Logout Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // req.user is populated by the verifyToken middleware
    const user = await users.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("Get Current User Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export {userLogin,userRegister,userUpdatePassword,userDeleteAccount,getUsers, userLogout, getCurrentUser};