// The 8 core Love Test questions.
// girlQ  -> asked to the girl, about herself
// boyQ   -> asked to the boy, about the girl (uses {girlName} placeholder)

const QUESTIONS = [
  {
    id: 1,
    key: "favColor",
    label: "Favorite Color",
    girlQ: "What is your favorite color?",
    boyQ: "What is {girlName}'s favorite color?",
  },
  {
    id: 2,
    key: "favFood",
    label: "Favorite Food",
    girlQ: "What is your favorite food?",
    boyQ: "What is {girlName}'s favorite food?",
  },
  {
    id: 3,
    key: "firstMeet",
    label: "Where You First Met",
    girlQ: "Where did you two first meet?",
    boyQ: "Where did you and {girlName} first meet?",
  },
  {
    id: 4,
    key: "firstKiss",
    label: "First Kiss",
    girlQ: "Where (or when) was your first kiss?",
    boyQ: "Where (or when) was your first kiss with {girlName}?",
  },
  {
    id: 5,
    key: "firstILoveYou",
    label: "Who Said 'I Love You' First",
    girlQ: "Who said 'I love you' first, and where?",
    boyQ: "Who said 'I love you' first, and where?",
  },
  {
    id: 6,
    key: "favMemory",
    label: "Favorite Memory Together",
    girlQ: "What is your favorite memory together?",
    boyQ: "What is {girlName}'s favorite memory together?",
  },
  {
    id: 7,
    key: "dreamDate",
    label: "Dream Date",
    girlQ: "What is your dream date?",
    boyQ: "What is {girlName}'s dream date?",
  },
  {
    id: 8,
    key: "loveMost",
    label: "What They Love Most About Their Partner",
    girlQ: "What is one thing you love most about your partner?",
    boyQ: "What is one thing {girlName} loves most about you?",
  },
];

function getQuestionsForGirl() {
  return QUESTIONS.map((q) => ({ id: q.id, key: q.key, label: q.label, question: q.girlQ }));
}

function getQuestionsForBoy(girlName) {
  return QUESTIONS.map((q) => ({
    id: q.id,
    key: q.key,
    label: q.label,
    question: q.boyQ.replace("{girlName}", girlName || "her"),
  }));
}

module.exports = { QUESTIONS, getQuestionsForGirl, getQuestionsForBoy };
