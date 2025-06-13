const sidePanel = document.getElementById("side");
const mainPanel = document.getElementById("main-content");
const openSideBtn = document.getElementById("openside-btn");
const closeSideBtn = document.getElementById("closeside-btn");
const totalSubmit=document.getElementById("submit");
const introTemplate=document.getElementById("intro-template");
const msgContain=document.getElementById("msg-contain");
const textField = document.getElementById("sendText");
const chatContentDisplay=document.getElementById("chat-content-display");
const navBar=document.getElementById("nav");
const resetUiButton=document.getElementById("nav");
const generalPanel=document.getElementById("general-call");
// const voicePanel=document.getElementById("voice-call");
const aboutPanel=document.getElementById("about-call");
const contactUsPanel=document.getElementById("contact_us-call");
const titles=document.getElementById("titles");
const new_chat=document.getElementById("new_chat");
let entered=0;
window.chat_id = null; 
window.set_id = null;  
openSideBtn.addEventListener("click", () => {
    console.log("openside");
    mainPanel.style.width="80%";
    openSideBtn.style.display = "none";
    closeSideBtn.style.display = "block";
});
closeSideBtn.addEventListener("click", () => {
    console.log("closebtn");
    mainPanel.style.width="100%";
    sidePanel.style.zIndex=0;
    openSideBtn.style.display = "block";
    closeSideBtn.style.display = "none";
});
document.addEventListener('DOMContentLoaded', () => {
    const tools = document.querySelectorAll('.tool-name');
    const sections = document.querySelectorAll('.content-section');
    const backgroundIndicator = document.querySelector('.background-indicator');

    if (tools.length > 0) {
        tools[0].classList.add('selected');
        activateSection('general');
        moveBackground(tools[0]);
    }

    tools.forEach(tool => {
        tool.addEventListener('click', function (e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-target');
            tools.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            activateSection(targetSection);

            moveBackground(this);
        });
    });
    function activateSection(targetSection) {
        sections.forEach(section => {
            if (section.dataset.section === targetSection) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }
    function moveBackground(target) {
        const rect = target.getBoundingClientRect();
        const parentRect = target.parentElement.getBoundingClientRect();
        const leftOffset = rect.left - parentRect.left;
        backgroundIndicator.style.transform = `translateX(${leftOffset}px)`;
        backgroundIndicator.style.width = `${rect.width}px`;
    }

});
let lastChatId = null; 
new_chat.addEventListener("click", async () => {
    console.log("Creating new chat...");
    const lastChatHasContent = await checkLastChatHasContent(lastChatId);

    if (!lastChatId || lastChatHasContent) {
        const chat_id = await createNewChat();
        if (chat_id) {
            console.log("New chat created with ID:", chat_id);
            console.log("Now you can send messages to the new chat.");
            lastChatId = chat_id; 
        } else {
            console.error("Failed to create new chat.");
            alert("failed to create chat. reload the server or website");
            introDefault();
            resetui();
            location.reload();
        }
    } else {

        createNewChat()
        new_chat.disabled=false;
        console.warn("The last chat is empty. Please add content before creating a new chat.");
    }
});
async function checkLastChatHasContent(chat_id) {
    if (!chat_id) return true;

    try {

        const response = await fetch(`/get_chat_messages/${chat_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Messages for chat:", chat_id, data.messages);

            return data.messages && data.messages.length > 0; 
        } else {
            console.error("Error retrieving messages:", data.detail);
            alert("we got some problem in our side.");
            alert("reloading website to resolve this problem");
            location.reload();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("we got some problem in our side.");
        location.reload();
    }

    return false; 
}
/**
 * @param {string} text 
 * @returns {string}
 */
// function formatTextWithGaps(text) {
//     const nonEnglishRegex = /[^\u0000-\u007F]/; 
//     const boldRegex = /\*\*(.+?)\*\*/g; 
//     const lines = text.split("\n");

//     let formattedText = "";
//     let isNonEnglishBlock = false;

//     lines.forEach((line, index) => {
//         const trimmedLine = line.trim();
//         if (!trimmedLine) return; 
//         const lineWithBold = trimmedLine.replace(boldRegex, "<b>$1</b>");

//         const isNonEnglishLine = nonEnglishRegex.test(lineWithBold);

//         if (isNonEnglishLine) {
//             if (!isNonEnglishBlock) {
//                 formattedText += `<div id="sanskrit">`;
//                 isNonEnglishBlock = true;
//             }
//             formattedText += lineWithBold;
//         } else {
//             if (isNonEnglishBlock) {
//                 formattedText += `</div>`;
//                 isNonEnglishBlock = false;
//             }
//             formattedText += `<span>${lineWithBold}</span>`;
//         }
//         if (index < lines.length - 1) {
//             formattedText += "<br>";
//         }
//     });
//     if (isNonEnglishBlock) {
//         formattedText += `</div>`;
//     }

//     return formattedText;
// }
/**
 * @param {object|string} text 
 * @returns {string}
 */
function formatTextWithGaps(text) {
    console.log("got formatting text:", text);

    let label = "", kanda = "", verse = "", evidence = "", explanation = "";

    try {
        const jsonData = (typeof text === "string") ? JSON.parse(text) : text;

        // Defensive check if it is really a valid object
        if (jsonData && typeof jsonData === "object") {
            label = jsonData.Label || "";
            kanda = jsonData.Kanda || "";
            verse = jsonData.Verse || "";
            evidence = jsonData.Evidence || "";
            explanation = jsonData.Explanation || "";
        }
    } catch (e) {
        console.error("Error parsing answer text:", e);
        return `<div class="error">Error displaying result.</div>`;
    }

    return `
        <div class="label"><strong>Label:</strong> ${label}</div>
        ${kanda ? `<div class="kanda"><strong>Kanda:</strong> ${kanda}</div>` : ""}
        ${verse ? `<div class="verse"><strong>Verse:</strong> ${verse}</div>` : ""}
        <div id="sanskrit"><strong>Evidence:</strong> ${evidence}</div>
        <div id="sanskrit"><strong>Explanation:</strong> ${explanation}</div>
    `;
}

function displayMessages(messages) {
    console.log("entering display messages");
    console.log(messages);
    msgContain.innerHTML = "";
    messages.forEach((message) => {
        const sendDiv = document.createElement("div");
        sendDiv.classList.add("send");

        const sendSpan = document.createElement("span");
        sendSpan.textContent = message.question; 

        const sendImg = document.createElement("img");
        sendImg.src = "../static/img/user.png";

        sendDiv.appendChild(sendSpan);
        sendDiv.appendChild(sendImg);
        const receiveDiv = document.createElement("div");
        receiveDiv.classList.add("receive");

        const receiveImg = document.createElement("img");
        receiveImg.src = "../static/img/spark.png"; 
        receiveImg.style.animationName="none";
        const receiveInnerDiv = document.createElement("div");
        receiveInnerDiv.classList.add("receive_div");

        const receiveSpan = document.createElement("span");
        console.log("entering before format", message.answer);
        receiveSpan.innerHTML = formatTextWithGaps(message.answer);
        console.log("entering display message");
        // receiveSpan.innerHTML = message.answer;

        receiveInnerDiv.appendChild(receiveSpan);
        receiveDiv.appendChild(receiveImg);
        receiveDiv.appendChild(receiveInnerDiv);
        msgContain.appendChild(sendDiv);
        msgContain.appendChild(receiveDiv);
    });
    msgContain.scrollTo({
        top: msgContain.scrollHeight,
        behavior: "smooth",
    });
    console.log("Messages displayed successfully.");
    textField.disabled=false;
}

function addTemplate(chat_id, question) {
    console.log(`Attempting to create template for chat_id: ${chat_id}`);
    const existingTemplate = Array.from(titles.children).find((child) => {
        return child.getAttribute("data-chat-id") === String(chat_id);
    });

    if (existingTemplate) {
        console.log(`Template for chat_id ${chat_id} already exists. Skipping creation.`);
        return;
    }

    console.log(`Creating template for chat_id: ${chat_id}`);
    const titleTemplate = document.createElement("button");
    titleTemplate.classList.add("title-template");
    titleTemplate.setAttribute("data-chat-id", chat_id);
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("title-first");
    const titleDivImg = document.createElement("img");
    titleDivImg.src = "../static/img/msg.png";
    const titleDivSpan = document.createElement("span");
    titleDivSpan.textContent = question;
    titleDiv.appendChild(titleDivImg);
    titleDiv.appendChild(titleDivSpan);
    const deleteDiv = document.createElement("div");
    deleteDiv.classList.add("delete-btn");
    const deleteImg = document.createElement("img");
    deleteImg.src = "../static/img/delete.png";
    const tooltip = document.createElement("div");
    tooltip.textContent = "Delete";
    tooltip.classList.add("tooltip");
    deleteDiv.appendChild(deleteImg);
    deleteDiv.appendChild(tooltip);
    deleteDiv.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = confirm(`Are you sure you want to delete this chat?`);
        if (!confirmed) return;
        try {
            new_chat.disabled = true;
            const response = await fetch(`/delete_chat/${chat_id}/`, { method: "DELETE" });
            if (response.ok) {
                console.log(`chat_id ${chat_id} deleted successfully from the database.`);
                titleTemplate.remove();
                const remainingTemplates = Array.from(titles.children);
                if (remainingTemplates.length > 0) {
                    const lastTemplate = remainingTemplates[remainingTemplates.length - 1];
                    lastTemplate.click();
                    new_chat.disabled = true;
                } else {
                    console.log("No templates remaining.");
                    createNewChat();
                }
            } else {
                console.error(`Failed to delete chat_id ${chat_id} from the database.`);
                alert("Failed to delete the chat. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting chat_id:", error);
            alert("An error occurred while deleting the chat. try again later");
        }
    });
    titleTemplate.appendChild(titleDiv);
    titleTemplate.appendChild(deleteDiv);
    titleTemplate.onclick = () => {
        console.log(`Clicked on template for chat_id: ${chat_id}`);
        window.chat_id = chat_id;
        setId(); 
        getChatMessages(chat_id); 
        Array.from(titles.children).forEach((child) => {
            child.classList.remove("active");
            child.style.boxShadow = "none";
        });
        titleTemplate.classList.add("active");
        titleTemplate.style.boxShadow = "0 0 5px #FFCB47";
    };
    if (window.chat_id === chat_id) {
        Array.from(titles.children).forEach((child) => {
            child.classList.remove("active");
            child.style.boxShadow = "none";
        });
        titleTemplate.classList.add("active");
        titleTemplate.style.boxShadow = "0 0 5px #FFCB47";
    }

    titles.append(titleTemplate);
titles.scrollTo({
    top: titles.scrollHeight,
    behavior: "smooth",
});
    console.log(`Template for chat_id ${chat_id} successfully added.`);
}


async function getChatMessages(chat_id) {
    console.log("entered get chat msgs");
    const titleTemplateButtons = document.querySelectorAll('.title-template');
    let dotsBtn=document.querySelectorAll(".delete-btn");
    introTemplate.style.display="none";
    msgContain.style.display="flex";
    navBar.style.top="10px";
    chatContentDisplay.style.marginTop="30px";
    try {
        new_chat.disabled = true;
        titleTemplateButtons.forEach(button => {
            button.disabled = true;
          });
          dotsBtn.forEach((btn) => {
            btn.style.pointerEvents = "none"; 
            btn.style.opacity = "0.5";     
        });
        textField.disabled=true;
        const response = await fetch(`/get_chat_messages/${chat_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            console.log("Messages for chat:", chat_id);
            displayMessages(data.messages);
            new_chat.disabled = false;
            titleTemplateButtons.forEach(button => {
                button.disabled = false;
              });
              dotsBtn.forEach((btn) => {
                btn.style.pointerEvents = "auto";  
                btn.style.opacity = "1";         
            });
              textField.disabled=false;
              
        } else {
            console.log("Error:", error);
            console.log("Error retrieving messages:", data.detail);
            // alert("cannot communicate with server . the website will be reloaded shortly to resolve this error or (restart the server)")
            // location.reload();
        }
    } catch (error) {
        console.error("Error:", error);
        
        // alert("cannot communicate with server . the website will be reloaded shortly to resolve this error or (restart the server)")
        // location.reload();
    }
}


async function createNewChat() {
    console.log("Creating a new chat...");
    resetui();
    introDefault();
    const titleTemplateButtons = document.querySelectorAll('.title-template');
    let dotsBtn=document.querySelectorAll(".delete-btn");
    try {
        new_chat.disabled = true;
        titleTemplateButtons.forEach(button => {
            button.disabled = true;
          });   
          dotsBtn.forEach((btn) => {
            btn.style.pointerEvents = "none"; 
            btn.style.opacity = "0.5";         
        });      
        const response = await fetch('/new_chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (response.ok) {
            console.log("New Chat Created:", data.chat_id);
            window.chat_id = data.chat_id;
            setId(); 
            new_chat.disabled = true;
            titleTemplateButtons.forEach(button => {
                button.disabled = false;
              });
              dotsBtn.forEach((btn) => {
                btn.style.pointerEvents = "aotu"; 
                btn.style.opacity = "1";       
            });
            return data.chat_id;
        } else {
            console.error("Failed to create a new chat.");
            alert("cannot communicate with server. website will be reloaded shortly to resolve this error or try restarting the server")
            location.reload();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("cannot communicate with server. website will be reloaded shortly to resolve this error or try restarting the server")
        location.reload();
    }
    return null; 
}
async function sendMessage(chat_id, question) {
    const message = { question: question };
    addTemplate(chat_id,question);
    introTemplate.style.display = "none";
    chatContentDisplay.style.marginTop = "30px";
    navBar.style.top = "10px";
    msgContain.style.display = "flex";
    const sendDiv = document.createElement("div");
    sendDiv.classList.add("send");
    const sendSpan = document.createElement("span");
    sendSpan.textContent = message.question;
    const sendImg = document.createElement("img");
    sendImg.src = "../static/img/user.png"; 
    sendDiv.appendChild(sendSpan);
    sendDiv.appendChild(sendImg);
    msgContain.appendChild(sendDiv);
    const receiveDiv = document.createElement("div");
    receiveDiv.classList.add("receive");
    const receiveImg = document.createElement("img");
    receiveImg.src = "../static/img/spark.png"; 
    receiveImg.style.animationName="pop";
    receiveDiv.appendChild(receiveImg);
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading_contain';
    const loading1 = document.createElement('div');
    loading1.className = 'loading';
    const loading2 = document.createElement('div');
    loading2.className = 'loading';
    loading2.style.width = '100px';
    loadingContainer.appendChild(loading1);
    loadingContainer.appendChild(loading2);
    receiveDiv.appendChild(loadingContainer)
    msgContain.appendChild(receiveDiv);
    msgContain.scrollTo({
        top: msgContain.scrollHeight,
        behavior: "smooth",
    });
    const titleTemplateButtons = document.querySelectorAll('.title-template');
    let dotsBtn=document.querySelectorAll(".delete-btn");
    try {
        new_chat.disabled = true;
        titleTemplateButtons.forEach(button => {
            button.disabled = true;
          });
          dotsBtn.forEach((btn) => {
            btn.style.pointerEvents = "none";
            btn.style.opacity = "0.5";  
        });
        const response = await fetch(`/add_message/${chat_id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Message added successfully");
            getChatMessages(chat_id);
            new_chat.disabled = true;
            titleTemplateButtons.forEach(button => {
                button.disabled = false;
              });
              dotsBtn.forEach((btn) => {
                btn.style.pointerEvents = "none";  
                btn.style.opacity = "1";        
            });
        } else {
            console.error("Error adding message:", data.detail);
            alert("cannot send msg Plz reload the website or check server is running")
            introDefault();
            resetui();
            location.reload();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("cannot send msg Plz reload the website or check server is running")
        introDefault();
        resetui();
        location.reload();
    }
}

function setId() {
    window.set_id = window.chat_id;
    console.log(`Active chat set to: ${window.chat_id}`);
}


async function sendTemplateText(a){
    if (window.chat_id) {
        console.log(`Sending message to chat_id: ${window.chat_id}`);
        textField.value = "";
        textField.disabled=true;
        sendMessage(window.chat_id, a);
    } else {
        console.log("No active chat. Creating a new chat...");
        const newChatId = await createNewChat();
        if (newChatId) {
            textField.value = "";
            textField.disabled=true;
            sendMessage(newChatId, a);
        } else {
            console.error("Failed to create a new chat.");
        }
    }
}
function introDefault(){
    introTemplate.style.display="flex";
    msgContain.style.display="none";
    msgContain.innerHTML="";
    chatContentDisplay.style.marginTop="0px";
}
function resetui() {
    console.log("reseted");
    console.log("nav shrinked");
    navBar.style.top = "30px";
    first=0;
}
generalPanel.addEventListener("click",()=>{
    console.log("general");
    openSideBtn.click();
            if (navBar.style.top === "30px") {
                console.log("nav shrinked");
                navBar.style.top = "10px";
            }
    
});

aboutPanel.addEventListener("click",()=>{
    console.log("about");
    resetui();
    closeSideBtn.click();
});
contactUsPanel.addEventListener("click",()=>{
    console.log("contactus");
    resetui();
    closeSideBtn.click();
});
let isListening = false; 

const voiceButton = document.getElementById("voice");
const micIcon = document.getElementById("micIcon");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; 
    recognition.continuous = true;
    voiceButton.addEventListener("click", () => {
        if (!isListening) {
            recognition.start();
            isListening = true;
            micIcon.src = "../static/img/stopmic.png";
        } else {
            recognition.stop();
            isListening = false;
            micIcon.src = "../static/img/mic.png";
        }
    });
    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        textField.value = transcript;
    };
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        recognition.stop();
        isListening = false;
        micIcon.src = "../static/img/mic.png";
    };
} else {
    console.warn("Speech Recognition API is not supported in this browser.");
    voiceButton.addEventListener("click", () => {
        alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
    });
}
textField.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const text = textField.value.trim();
        if (isListening) {
            recognition.stop();
            isListening = false;
            micIcon.src = "../static/img/mic.png";
        }
        if (!text) {
            console.error("Cannot send an empty message.");
            return;
        }

        if (window.chat_id) {
            console.log(`Sending message to chat_id: ${window.chat_id}`);
            textField.value = "";
            textField.disabled=true;
            sendMessage(window.chat_id, text);
        } else {
            console.log("No active chat. Creating a new chat...");
            const newChatId = await createNewChat();
            if (newChatId) {
                textField.value = "";
                textField.disabled=true;
                sendMessage(newChatId, text);
            } else {
                console.error("Failed to create a new chat.");
            }
        }
    }
});

totalSubmit.addEventListener("click", async function (event) {
    event.preventDefault();
    const text = textField.value.trim();
    if (isListening) {
        recognition.stop();
        isListening = false;
        micIcon.src = "../static/img/mic.png";
    }
    if (!text) {
        console.error("Cannot send an empty message.");
        return;
    }

    if (window.chat_id > 0) {
        console.log(`Sending message to chat_id: ${window.chat_id}`);
        textField.value = "";
        sendMessage(window.chat_id, text);
    } else {
        console.log("No active chat. Creating a new chat...");
        const newChatId = await createNewChat();
        if (newChatId) {
            textField.value = "";
            sendMessage(newChatId, text);
        } else {
            console.error("Failed to create a new chat.");
        }
    }
});
