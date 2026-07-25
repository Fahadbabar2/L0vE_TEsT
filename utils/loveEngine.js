const { QUESTIONS } = require("../data/questions");

// Normalize text so trivial differences (case, punctuation, spacing) don't count as "wrong"
function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

// Lenient match: exact match OR one answer contains the other (handles short vs descriptive answers)
function isMatch(girlAnswer, boyAnswer) {
  const a = normalize(girlAnswer);
  const b = normalize(boyAnswer);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length > 2 && b.includes(a)) return true;
  if (b.length > 2 && a.includes(b)) return true;
  return false;
}

// Build per-question breakdown comparing girl's real answers vs boy's guesses
function compareAnswers(girlAnswers, boyAnswers) {
  return QUESTIONS.map((q) => {
    const girlAns = girlAnswers[q.key] || "";
    const boyAns = boyAnswers[q.key] || "";
    const correct = isMatch(girlAns, boyAns);
    return {
      id: q.id,
      key: q.key,
      label: q.label,
      girlAnswer: girlAns,
      boyAnswer: boyAns,
      correct,
    };
  });
}

function calculatePercentage(breakdown) {
  const correctCount = breakdown.filter((b) => b.correct).length;
  const percentage = Math.round((correctCount / breakdown.length) * 100);
  return { correctCount, total: breakdown.length, percentage };
}

// Percentage tier -> vibe used to color the generated chat
function getTier(percentage) {
  if (percentage === 100) return "soulmates";
  if (percentage >= 75) return "deeply_in_love";
  if (percentage >= 50) return "good_connection";
  if (percentage >= 25) return "needs_more_talks";
  return "just_getting_started";
}

const TIER_INTROS = {
  soulmates: "Okay wait... this is actually unreal. 💍✨",
  deeply_in_love: "Aww, this is really sweet. 💕",
  good_connection: "Not bad! There's real love here. 😊",
  needs_more_talks: "Hmm, a few gaps here... but that's okay! 🌱",
  just_getting_started: "Looks like there's a lot still to learn about each other! 😅",
};

const TIER_OUTROS = {
  soulmates: "You two clearly know each other inside and out. Keep this magic alive! 💖",
  deeply_in_love: "You're paying attention to what matters. That's real love. 💗",
  good_connection: "A solid foundation — talk about the ones you missed tonight. 💬",
  needs_more_talks: "Every couple has room to grow. Use this as a fun conversation starter! 🌷",
  just_getting_started: "No worries — this is a great excuse for a long, cozy talk together. ☕💬",
};

// Generates a "chat" style narrative: an array of {sender, text} messages
function generateLoveChat(girlName, boyName, breakdown, percentageData) {
  const { percentage, correctCount, total } = percentageData;
  const tier = getTier(percentage);
  const messages = [];

  messages.push({
    sender: "system",
    text: `💌 Love Test Results for ${boyName || "Him"} & ${girlName || "Her"}`,
  });

  messages.push({ sender: "cupid", text: TIER_INTROS[tier] });

  breakdown.forEach((item) => {
    if (item.correct) {
      messages.push({
        sender: "cupid",
        text: `✅ ${boyName || "He"} got "${item.label}" right! He said "${item.boyAnswer}" — spot on! 🎯`,
      });
    } else {
      messages.push({
        sender: "cupid",
        text: `❌ For "${item.label}", ${boyName || "he"} guessed "${item.boyAnswer}" but ${girlName || "she"} actually said "${item.girlAnswer}". Close one to work on! 💭`,
      });
    }
  });

  messages.push({
    sender: "cupid",
    text: `📊 Final Score: ${correctCount}/${total} correct — that's a ${percentage}% Love Match!`,
  });

  messages.push({ sender: "cupid", text: TIER_OUTROS[tier] });

  return { tier, messages };
}

module.exports = { compareAnswers, calculatePercentage, generateLoveChat };
