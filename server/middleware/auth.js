const jwt=require("jsonwebtoken")

//Guard 1-is the request from logged-in user
function requireAuth(req,res,next){
    const header=req.headers.authorization;

    if(!header || !header.startsWith("Bearer "))
        return res.status(401).json({message:"No token provided"})

    const token=header.split(" ")[1];

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(401).json({message:"Invalid or Expired token"});
    }
}


//Guard 2-is that user an admin?
function requireAdmin(req,res,next){
    if(req.user.role !=="admin")
        return res.status(403).json({message:"Admin access only"})
    next();
}

module.exports={requireAuth,requireAdmin};