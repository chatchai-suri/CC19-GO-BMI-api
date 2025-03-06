const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.createChat = async (req, res, next) => {
  try {
    const key = process.env.GEMINI_PROMPT_KEY
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = req.body.text;

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    const response = result.response.text()
    // const result = await axios.post("http://localhost:8899/api/user/weeklyPlan")
    res.status(200).json({ message: "Hello Chat" , result: response});
  } catch (error) {
    console.log(error);
  }
}