// --- 1. CONFIGURATION ---
// Assurez-vous que c'est bien votre adresse publique (Tunnel)
const API_BASE = 'https://wv7pc13r-5000.euw.devtunnels.ms'; 
const storedUser = localStorage.getItem('user');
const token = localStorage.getItem('token');

if (!storedUser || !token) {
    window.location.href = "login.html";
}

const currentUser = JSON.parse(storedUser);
const myId = currentUser.id;
const myRole = currentUser.role;

const urlParams = new URLSearchParams(window.location.search);
let receiverId = urlParams.get('userId'); 

// --- 2. FONCTIONS ---

async function loadContacts() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/contacts/${myRole}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const contacts = await res.json();
        const list = document.getElementById('users-list');
        
        if (!list) return;
        list.innerHTML = ''; 

        contacts.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.setAttribute('data-id', user._id); 
            div.style.cssText = "padding: 15px; border-bottom: 1px solid #eee; cursor: pointer;";
            div.innerHTML = `
                <div style="font-weight: bold;">${user.nom} ${user.prenom}</div>
                <div style="font-size: 0.8em; color: gray;">${user.email}</div>
            `;
            div.addEventListener('click', () => {
                receiverId = user._id;
                document.querySelectorAll('.user-item').forEach(el => el.style.backgroundColor = "transparent");
                div.style.backgroundColor = "#eef";
                const header = document.querySelector('.chat-header h4') || document.getElementById('chat-header');
                if(header) header.innerText = `Chat avec ${user.nom} ${user.prenom}`;
                loadMessages();
            });
            list.appendChild(div);
        });
    } catch (err) { console.error("Erreur contacts:", err); }
}

async function loadMessages() {
    if (!receiverId) return;
    try {
        const res = await fetch(`${API_BASE}/api/messages/${myId}/${receiverId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;

        const messages = await res.json();
        const msgList = document.getElementById('messages-list');
        msgList.innerHTML = ''; 

        messages.forEach(msg => {
            const div = document.createElement('div');
            div.style.cssText = "padding: 8px 12px; margin: 5px; border-radius: 10px; max-width: 70%; width: fit-content; clear: both; position: relative;";
            
            if (msg.sender === myId) {
                div.style.marginLeft = "auto";
                div.style.marginRight = "0";
                div.style.backgroundColor = "#007bff";
                div.style.color = "white";
                div.style.borderBottomRightRadius = "0";
            } else {
                div.style.marginRight = "auto";
                div.style.marginLeft = "0";
                div.style.backgroundColor = "#e9ecef";
                div.style.color = "black";
                div.style.borderBottomLeftRadius = "0";
            }
            div.innerText = msg.content;
            msgList.appendChild(div);
        });
        msgList.scrollTop = msgList.scrollHeight;
    } catch (err) { console.error(err); }
}

window.onload = async () => {
    await loadContacts();
    if (receiverId) {
        loadMessages();
        setTimeout(() => {
            const activeContact = document.querySelector(`[data-id="${receiverId}"]`);
            if (activeContact) activeContact.click();
        }, 500);
    }
};

const sendBtn = document.getElementById('send-btn');
if (sendBtn) {
    sendBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const input = document.getElementById('message-input');
        const text = input.value;
        if (!text || !receiverId) return;

        try {
            await fetch(`${API_BASE}/api/messages`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ receiverId, content: text })
            });
            input.value = ''; 
            loadMessages(); 
        } catch (err) { console.error("Erreur envoi:", err); }
    });
}

setInterval(() => { if(receiverId) loadMessages(); }, 3000);