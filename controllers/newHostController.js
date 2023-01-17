const auth = require("../middlewares/auth");

exports.newHostController = {
    createHost(req, res) {
        try{
            //const resposne= await Promise.all([])
            res.json({message:"create Host"});
        } catch(err){
            res.status(404).json({message:"Bad request"});
        }
    }
}