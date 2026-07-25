const express = require("express");
const router = express.Router();
const controller = require("../controllers/sessionController");

// Question fetchers (frontend uses these to render the two quiz forms)
router.get("/questions/girl", controller.getGirlQuestions);
router.get("/questions/boy", controller.getBoyQuestions);

// Session lifecycle
router.post("/sessions", controller.createSession); // girl submits her answers -> creates session
router.get("/sessions/:id", controller.getSession); // check status
router.post("/sessions/:id/boy-answers", controller.submitBoyAnswers); // boy submits -> triggers scoring
router.get("/sessions/:id/result", controller.getResult); // fetch final result + chat

module.exports = router;
