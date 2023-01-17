
const axios = require("axios");
exports.problemsController = {
  getAllProblems(req, res) {
    try {
      const auth= req.data;
      console.log("get all problems");
      console.log(req.data);
      res.json({ message: `${auth}` });
    } catch (err) {
        res.status(404).json({ message: "Cannot get all problems" });
    }
  },
};
