exports.problemsController = {
    getAllProblems(req, res) {
        console.log('get all problems');
        res.json({message:"get all problems"});
    }
}