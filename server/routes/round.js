const router=require("express").Router();
const Round=require("../models/Round");
const Application=require("../models/Application");
const Allotment=require("../models/Allotment");
const {requireAuth,requireAdmin}=require("../middleware/auth");

//GET /api/round - current round status
router.get("/",requireAuth,async(req,res)=>{
    try{
        const round=await Round.getCurrent();
        res.json(round);
    }catch(err){ res.status(500).json({message:err.message}); }
});

//PUT /api/round/status - admin opens/closes the round
router.put("/status",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const {status}=req.body;
        if(!["open","closed"].includes(status))
            return res.status(400).json({message:"status must be 'open' or 'closed'"});
        const round=await Round.getCurrent();
        round.status=status;
        await round.save();
        res.json({message:`Round is now ${status}`,round});
    }catch(err){ res.status(500).json({message:err.message}); }
});

//POST /api/round/reset - admin: clear all applications + allotments and reopen the round
router.post("/reset",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const apps=await Application.deleteMany({});
        const allots=await Allotment.deleteMany({});
        const round=await Round.getCurrent();
        round.status="open";
        await round.save();
        res.json({
            message:"Round reset complete. Applications and allotments cleared; round reopened.",
            applicationsDeleted:apps.deletedCount,
            allotmentsDeleted:allots.deletedCount,
            round,
        });
    }catch(err){ res.status(500).json({message:err.message}); }
});

module.exports=router;