require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const Groq = require("groq-sdk/index");
const cors = require("cors");

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const app = express();
const PORT = 5000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static("uploads"));
app.use(cors());

app.get("/api/generate_instructions", (req, res) => {
  return res.json({ msg: "hitting generate_instructions" });
});

app.post(
  "/api/generate_instrutions",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const files = req.files;
      const { context = "" } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      let descriptions = [];

      for (let file of files) {
        const imagePath = path.join(__dirname, "uploads", file.filename);
        console.log(`image path: ${imagePath}`);

        const description = await getCLIPDescription(imagePath);
        console.log(description);
        descriptions.push(description);
      }
      const instructions = await generateInstructionsWithGroq(
        descriptions,
        context
      );

      res.json({ instructions: instructions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error generating instructions" });
    }
  }
);

const getCLIPDescription = (imagePath) => {
  return new Promise((resolve, reject) => {
    exec(
      `python blip_description.py "${imagePath}"`,
      (error, stdout, stderr) => {
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
        resolve(stdout.trim());
      }
    );
  });
};

const generateInstructionsWithGroq = async (descriptions, context) => {
  const prompt = `Give me detailed instructions or test cases for testing a digital feature as a QA Engineer that is in the captions and don't ask any additional questions. 
  Describe each test case , give Pre-Condition , TEsting steps and Expected Results for each teast case:\n\n${descriptions.join(
    "\n"
  )}\n\nContext: ${context}`;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-70b-versatile",
    });

    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error calling Groq: ${error.message}`);
    throw error;
  }
};

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
