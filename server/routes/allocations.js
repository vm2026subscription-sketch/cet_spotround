const router=require("express").Router();
const Application=require("../models/Application")
const College=require("../models/College")
const Allotment=require("../models/Allotment")
const User=require("../models/User")
const {requireAuth,requireAdmin}=require("../middleware/auth")
const Round=require("../models/Round");


//POST /api/allocation/run - admin triggers the seat allocation
router.post("/run",requireAuth,requireAdmin,async(req,res)=>{
    try{
        // 1. Clear any previous run - admin triggers the seat allocation
        await Allotment.deleteMany({});
        await Application.updateMany({},{status:"submitted"});


        // 2. Get all applications, with each students percentile attached
        const applications=await Application.find({status:"submitted"})
        .populate("student","name cetPercentile")

        if(applications.length ===0)
            return res.status(400).json({message:"No applications to allocate"})

        // 3. SORT by merit - highest percentile first.
        //    (bug 1) Guard against a missing percentile: treat it as -1 so it can
        //    never produce NaN and silently corrupt the merit order.
        //    (bug 4) Tie-breaker: if two candidates have the SAME percentile, the one
        //    who submitted their application earlier is ranked higher.
        applications.sort((a,b)=>{
            const pa=a.student?.cetPercentile ?? -1;
            const pb=b.student?.cetPercentile ?? -1;
            if(pb!==pa) return pb-pa;                                // higher percentile first
            return new Date(a.createdAt)-new Date(b.createdAt);      // earlier applicant wins the tie
        });

        // 4. Load all colleges into memory so we can decrement seats  as we go
        const colleges=await College.find();
        const seatMap={}; //seatMap[collegeId][branchName] = seats left
        for(const college of colleges){
            seatMap[college._id]={};
            for(const branch of college.branches){
                seatMap[college._id][branch.branchName]=branch.vacantSeats;
            }
        }

        const results = {alloted:0,notAlloted:0};
        const allotmentsToCreate=[];

        // 5. Walk student in merit order 
        for(const app of applications){
            let placed=false;

            //walk their preferences top to bottom
            for(const pref of app.preferences){
                const left=seatMap[pref.college] ?. [pref.branchName];

                if(left && left>0){
                    seatMap[pref.college][pref.branchName]=left -1;    //take seat
                    allotmentsToCreate.push({
                        student:app.student._id,
                        college:pref.college,
                        branchName:pref.branchName,
                        round:4,
                    });
                    app.status="alloted";
                    placed=true;
                    results.alloted++;
                    break;                              //stops at first satisfied preferences
                }
            }

            if(!placed){
                app.status="not_alloted";
                results.notAlloted++;
            }
        }

        // 6. Persist: save the new statuses, then insert all allotments in one shot.
        await Promise.all(applications.map((a)=>a.save()));
        if(allotmentsToCreate.length>0){
            await Allotment.insertMany(allotmentsToCreate)
        }

        // lock the round so no new applications arrive after results are out
        const round=await Round.getCurrent();
        round.status="closed";
        await round.save();
        
        res.json({
            message:"Allocation complete",
            totalApplications:applications.length,
            alloted:results.alloted,
            notAlloted:results.notAlloted,
        });
        
    }catch(err){
        res.status(500).json({message:err.message})
    }
});


//GET /api/applications/me - a student views there own results
router.get("/me",requireAuth,async(req,res)=>{
    try{
        const allotment=await Allotment.findOne({student:req.user.id})
        .populate("college","name code city")

        if(!allotment)
            return res.status(404).json({message:"No seat alloted to you"})

        res.json(allotment);
    }catch(err){
        res.status(500).json({message:err.message})
    }
});


//GET /api/allocations - admin views every allotment
router.get("/",requireAuth,requireAdmin,async(req,res)=>{
    try{
        const allotments=await Allotment.find()
        .populate("student","name email cetPercentile category")
        .populate("college","name code city")

        res.json(allotments);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

module.exports=router;  