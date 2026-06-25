const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
require("dotenv").config();

const app=express();

app.use(cors());
app.use(express.json());

mongoose
.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB is connected"))
.catch((err)=> console.log("DB error:",err.message));


app.get("/",(req,res)=>{
    res.send("CAP Round 4 API is running")
})

const PORT=process.env.PORT||5000;
app.use("/api/auth",require("./routes/auth"))
app.use("/api/colleges", require("./routes/colleges"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/allocations", require("./routes/allocations"));
app.use("/api/round", require("./routes/round"));
app.listen(PORT,()=> console.log(`Server is running on PORT ${PORT}`))