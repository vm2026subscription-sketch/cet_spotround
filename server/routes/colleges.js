const router=require("express").Router();
const College=require("../models/College");
const Application=require("../models/Application");
const Allotment=require("../models/Allotment");
const {requireAuth,requireAdmin}=require("../middleware/auth");

// (bug 5) Reject any branch whose vacant seats exceed its total capacity.
// Only checked when totalSeats is a positive number (0 = capacity not set yet).
function findSeatError(branches){
    if(!Array.isArray(branches)) return null;
    for(const b of branches){
        const total=Number(b.totalSeats)||0;
        const vacant=Number(b.vacantSeats)||0;
        if(total>0 && vacant>total)
            return `Vacant seats (${vacant}) cannot exceed total seats (${total}) for branch "${b.branchName||"unnamed"}"`;
    }
    return null;
}

// Allowed values (kept in sync with the College model) — used to validate the sheet.
const STREAMS=[
  "Technical-PG","Technical-UG","Agricultural Education",
  "Fineart Education","Higher Education_PG","Higher Education_UG",
  "Medical Education_PG","Medical Education_UG","Ayush Education",
];
const TYPES=["Government","Private","Autonomous","Unaided"];

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
        const seatError=findSeatError(branches);
        if(seatError) return res.status(400).json({message:seatError});
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
        if(branch.totalSeats>0 && Number(vacantSeats)>branch.totalSeats)
            return res.status(400).json({message:`Vacant seats cannot exceed total seats (${branch.totalSeats})`});
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
        // (bug 5) Cascade cleanup: remove any data still pointing at this college so
        // we don't leave orphaned allotments or dangling preferences behind.
        const removedAllotments=await Allotment.deleteMany({college:college._id});
        await Application.updateMany({},{$pull:{preferences:{college:college._id}}});
        res.json({
            message:`College "${college.name}" deleted`,
            allotmentsRemoved:removedAllotments.deletedCount,
        });
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
        const seatError=findSeatError(branches);
        if(seatError) return res.status(400).json({message:seatError});
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

        // (bug 5) If branches were removed or renamed, drop any allotments and
        // preferences that now point to a branch that no longer exists here.
        const validBranchNames=college.branches.map((b)=>b.branchName);
        await Allotment.deleteMany({college:college._id,branchName:{$nin:validBranchNames}});
        await Application.updateMany(
            {},
            {$pull:{preferences:{college:college._id,branchName:{$nin:validBranchNames}}}}
        );

        res.json(college);
    }catch(err){ res.status(500).json({message:err.message}); }
});

//POST /api/colleges/bulk - admin bulk-imports colleges from an Excel sheet.
//Body: { colleges: [ { name, code, city, stream, type, branches:[...] }, ... ] }
//Existing codes are UPDATED, brand-new codes are CREATED.
router.post("/bulk",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const {colleges}=req.body;
        if(!Array.isArray(colleges) || colleges.length===0)
            return res.status(400).json({message:"No colleges found to import"});

        let created=0, updated=0;
        const errors=[];

        for(let i=0;i<colleges.length;i++){
            const c=colleges[i];
            const label=c.code || c.name || `row ${i+1}`;

            // 1. required fields
            if(!c.name || !c.code || !c.city){
                errors.push(`${label}: name, code and city are required`);
                continue;
            }
            // 2. stream / type must come from the allowed lists (when provided)
            if(c.stream && !STREAMS.includes(c.stream)){
                errors.push(`${label}: unknown stream "${c.stream}"`); continue;
            }
            if(c.type && !TYPES.includes(c.type)){
                errors.push(`${label}: unknown type "${c.type}"`); continue;
            }
            // 3. vacant <= total on every branch (reuses the manual-add helper)
            const seatError=findSeatError(c.branches);
            if(seatError){ errors.push(`${label}: ${seatError}`); continue; }

            // build a clean document from the row
            const doc={
                name:c.name, code:c.code, city:c.city,
                stream:c.stream || undefined,
                type:c.type || "Private",
                branches:(c.branches || []).map((b)=>({
                    branchName:b.branchName,
                    branchCode:b.branchCode,
                    totalSeats:Number(b.totalSeats)||0,
                    vacantSeats:Number(b.vacantSeats)||0,
                })),
            };

            // upsert by code: update if it already exists, otherwise create
            const existing=await College.findOne({code:c.code});
            if(existing){
                await College.updateOne({_id:existing._id},doc,{runValidators:true});
                updated++;
            }else{
                await College.create(doc);
                created++;
            }
        }

        res.json({ message:"Import complete", created, updated, failed:errors.length, errors });
    }catch(err){ res.status(500).json({message:err.message}); }
});

//POST /api/colleges/bulk - admin bulk-imports colleges from an Excel sheet.
router.post("/bulk",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const {colleges}=req.body;
        if(!Array.isArray(colleges) || colleges.length===0)
            return res.status(400).json({message:"No colleges found to import"});

        let created=0, updated=0;
        const errors=[];

        for(let i=0;i<colleges.length;i++){
            const c=colleges[i];
            const label=c.code || c.name || `row ${i+1}`;

            if(!c.name || !c.code || !c.city){
                errors.push(`${label}: name, code and city are required`); continue;
            }
            if(c.stream && !STREAMS.includes(c.stream)){
                errors.push(`${label}: unknown stream "${c.stream}"`); continue;
            }
            if(c.type && !TYPES.includes(c.type)){
                errors.push(`${label}: unknown type "${c.type}"`); continue;
            }
            const seatError=findSeatError(c.branches);
            if(seatError){ errors.push(`${label}: ${seatError}`); continue; }

            const doc={
                name:c.name, code:c.code, city:c.city,
                stream:c.stream || undefined,
                type:c.type || "Private",
                branches:(c.branches || []).map((b)=>({
                    branchName:b.branchName,
                    branchCode:b.branchCode,
                    totalSeats:Number(b.totalSeats)||0,
                    vacantSeats:Number(b.vacantSeats)||0,
                })),
            };

            const existing=await College.findOne({code:c.code});
            if(existing){
                await College.updateOne({_id:existing._id},doc,{runValidators:true});
                updated++;
            }else{
                await College.create(doc);
                created++;
            }
        }

        res.json({ message:"Import complete", created, updated, failed:errors.length, errors });
    }catch(err){ res.status(500).json({message:err.message}); }
});

module.exports=router;

module.exports=router;