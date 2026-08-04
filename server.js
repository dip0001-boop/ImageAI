const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const PORT = process.env.PORT || 3000;

const FLUX_API_KEY = process.env.FLUX_API_KEY;


function timeout(ms) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), ms)
    );
}


async function fetchWithTimeout(url, options, ms = 60000) {

    return Promise.race([
        fetch(url, options),
        timeout(ms)
    ]);

}



app.post("/generate", async (req, res) => {

    try {

        const { prompt } = req.body;


        if (!prompt) {

            return res.status(400).json({
                error: "No prompt provided"
            });

        }


        if (!FLUX_API_KEY) {

            return res.status(500).json({
                error: "FLUX_API_KEY missing"
            });

        }



        console.log("Sending request to FLUX...");


        const response = await fetchWithTimeout(

            "https://api.bfl.ml/v1/flux-pro-1.1",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    "X-Key":FLUX_API_KEY

                },

                body:JSON.stringify({

                    prompt,

                    width:1024,

                    height:1024

                })

            },

            60000

        );



        const data = await response.json();


        console.log("FLUX RESPONSE:", data);



        if(!response.ok){

            return res.status(500).json({

                error:
                JSON.stringify(data)

            });

        }



        res.json(data);



    }

    catch(error){

        console.error(
            "SERVER ERROR:",
            error
        );


        res.status(500).json({

            error:error.message

        });

    }

});




app.listen(PORT,()=>{

    console.log(
        `imageAI running on port ${PORT}`
    );

});

app.get("/test-flux", async (req, res) => {

    try {

        const response = await fetch("https://api.bfl.ml");

        res.json({
            status: "reachable",
            code: response.status
        });

    } catch(error) {

        res.json({
            status: "failed",
            error: error.message
        });

    }

});
