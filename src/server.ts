import intializeConnection from "./database/data.source";
import dotenv from "dotenv"
import "reflect-metadata";
import app from "./app"

dotenv.config();

const port=process.env.PORT;
console.log("Port is port",process.env.DB_HOST);
intializeConnection();

app.listen(port,async()=>{
    console.log(`server is running at port ${port}`);
    
})           