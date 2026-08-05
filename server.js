const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { fal } = require("@fal-ai/client");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const PORT = process.env.PORT || 3000;

const FAL_KEY = process.env.FAL_KEY;

if (!FAL_KEY) {
    console.log("WARNING: Missing FAL_KEY");
}

fal.config({
    credentials: FAL_KEY
});


app.post("/generate", async (req, res) => {

    try {

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: "No prompt provided"
            });
        }


        console.log("Sending request to fal.ai...");


        const result = await fal.subscribe(
            "fal-ai/flux/schnell",
            {
                input: {
                    prompt: prompt,
                    image_size: "square",
                    num_images: 1
                }
            }
        );


        console.log("Generation complete");


        const image =
            result.data.images[0].url;


        res.json({
            image
        });


    } catch(error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});


app.listen(PORT, () => {
    console.log(`imageAI running on port ${PORT}`);
});
