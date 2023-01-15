exports.newHostController = {
    createHost(req, res) {
        console.log('create Host');
        res.json({message:"create host"});
    }
}