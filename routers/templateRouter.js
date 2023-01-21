const { Router } = require("express");
const { templateController } = require("../controllers/templateController");
const templateRouter = new Router();

const middleware = require("../middlewares/middleware");
module.exports = { templateRouter };

templateRouter.post("/", middleware, templateController.createTemplate);
templateRouter.get("/", middleware, templateController.getAllItem);