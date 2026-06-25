const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true,lowercase:true},
    password:{type:String,required:true},
    role:{type:String,enum:["student","admin"],default:"student"},


    cetApplicationId:{type:String},
    cetPercentile:{type:Number,min:0,max:100},
    category:{type:String,enum:["OPEN","OBC","SC","ST","EWS","NT","SBC"]}   ,
},
    {timestamps:true}
)
module.exports=mongoose.model("User",userSchema);