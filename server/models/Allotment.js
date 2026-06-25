const mongoose=require("mongoose")

const allotmentSchema=new mongoose.Schema(
    {
        student:{type:mongoose.Schema.Types.ObjectId , ref:"User", required:true, unique:true},
        college:{type:mongoose.Schema.Types.ObjectId , ref:"College" , required:true , },
        branchName:{type:String , required:true},
        round:{type:Number , default:4},
    },
    {
        timestamps:true
    }
)

module.exports=mongoose.model("Allotment",allotmentSchema)