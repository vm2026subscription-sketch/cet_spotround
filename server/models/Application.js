const mongoose=require("mongoose")

const preferenceSchema=new mongoose.Schema({
    college:{type:mongoose.Schema.Types.ObjectId, ref:"College", required:true},
    branchName:{type:"String", required:true},
    priority:{type:Number,required:true,min:1},
},
{_id:false}
);

const applicationSchema=new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
    },
    preferences:[preferenceSchema],
    status:{
        type:String,
        enum:["submitted","alloted","not_alloted"],
        default:"submitted",
    },
},
{timestamps:true}
);

module.exports=mongoose.model("Application",applicationSchema);