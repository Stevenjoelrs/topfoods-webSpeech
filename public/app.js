const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "es-ES";
recognition.continuous = false;
recognition.interimResults = false;

const btnMic = document.getElementById("btn-mic");
const statusEl = document.getElementById("status");
const alertEl = document.getElementById("alert");
const tbody = document.getElementById("foods-body");

btnMic.addEventListener("click", () => {
    recognition.start();
    statusEl.textContent = "... ... ...";
})

recognition.onresult = async (event) => {
    const raw = event.results[0][0].transcript.trim();
    const transcript = raw.replace(/[.,;:!?]+$/g, "");
    statusEl.textContent = transcript;

    const parts = transcript.split(" ");
    const last = parts.pop();
    const value = parseInt(last, 10);
    const name = parts.join(" ");

    if (!name || isNaN(value)) {
        showAlert("inteligible, repite");
        return;
    }
    await registerFood(name, value);
};

recognition.onerror = (e) => {
    statusEl.textContent = "error: " + e.error;
};

recognition.onend = () => {
    if (statusEl.textContent.includes("... ... ...")) {
        statusEl.textContent = "";
    }
};

async function registerFood(name, value) {
    const res = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value }),
    });

    if (res.status == 409) {
        showAlert(`"${name}" ya esta registrado`, "red");
    } else if (res.ok) {
        showAlert(`"${name}", ${value}`);
        loadFoods();
    }
}

async function loadFoods() {
    const res = await fetch("/api/foods");
    const foods = await res.json();

    tbody.innerHTML = "";
    for (const f of foods) {
        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.textContent = f.name;

        const tdValue = document.createElement("td");
        tdValue.textContent = f.value;

        tr.append(tdName, tdValue);
        tbody.appendChild(tr);
    }
}

function showAlert(msg, color = "black") {
    alertEl.textContent = msg;
    alertEl.style.color = color;
    setTimeout(() => (alertEl.textContent = ""), 3000);
}

loadFoods();