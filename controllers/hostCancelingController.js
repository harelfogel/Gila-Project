const auth = require("../middlewares/auth");

exports.hostCancelingController = {
    deleteHost(req, res) {
        try{
            console.log(auth);
            res.json({message:"delete host"});
        } catch(err){
            res.status(404).json({message:"Bad request"});
        }
    }
}