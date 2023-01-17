const auth = require("../middlewares/auth");

exports.problemsController = {
  getAllProblems(req, res) {
    try {
      console.log(auth);
      console.log("get all problems");
      res.json({ message: "get all problems" });
    } catch (err) {
        res.status(404).json({ message: "Cannot get all problems" });
    }
  },
};
