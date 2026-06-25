const mongoose=require("mongoose");

const roundSchema=new mongoose.Schema({
    roundNumber:{type:Number,default:4},
    status:{type:String,enum:["open","closed"],default:"open"},
},
    {timestamps:true}
);

// always work with one single round document (creates it the first time)
roundSchema.statics.getCurrent=async function(){
    let round=await this.findOne();
    if(!round) round=await this.create({});
    return round;
};

module.exports=mongoose.model("Round",roundSchema);