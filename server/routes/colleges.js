const router=require("express").Router();
const College=require("../models/College");
const {requireAuth,requireAdmin}=require("../middleware/auth");

//GET /api/colleges/public - PUBLIC (no login). Optional ?stream=... &type=... filters
router.get("/public",async(req,res)=>{
    try{
        const filter={};
        if(req.query.stream) filter.stream=req.query.stream;
        if(req.query.type) filter.type=req.query.type;
        const colleges=await College.find(filter).sort({name:1});
        res.json(colleges);
    }catch(err){ res.status(500).json({message:err.message}); }
});

//GET /api/colleges - any logged-in user can view
router.get("/",requireAuth,async(req,res)=>{
    try{
        const colleges=await College.find().sort({name:1});
        res.json(colleges);
    }catch(err){ res.status(500).json({message:err.message}); }
});

//POST /api/colleges - admin only
router.post("/",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const {name,code,city,stream,type,branches}=req.body;
        if(!name || !code || !city)
            return res.status(400).json({message:"name, code and city are required"});
        const exists=await College.findOne({code});
        if(exists) return res.status(409).json({message:"College code already exists"});
        const college=await College.create({name,code,city,stream,type:type || "Private",branches:branches || []});
        res.status(201).json(college);
    }catch(err){ res.status(500).json({message:err.message}); }
});

//PATCH /api/colleges/:collegeId/branches/:branchId - admin updates a branch's vacant seats
router.patch("/:collegeId/branches/:branchId",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const {vacantSeats}=req.body;
        if(vacantSeats===undefined || vacantSeats<0)
            return res.status(400).json({message:"vacantSeats must be 0 or more"});
        const college=await College.findById(req.params.collegeId);
        if(!college) return res.status(404).json({message:"College not found"});
        const branch=college.branches.id(req.params.branchId);
        if(!branch) return res.status(404).json({message:"Branch not found"});
        branch.vacantSeats=vacantSeats;
        await college.save();
        res.json(college);
    }catch(err){ res.status(500).json({message:err.message}); }
});

//DELETE /api/colleges/:id - admin removes a college
router.delete("/:id",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const college=await College.findByIdAndDelete(req.params.id);
        if(!college) return res.status(404).json({message:"College not found"});
        res.json({message:`College "${college.name}" deleted`});
    }catch(err){ res.status(500).json({message:err.message}); }
});

//PUT /api/colleges/:id - admin edits a college (info + branches)
router.put("/:id",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const {name,code,city,stream,type,branches}=req.body;
        if(!name || !code || !city)
            return res.status(400).json({message:"name, code and city are required"});
        const clash=await College.findOne({code,_id:{$ne:req.params.id}});
        if(clash) return res.status(409).json({message:"Another college already uses that code"});
        const college=await College.findById(req.params.id);
        if(!college) return res.status(404).json({message:"College not found"});
        college.name=name;
        college.code=code;
        college.city=city;
        college.stream=stream;
        college.type=type || "Private";
        if(Array.isArray(branches)){
            college.branches=branches.map((b)=>({
                ...(b._id?{_id:b._id}:{}),
                branchName:b.branchName,
                branchCode:b.branchCode,
                totalSeats:Number(b.totalSeats)||0,
                vacantSeats:Number(b.vacantSeats)||0,
            }));
        }
        await college.save();
        res.json(college);
    }catch(err){ res.status(500).json({message:err.message}); }
});

module.exports=router;