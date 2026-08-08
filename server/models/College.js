const mongoose=require("mongoose")

const STREAMS=[
    "Technical-PG","Technical-UG","Agricultural Education",
    "Fineart Education","Higher Education_PG","Higher Education_UG",
    "Medical Education_PG","Medical Education_UG","Ayush Education",
];

const branchSchema=new mongoose.Schema({
    branchName:{type:String,required:true},
    branchCode:{type:String},
    course:{type:String},
    totalSeats:{type:Number,default:0,min:0},
    vacantSeats:{type:Number,required:true,min:0},
    instituteQuota:{type:Number,default:0,min:0},
},
    {_id:true}
)

const collegeSchema=new mongoose.Schema({
    name:{type:String,required:true},
    // The same numeric code is reused across streams for different institutes,
    // so code is unique WITHIN a stream, not globally (see compound index below).
    code:{type:String,required:true},
    city:{type:String,required:true},
    stream:{type:String,enum:STREAMS},
    type:{type:String,enum:["Government","Private","Autonomous","Unaided"],default:"Private"},
    branches:[branchSchema],
},
    {timestamps:true}
)

collegeSchema.index({stream:1,code:1},{unique:true});

module.exports=mongoose.model("College",collegeSchema)