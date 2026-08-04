const chatBox = document.getElementById("chat");
const chatList = document.getElementById("chatList");
const promptInput = document.getElementById("prompt");

const newChatBtn = document.getElementById("newChat");
const generateBtn = document.getElementById("generate");
const chatTitle = document.getElementById("chatTitle");


let chats = JSON.parse(localStorage.getItem("imageAI_chats")) || [];

let currentChat = null;



function saveChats() {

    localStorage.setItem(
        "imageAI_chats",
        JSON.stringify(chats)
    );

}



function renderHistory() {

    chatList.innerHTML = "";


    if (chats.length === 0) {

        chatList.innerHTML =
            `<p class="empty">No chats yet</p>`;

        return;

    }


    chats.forEach(chat => {


        const item = document.createElement("div");

        item.className = "chat-item";

        item.textContent = chat.title;


        item.onclick = () => {

            openChat(chat.id);

        };


        chatList.appendChild(item);


    });


}



function createChat() {


    const id = Date.now();


    const newChat = {

        id,

        title: "New Chat",

        messages: []

    };


    chats.unshift(newChat);


    currentChat = id;


    saveChats();

    renderHistory();

    clearChat();


}



function clearChat() {


    chatBox.innerHTML = `

        <div class="welcome">

            <h1>Create anything with imageAI</h1>

            <p>Describe an image and AI will create it.</p>

        </div>

    `;


    chatTitle.textContent = "New Chat";

}



function openChat(id) {


    currentChat = id;


    const chat = chats.find(
        c => c.id === id
    );


    if (!chat) return;


    chatTitle.textContent = chat.title;


    chatBox.innerHTML = "";


    chat.messages.forEach(message => {


        addMessage(
            message.content,
            message.type
        );


    });


}



function addMessage(content, type) {


    const div = document.createElement("div");


    div.className =
        `message ${type}`;


    div.innerHTML = content;


    chatBox.appendChild(div);


    chatBox.scrollTop =
        chatBox.scrollHeight;


}



function saveMessage(content, type) {


    const chat = chats.find(
        c => c.id === currentChat
    );


    if (!chat) return;


    chat.messages.push({

        content,

        type

    });


    saveChats();


}




async function generateImage() {


    const prompt =
        promptInput.value.trim();


    if (!prompt) return;



    if (!currentChat) {

        createChat();

    }



    const chat =
        chats.find(
            c => c.id === currentChat
        );



    if (chat.title === "New Chat") {

        chat.title =
            prompt.substring(0, 25);

        chatTitle.textContent =
            chat.title;

        renderHistory();

    }



    addMessage(
        prompt,
        "user"
    );


    saveMessage(
        prompt,
        "user"
    );


    promptInput.value = "";



    addMessage(
        "Creating image...",
        "ai"
    );



    try {


        const response =
            await fetch("/generate", {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    prompt

                })

            });



        const data =
            await response.json();



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



        if (!image) {


            addMessage(
                "No image was returned.",
                "ai"
            );


            return;

        }



        const html = `

            <p>Generated image:</p>

            <img src="${image}">

        `;



        addMessage(
            html,
            "ai"
        );


        saveMessage(
            html,
            "ai"
        );



    }

    catch(error){


        addMessage(
            "Image generation failed.",
            "ai"
        );


        console.error(error);


    }


}





newChatBtn.onclick =
    createChat;


generateBtn.onclick =
    generateImage;



promptInput.addEventListener(
    "keydown",
    e => {

        if(e.key === "Enter"){

            generateImage();

        }

    }
);



renderHistory();
