const chatBox = document.getElementById("chat");
const chatList = document.getElementById("chatList");
const promptInput = document.getElementById("prompt");

const newChatBtn = document.getElementById("newChat");
const generateBtn = document.getElementById("generate");
const chatTitle = document.getElementById("chatTitle");


let chats = JSON.parse(
    localStorage.getItem("imageAI_chats")
) || [];

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

    const chat = {

        id: Date.now(),

        title:"New Chat",

        messages:[]

    };


    chats.unshift(chat);

    currentChat = chat.id;


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

    chatTitle.textContent="New Chat";

}



function openChat(id) {

    currentChat=id;


    const chat =
    chats.find(c=>c.id===id);


    if(!chat) return;


    chatTitle.textContent =
    chat.title;


    chatBox.innerHTML="";


    chat.messages.forEach(msg=>{

        addMessage(
            msg.content,
            msg.type
        );

    });

}




function addMessage(content,type) {

    const div=document.createElement("div");

    div.className =
    `message ${type}`;

    div.innerHTML=content;

    chatBox.appendChild(div);

    chatBox.scrollTop =
    chatBox.scrollHeight;

    return div;

}




function saveMessage(content,type) {

    const chat =
    chats.find(c=>c.id===currentChat);


    if(!chat)return;


    chat.messages.push({

        content,

        type

    });


    saveChats();

}




function updateTitle(prompt){

    const chat =
    chats.find(c=>c.id===currentChat);


    if(chat.title==="New Chat") {

        chat.title =
        prompt.substring(0,30);

        chatTitle.textContent =
        chat.title;

        saveChats();

        renderHistory();

    }

}





async function generateImage(){

    const prompt =
    promptInput.value.trim();


    if(!prompt)return;



    if(!currentChat){

        createChat();

    }



    updateTitle(prompt);



    addMessage(
        prompt,
        "user"
    );


    saveMessage(
        prompt,
        "user"
    );


    promptInput.value="";



    const loading =
    addMessage(
`
<span class="creating">
Creating image<span>.</span><span>.</span><span>.</span>
</span>
`,
"ai"
);



    const start =
    Date.now();



    try {


        const response =
        await fetch("/generate",{

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



        loading.remove();



        if(data.error){

            addMessage(
                data.error,
                "ai"
            );

            return;

        }



        const image =
        data.image ||
        data.url ||
        data.result?.sample;



        if(!image){

            addMessage(
                "No image returned.",
                "ai"
            );

            return;

        }



        const seconds =
        ((Date.now()-start)/1000)
        .toFixed(1);



        const result = `

<p>
Here is your image:
</p>


<img 
src="${image}"
class="generated-image"
>


<br>


<a 
href="${image}"
download="imageAI-generated-image.jpg"
class="download-button"
>
Download Image
</a>


<small>
Generated in ${seconds}s
</small>

`;



        addMessage(
            result,
            "ai"
        );


        saveMessage(
            result,
            "ai"
        );



    }


    catch(error){

        loading.remove();


        addMessage(
            "Image generation failed: "
            + error.message,
            "ai"
        );

    }


}



newChatBtn.onclick =
createChat;


generateBtn.onclick =
generateImage;



promptInput.addEventListener(
"keydown",
e=>{

    if(e.key==="Enter"){

        generateImage();

    }

});



renderHistory();
