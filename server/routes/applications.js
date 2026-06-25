const router=require("express").Router();
const Application=require("../models/Application");
const College=require("../models/College")
const Round=require("../models/Round");
const {requireAuth,requireAdmin}=require("../middleware/auth");

//helper: check every preference points to real college + branch
async function validatePreferences(preferences){
    if(!Array.isArray(preferences) || preferences.length ===0)
        return "Atleast ont preference is required"

    for(const pref of preferences){
        const college=await College.findById(pref.college)
        if(!college)
            return `College not found ${pref.college}`
    
        const branchExists=college.branches.some(
            (b)=>b.branchName === pref.branchName
        );
        if(!branchExists)
            return `Branch ${pref.branchName} not found in ${college.name}`;
    }
    return null;
}


//POST /api/applications - student submits the option form
router.post("/",requireAuth,async(req,res)=>{
    try{
        if(req.user.role !== "student")
            return res.status(403).json({message:"Only students can apply"});

        const round=await Round.getCurrent();
        if(round.status!=="open")
            return res.status(403).json({message:"The round is closed. Applications cannot be submitted right now."});
        
        const existing=await Application.findOne({student:req.user.id });
        if(existing)
            return res.status(409).json({message:"Application already submitted. Use Update instead."})
        
        const{preferences}=req.body;
        const error=await validatePreferences(preferences);
        if(error)
            return res.status(400).json({message:error})

        const application = await Application.create({
             student: req.user.id,
                preferences,
    });


        res.status(201).json(application);

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
});


//GET /api/applications/me - students view there on applications
router.get("/me",requireAuth,async(req,res)=>{
    try{
        const application=await Application.findOne({student:req.user.id})
        .populate("preferences.college","name code city")

        if(!application)
            return res.status(404).json({message:"No application found"})
        
        res.json(application);
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
});


//PUT /api/applications/me - student updates preferences
router.put("/me",requireAuth, async(req,res)=>{
    try{

        const round=await Round.getCurrent();
        if(round.status!=="open")
            return res.status(403).json({message:"The round is closed. You can no longer change your preferences."});

        const application=await Application.findOne({student:req.user.id})

        if(!application)
            return res.status(404).json({message:"No appliation to update"})

        if(application.status !== "submitted")
            return res.status(400).json({message:"Application is locked after allocation"})

        const {preferences}=req.body;
        const error=await validatePreferences(preferences);
        if(error)
            return res.status(400).json({message:error})
        
        application.preferences=preferences;
        await application.save();

        res.json(application)
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//GET /api/applications  (admin) — list every application with student + preferences
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const apps = await Application.find()
      .populate("student", "name email cetPercentile category")
      .populate("preferences.college", "name code city");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports=router;