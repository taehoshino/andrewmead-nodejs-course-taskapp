const jwt = require("jsonwebtoken")
const User = require("../models/user")

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ","") //remove "Bearer" from the header string
        const decoded = jwt.verify(token, process.env.JWT_SECRET) //decode token using secret
        const user = await User.findOne({_id: decoded._id, "tokens.token": token}) //find matching ID and token array contains the token

        if (!user){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()

    } catch (e){
        res.status(401).send({error: "Please authenticate."})
    }
}

module.exports = auth