const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const PORT = process.env.PORT || 3000;

app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: "No prompt provided"
            });
        }

        const response = await fetch(
            "https://api.bfl.ml/v1/flux-pro-1.1",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Key": process.env.FLUX_API_KEY
                },
                body: JSON.stringify({
                    prompt: prompt,
                    width: 1024,
                    height: 1024
                })
            }
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Image generation failed"
        });
    }
});


app.listen(PORT, () => {
    console.log(`imageAI running on port ${PORT}`);
});
