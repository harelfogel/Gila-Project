const { Router } = require("express");
const { trendController } = require("../controllers/trendController");
const trendRouter = new Router();

const middleware = require("../middlewares/middleware");
module.exports = { trendRouter };

trendRouter.get("/", middleware, trendController.getTrend);