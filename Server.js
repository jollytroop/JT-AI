import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(express.static(".")); // Serve index.html

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    if (userMessage.toLowerCase().includes("generate image")) {
      // Imagen 3 API
      const imgRes = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0:generateImage?key=" +
          process.env.GOOGLE_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMessage, size: "1024x1024" }),
        }
      );
      const imgData = await imgRes.json();
      res.json({
        reply: "Here’s the image I generated for you:",
        image: imgData.data[0].url,
      });
    } else {
      // GPT-5 via OpenAI
      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      const gptData = await gptRes.json();
      res.json({ reply: gptData.choices[0].message.content });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "⚠️ Error connecting to AI services." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Jollytroop AI running on http://localhost:${PORT}`)
);
