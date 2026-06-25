const router=require("express").Router();
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const User=require("../models/User")
const {requireAuth,requireAdmin}=require("../middleware/auth");


//POST/api/auth/register
router.post("/register",async(req,res)=>{
    try{
        const{name,email,password,cetApplicationId,cetPercentile,category}=req.body;
    
    if(!name || !email || !password){
        return res.status(400).json({message:"Name,email and password are required"})
    }
    const existing=await User.findOne({email});
    if(existing){
        return res.status(409).json({message:"Email already registered"})
    }

    const hashed=await bcrypt.hash(password,10);

    const user=await User.create({
        name,email,password:hashed,
        cetApplicationId,cetPercentile,category,
        role:"student",
    });


    res.status(201).json({message:"Registered Successfully",userId: user._id});
}catch(err){
    res.status(500).json({message:err.message});
}
});

//POST/api/auth/login
router.post("/login",async(req,res)=>{
    try{
        const{email,password}=req.body;

        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"Invalid email or Password"});
        }

        const ok=await bcrypt.compare(password,user.password);
        if(!ok){
            return res.status(401).json({message:"Invalid email or password"});
        }

        const token=jwt.sign(
            {id:user._id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        );

        res.json({
            token,
            user:{id:user._id,name:user.name,role:user.role},
        });
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//PUT /api/auth/change-password - a logged-in user changes their own password
router.put("/change-password",requireAuth,async(req,res)=>{
    try{
        const{currentPassword,newPassword}=req.body;
        if(!currentPassword || !newPassword)
            return res.status(400).json({message:"currentPassword and newPassword are required"});
        if(newPassword.length<6)
            return res.status(400).json({message:"New password must be at least 6 characters"});

        const user=await User.findById(req.user.id);
        if(!user) return res.status(404).json({message:"User not found"});

        const ok=await bcrypt.compare(currentPassword,user.password);
        if(!ok) return res.status(401).json({message:"Current password is incorrect"});

        user.password=await bcrypt.hash(newPassword,10);
        await user.save();

        res.json({message:"Password changed successfully"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
});


//PUT /api/auth/admin/reset-password - an admin sets a new password for any user (by email)
router.put("/admin/reset-password",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const{email,newPassword}=req.body;
        if(!email || !newPassword)
            return res.status(400).json({message:"email and newPassword are required"});
        if(newPassword.length<6)
            return res.status(400).json({message:"New password must be at least 6 characters"});

        const user=await User.findOne({email:email.toLowerCase()});
        if(!user) return res.status(404).json({message:"User not found"});

        user.password=await bcrypt.hash(newPassword,10);
        await user.save();

        res.json({message:`Password reset for ${user.email}`});
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

//GET /api/auth/me - the logged-in user's own profile
router.get("/me",requireAuth,async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select("-password");
        if(!user) return res.status(404).json({message:"User not found"});
        res.json(user);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

module.exports=router;