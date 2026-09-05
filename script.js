// ========================================
// CONFIGURAÇÃO
// ========================================

const API_URL = "https://gamezone-ai.onrender.com/chat";


// ========================================
// HISTÓRICO DA CONVERSA
// ========================================

let messages = [];

let isLoading = false;

let currentCategory = "games";


// ========================================
// ELEMENTOS HTML
// ========================================

const messagesContainer =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const newChatButton =
    document.getElementById("newChatButton");

const loading =
    document.getElementById("loading");

const messageCounter =
    document.getElementById("messageCounter");

const characterCounter =
    document.getElementById("characterCounter");

const themeButton =
    document.getElementById("themeButton");

    const categoryButtons =
    document.querySelectorAll(".feature");

    // ========================================
// CATEGORIAS
// ========================================

const categoryPrompts = {

    games: `
Você está no modo GAMES da GameZone AI.

Foque exclusivamente em jogos.
Você pode falar sobre:
- Jogos
- Gêneros
- Gameplay
- Dicas
- Estratégias
- História dos jogos
- Lançamentos
- Jogos multiplayer
- Esports relacionados aos jogos

Quando o usuário estiver nesse modo, priorize assuntos
relacionados diretamente aos videogames e jogos.
`,

    consoles: `
Você está no modo CONSOLES da GameZone AI.

Foque exclusivamente em consoles e plataformas de games.

Você pode falar sobre:
- PlayStation
- Xbox
- Nintendo
- PC Gaming
- Comparações entre consoles
- Hardware de consoles
- Desempenho
- Controle e recursos
- Plataformas
- Jogos disponíveis em cada plataforma

Priorize dúvidas relacionadas a consoles e plataformas.
`,

    acessorios: `
Você está no modo ACESSÓRIOS da GameZone AI.

Foque exclusivamente em acessórios e periféricos para games.

Você pode falar sobre:
- Controles
- Headsets
- Teclados gamer
- Mouses gamer
- Mousepads
- Monitores
- Microfones
- Volantes
- Câmeras
- Periféricos para PC e consoles

Priorize dúvidas relacionadas a acessórios gamer.
`
};

// ========================================
// ENVIAR MENSAGEM
// ========================================

async function sendMessage(text = null) {

    if (isLoading) {
        return;
    }

    const message =
        text !== null
            ? text.trim()
            : messageInput.value.trim();

    if (!message) {
        return;
    }

    // Limita o tamanho da mensagem
    if (message.length > 2000) {
        showError(
            "A mensagem não pode ultrapassar 2000 caracteres."
        );

        return;
    }

    // Remove a tela inicial
    const welcome =
        document.querySelector(".welcome-message");

    if (welcome) {
        welcome.remove();
    }

    // Limpa input
    messageInput.value = "";

    updateCharacterCounter();

    // Mostra mensagem do usuário
    addMessageToScreen(
        "user",
        message
    );

    // Adiciona ao histórico
    messages.push({
        role: "user",
        content: message
    });

    updateMessageCounter();

    // Ativa loading
    setLoading(true);

    try {

        console.log("📤 Enviando mensagem para:", API_URL);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mensagem: message,
                messages: messages,
                categoria: currentCategory
            })
        });
        
     

        console.log(
            "📡 Status da resposta:",
            response.status
        );

        // Tenta ler JSON
        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Erro ao conversar com o servidor."
            );
        }

        if (!data.response) {

            throw new Error(
                "O servidor não retornou uma resposta válida."
            );
        }

        // Adiciona resposta ao histórico
        messages.push({
            role: "assistant",
            content: data.response
        });

        // Mostra resposta
        addMessageToScreen(
            "assistant",
            data.response
        );

        updateMessageCounter();

    } catch (error) {

        console.error(
            "❌ Erro:",
            error
        );

        // Remove mensagem do usuário
        // do histórico se a API falhar
        messages = messages.filter(
            (msg, index) =>
                !(
                    index === messages.length - 1 &&
                    msg.role === "user" &&
                    msg.content === message
                )
        );

        showError(
            getFriendlyError(error)
        );

    } finally {

        setLoading(false);
    }
}


// ========================================
// ADICIONAR MENSAGEM NA TELA
// ========================================

function addMessageToScreen(
    role,
    content
) {

    const messageElement =
        document.createElement("div");

    messageElement.className =
        `message ${role}`;

    const avatar =
        role === "user"
            ? "👤"
            : "🤖";

    const time =
        new Date().toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    const messageContent =
        document.createElement("div");

    messageContent.className =
        "message-content";

    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";

    // textContent evita interpretar HTML
    bubble.textContent = content;

    const timeElement =
        document.createElement("div");

    timeElement.className =
        "message-time";

    timeElement.textContent =
        time;

    messageContent.appendChild(
        bubble
    );

    messageContent.appendChild(
        timeElement
    );


    // Botão copiar somente na resposta da IA
    if (role === "assistant") {

        const copyButton =
            document.createElement("button");

        copyButton.className =
            "copy-button";

        copyButton.textContent =
            "📋 Copiar resposta";

        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        content
                    );

                    copyButton.textContent =
                        "✅ Copiado!";

                    setTimeout(() => {

                        copyButton.textContent =
                            "📋 Copiar resposta";

                    }, 1500);

                } catch {

                    copyButton.textContent =
                        "❌ Não foi possível copiar.";
                }
            }
        );

        messageContent.appendChild(
            copyButton
        );
    }


    const avatarElement =
        document.createElement("div");

    avatarElement.className =
        "message-avatar";

    avatarElement.textContent =
        avatar;


    messageElement.appendChild(
        avatarElement
    );

    messageElement.appendChild(
        messageContent
    );

    messagesContainer.appendChild(
        messageElement
    );

    scrollToBottom();
}


