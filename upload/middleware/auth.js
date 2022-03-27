const jwt = require("jsonwebtoken")

const config = process.env

const verifyToken = (cerdentials = [])=>(req,res,next) =>{
    if(typeof cerdentials === "string")
        cerdentials = [cerdentials]
    const token = req.session.token
    if(!token)
        return res.status(403).send("A token is required for authentication")
    try{
        const decode = jwt.verify(token,config.TOKEN_KEY)
        if(cerdentials.some(cred=>
            decode.role == cred))
        {
            req.user = decode
            return next()
        }
        else
        {
            return res.status(401).send("Error: Access Denied")
        }
    }catch(error){
        return res.status(401).send("Invalid Token")
    }
    return next()
}

module.exports = verifyToken