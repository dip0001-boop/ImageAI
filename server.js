const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const PORT = process.env.PORT || 3000;

const API_KEY = process.env.FLUX_API_KEY;


const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));



app.post("/generate", async (req, res) => {

    try {

        const { prompt } = req.body;


        if (!prompt) {
            return res.status(400).json({
                error: "No prompt provided"
            });
        }


        if (!API_KEY) {
            return res.status(500).json({
                error: "Missing FLUX_API_KEY"
            });
        }



        console.log("Sending request to BFL...");



        const createResponse = await fetch(
            "https://api.bfl.ai/v1/flux-2-klein-4b",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "x-key": API_KEY,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    prompt,
                    width: 1024,
                    height: 1024
                })
            }
        );



        const createData =
            await createResponse.json();



        console.log("CREATE:", createData);



        if (!createData.id || !createData.polling_url) {

            return res.status(500).json({

                error:
                JSON.stringify(createData)

            });

        }



        let result;



        for(let i = 0; i < 60; i++) {


            await sleep(2000);



            const poll =
            await fetch(
                createData.polling_url,
                {
                    headers:{
                        "x-key": API_KEY
                    }
                }
            );


            result =
            await poll.json();



            console.log(
                "STATUS:",
                result.status
            );



            if(result.status === "Ready") {
                break;
            }


            if(
                result.status === "Error" ||
                result.status === "Failed"
            ){

                return res.status(500).json({
                    error:"FLUX generation failed"
                });

            }

        }



        if(!result?.result?.sample){

            return res.status(500).json({

                error:"No image returned"

            });

        }



        res.json({

            image:
            result.result.sample

        });



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




app.listen(PORT, ()=>{

    console.log(
        `imageAI running on port ${PORT}`
    );

});