// ========================================
// ERRO
// ========================================

function showError(message) {

    addMessageToScreen(
        "assistant",
        `⚠️ ${message}`
    );
}


// ========================================
// ERRO AMIGÁVEL
// ========================================

function getFriendlyError(error) {

    if (
        error.message.includes(
            "Failed to fetch"
        )
    ) {

return (
    "Não consegui conectar ao servidor. " +
    "Verifique se a API da GameZone AI está online."
);
    }

    return (
        error.message ||
        "Ocorreu um erro inesperado."
    );
}


// ========================================
// LOADING
// ========================================

function setLoading(value) {

    isLoading = value;

    if (value) {

        loading.classList.remove(
            "hidden"
        );

        sendButton.disabled = true;

    } else {

        loading.classList.add(
            "hidden"
        );

        sendButton.disabled = false;
    }

    scrollToBottom();
}


// ========================================
// NOVA CONVERSA
// ========================================

function newConversation() {

    messages = [];

    messagesContainer.innerHTML = "";

    const welcome =
        document.createElement("div");

    welcome.className =
        "welcome-message";

    welcome.innerHTML = `
        <div class="welcome-icon">
            🎮
        </div>

        <h2>
            Nova conversa!
        </h2>

        <p>
            Olá! Sou a GameZone AI.
            Como posso ajudar você?
        </p>

        <div class="suggestions">

            <button
                class="suggestion"
                data-message="Quais são os consoles mais populares atualmente?"
            >
                🕹️ Consoles populares
            </button>

            <button
                class="suggestion"
                data-message="Me recomende alguns jogos de aventura."
            >
                🗺️ Jogos de aventura
            </button>

            <button
                class="suggestion"
                data-message="Qual a diferença entre FPS e RPG?"
            >
                💡 Dúvida sobre games
            </button>

        </div>
    `;

    messagesContainer.appendChild(
        welcome
    );

    addSuggestionEvents();

    messageInput.value = "";

    updateCharacterCounter();

    updateMessageCounter();

    messageInput.focus();
}


// ========================================
// CONTADOR
// ========================================

function updateMessageCounter() {

    const count =
        messages.length;

    messageCounter.textContent =
        `${count} ${
            count === 1
                ? "mensagem"
                : "mensagens"
        }`;
}


// ========================================
// CONTADOR DE CARACTERES
// ========================================

function updateCharacterCounter() {

    const length =
        messageInput.value.length;

    characterCounter.textContent =
        `${length} / 2000`;
}


// ========================================
// SCROLL AUTOMÁTICO
// ========================================

function scrollToBottom() {

    setTimeout(() => {

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;

    }, 50);
}


// ========================================
// TEMA
// ========================================

function toggleTheme() {

    document.body.classList.toggle(
        "light"
    );

    const isLight =
        document.body.classList.contains(
            "light"
        );

    themeButton.textContent =
        isLight
            ? "☀️"
            : "🌙";

    localStorage.setItem(
        "gamezone-theme",
        isLight
            ? "light"
            : "dark"
    );
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "gamezone-theme"
        );

    if (theme === "light") {

        document.body.classList.add(
            "light"
        );

        themeButton.textContent =
            "☀️";
    }
}


// ========================================
// SUGESTÕES
// ========================================

function addSuggestionEvents() {

    const suggestions =
        document.querySelectorAll(
            ".suggestion"
        );

    suggestions.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const text =
                        button.dataset.message;

                    sendMessage(text);
                }
            );
        }
    );
}

// ========================================
// SELEÇÃO DE CATEGORIA
// ========================================

categoryButtons.forEach((button) => {

    button.addEventListener("click", () => {

        currentCategory =
            button.dataset.category;

        console.log(
            "🎮 Categoria selecionada:",
            currentCategory
        );

        categoryButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        newConversation();

        messageInput.focus();
    });

});

// ========================================
// EVENTOS
// ========================================

sendButton.addEventListener(
    "click",
    () => {
        sendMessage();
    }
);


newChatButton.addEventListener(
    "click",
    newConversation
);


themeButton.addEventListener(
    "click",
    toggleTheme
);


messageInput.addEventListener(
    "input",
    () => {

        updateCharacterCounter();

        // Ajusta altura automaticamente
        messageInput.style.height =
            "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                150
            ) + "px";
    }
);


messageInput.addEventListener(
    "keydown",
    (event) => {

        // Enter envia
        // Shift + Enter cria nova linha

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


// ========================================
// INICIALIZAÇÃO
// ========================================

loadTheme();

addSuggestionEvents();

updateMessageCounter();

updateCharacterCounter();

console.log(
    "🎮 GameZone AI Front-end iniciado!"
);
