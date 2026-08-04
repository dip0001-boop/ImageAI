const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const PORT = process.env.PORT || 3000;

const FLUX_KEY = process.env.FLUX_API_KEY;



async function sleep(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}




app.post("/generate", async (req, res) => {


    try {


        const { prompt } = req.body;


        if (!prompt) {

            return res.status(400).json({

                error:"No prompt provided"

            });

        }



        if (!FLUX_KEY) {

            return res.status(500).json({

                error:"FLUX API key missing"

            });

        }




        // Start generation

        const createResponse =
            await fetch(
                "https://api.bfl.ml/v1/flux-pro-1.1",
                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                        "application/json",

                        "X-Key":
                        FLUX_KEY

                    },


                    body:JSON.stringify({

                        prompt,

                        width:1024,

                        height:1024

                    })

                }

            );



        const createData =
            await createResponse.json();



        if (!createData.id) {


            return res.status(500).json({

                error:
                "FLUX did not return a job id"

            });


        }



        const id =
            createData.id;




        // Wait for image

        let result;



        for(let i = 0; i < 30; i++){


            await sleep(2000);



            const statusResponse =
                await fetch(

                    `https://api.bfl.ml/v1/get_result?id=${id}`,

                    {

                        headers:{

                            "X-Key":
                            FLUX_KEY

                        }

                    }

                );



            result =
                await statusResponse.json();



            if(result.status === "Ready"){

                break;

            }


        }




        if(!result?.result?.sample){


            return res.status(500).json({

                error:
                "Image generation timed out"

            });


        }




        res.json({

            image:
            result.result.sample

        });



    }

    catch(error){


        console.error(error);


        res.status(500).json({

            error:
            "Server error"

        });


    }


});





app.listen(PORT, () => {

    console.log(
        `imageAI running on port ${PORT}`
    );

});
