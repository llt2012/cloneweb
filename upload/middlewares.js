
const authPage = (permision) =>{
    return (req,res,next)=>{
        const role = req.role
        console.log(req.headers)
        if(permision.includes(role))
        {
            next()
        }else
        {
            return res.status(401).json("you dont have permission")
        }
    }
}

module.exports = authPage