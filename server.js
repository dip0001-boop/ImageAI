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



function sleep(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}




app.post("/generate", async (req, res) => {


    try {


        const { prompt } = req.body;


        if (!prompt) {

            return res.status(400).json({

                error: "Missing image prompt"

            });

        }



        if (!FLUX_API_KEY) {

            return res.status(500).json({

                error: "FLUX_API_KEY is missing"

            });

        }




        // Create image request

        const create = await fetch(
            "https://api.bfl.ml/v1/flux-pro-1.1",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "X-Key": FLUX_API_KEY

                },


                body: JSON.stringify({

                    prompt: prompt,

                    width: 1024,

                    height: 1024,

                    output_format: "jpeg"

                })

            }
        );



        const createData =
            await create.json();



        console.log(
            "FLUX CREATE:",
            createData
        );



        if (!createData.id) {


            return res.status(500).json({

                error:
                "FLUX did not create a job: "
                + JSON.stringify(createData)

            });


        }



        const jobId =
            createData.id;



        let result = null;



        // Check status

        for (
            let i = 0;
            i < 60;
            i++
        ) {


            await sleep(2000);



            const status =
            await fetch(

                `https://api.bfl.ml/v1/get_result?id=${jobId}`,

                {

                    headers: {

                        "X-Key":
                        FLUX_API_KEY

                    }

                }

            );



            result =
            await status.json();



            console.log(
                "FLUX STATUS:",
                result.status
            );



            if (
                result.status === "Ready"
            ) {

                break;

            }



            if (
                result.status === "Failed"
            ) {

                return res.status(500).json({

                    error:
                    "FLUX generation failed"

                });

            }


        }




        if (
            !result ||
            !result.result ||
            !result.result.sample
        ) {


            return res.status(500).json({

                error:
                "FLUX timed out"

            });


        }




        res.json({

            image:
            result.result.sample

        });



    }

    catch(error) {


        console.error(
            "SERVER ERROR:",
            error
        );


        res.status(500).json({

            error:
            error.message

        });


    }


});






app.listen(PORT, () => {

    console.log(
        `imageAI running on port ${PORT}`
    );

});
