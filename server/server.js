const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const dns=require("dns")
require("dotenv").config();

// Some machines (stale virtual-adapter DNS entries on Windows) leave Node's
// resolver pointing at localhost, where nothing is listening. That breaks the
// SRV lookup a mongodb+srv:// URI needs. Only kicks in when that's the case.
if (dns.getServers().every((s) => s === "127.0.0.1" || s === "::1")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const app=express();

app.use(cors());
// Bulk college import sends the whole sheet as one JSON body; the 100kb default
// rejects a real Maharashtra-sized upload (1400+ colleges) with 413.
app.use(express.json({ limit: "5mb" }));

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