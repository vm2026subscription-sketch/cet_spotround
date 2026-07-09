const mongoose=require("mongoose")

const STREAMS=[
    "Technical-PG","Technical-UG","Agricultural Education",
    "Fineart Education","Higher Education_PG","Higher Education_UG",
    "Medical Education_PG","Medical Education_UG","Ayush Education",
];

const branchSchema=new mongoose.Schema({
    branchName:{type:String,required:true},
    branchCode:{type:String},
    totalSeats:{type:Number,default:0,min:0},
    vacantSeats:{type:Number,required:true,min:0},
},
    {_id:true}
)

const collegeSchema=new mongoose.Schema({
    name:{type:String,required:true},
    code:{type:String,required:true,unique:true},
    city:{type:String,required:true},
    stream:{type:String,enum:STREAMS},
    type:{type:String,enum:["Government","Private","Autonomous","Unaided"],default:"Private"},
    branches:[branchSchema],
},
    {timestamps:true}
)

module.exports=mongoose.model("College",collegeSchema)