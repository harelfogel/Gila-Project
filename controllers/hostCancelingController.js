exports.hostCancelingController = {
    deleteHost(req, res) {
        console.log('delete Host');
        res.json({message:"delete host"});
    }
}