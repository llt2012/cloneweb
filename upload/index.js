const http = require("http")
const path = require("path")
const app = require("./app")
const express = require("express")
const server = http.createServer(app)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
Path = path.join(__dirname,"static")
app.use("/",express.static(Path))


const {API_PORT} = process.env 
const port = process.env.PORT || API_PORT

server.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})