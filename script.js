const chat = document.getElementById("chat");
const promptInput = document.getElementById("prompt");


function addMessage(content, type) {

    const div = document.createElement("div");

    div.className = `message ${type}`;

    div.innerHTML = content;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;
}


async function generate() {

    const prompt = promptInput.value.trim();

    if (!prompt) return;


    addMessage(prompt, "user");

    promptInput.value = "";


    addMessage(
        "Creating image...",
        "ai"
    );


    try {

        const response = await fetch("/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                prompt
            })

        });


        const data = await response.json();


        if (data.error) {

            addMessage(
                data.error,
                "ai"
            );

            return;
        }


        const image =
            data.result?.sample ||
            data.image ||
            data.url;


        if (image) {

            addMessage(
                `
                <p>Generated image:</p>
                <img src="${image}">
                `,
                "ai"
            );

        } else {

            addMessage(
                "Image generation started but no image URL was returned.",
                "ai"
            );

        }


    } catch (err) {

        addMessage(
            "Something went wrong.",
            "ai"
        );

        console.error(err);
    }
}


promptInput.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            generate();
        }

    }
);
