const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const { QUESTIONS, getQuestionsForGirl, getQuestionsForBoy } = require("../data/questions");
const { compareAnswers, calculatePercentage, generateLoveChat } = require("../utils/loveEngine");

// GET /api/questions/girl
function getGirlQuestions(req, res) {
  res.json({ questions: getQuestionsForGirl() });
}

// GET /api/questions/boy?girlName=...
function getBoyQuestions(req, res) {
  const girlName = req.query.girlName || "her";
  res.json({ questions: getQuestionsForBoy(girlName) });
}

// POST /api/sessions
// body: { girlName, boyName, answers: { favColor, favFood, firstMeet, firstKiss, firstILoveYou, favMemory, dreamDate, loveMost } }
function createSession(req, res) {
  const { girlName, boyName, answers } = req.body;

  if (!girlName || !answers) {
    return res.status(400).json({ error: "girlName and answers are required" });
  }

  const missingKeys = QUESTIONS.map((q) => q.key).filter((k) => !answers[k]);
  if (missingKeys.length > 0) {
    return res.status(400).json({ error: `Missing answers for: ${missingKeys.join(", ")}` });
  }

  const session = {
    id: uuidv4(),
    girlName,
    boyName: boyName || null,
    girlAnswers: answers,
    boyAnswers: null,
    result: null,
    status: "waiting_for_boy",
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  db.saveSession(session);

  res.status(201).json({ sessionId: session.id, status: "waiting_for_boy" });
}

// GET /api/sessions/:id
function getSession(req, res) {
  const session = db.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  res.json({
    sessionId: session.id,
    girlName: session.girlName,
    boyName: session.boyName,
    status: session.status,
    createdAt: session.createdAt,
    result: session.result,
  });
}

// POST /api/sessions/:id/boy-answers
// body: { boyName, answers: { ...same 8 keys... } }
function submitBoyAnswers(req, res) {
  const { id } = req.params;
  const { boyName, answers } = req.body;

  const session = db.getSession(id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  if (session.status === "completed") {
    return res.status(400).json({ error: "This love test has already been completed" });
  }

  if (!answers) {
    return res.status(400).json({ error: "answers is required" });
  }

  const missingKeys = QUESTIONS.map((q) => q.key).filter((k) => !answers[k]);
  if (missingKeys.length > 0) {
    return res.status(400).json({ error: `Missing answers for: ${missingKeys.join(", ")}` });
  }

  const breakdown = compareAnswers(session.girlAnswers, answers);
  const percentageData = calculatePercentage(breakdown);
  const finalBoyName = boyName || session.boyName || "Him";
  const chat = generateLoveChat(session.girlName, finalBoyName, breakdown, percentageData);

  const result = {
    girlName: session.girlName,
    boyName: finalBoyName,
    percentage: percentageData.percentage,
    correctCount: percentageData.correctCount,
    total: percentageData.total,
    tier: chat.tier,
    breakdown,
    chat: chat.messages,
  };

  session.boyName = finalBoyName;
  session.boyAnswers = answers;
  session.result = result;
  session.status = "completed";
  session.completedAt = new Date().toISOString();
  db.saveSession(session);

  res.json({ sessionId: id, status: "completed", result });
}

// GET /api/sessions/:id/result
function getResult(req, res) {
  const session = db.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found" });

  if (session.status !== "completed" || !session.result) {
    return res.status(400).json({ error: "Result not ready yet. Boy hasn't submitted answers." });
  }

  res.json({ sessionId: session.id, result: session.result });
}

module.exports = {
  getGirlQuestions,
  getBoyQuestions,
  createSession,
  getSession,
  submitBoyAnswers,
  getResult,
};
