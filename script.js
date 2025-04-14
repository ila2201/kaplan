const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNote");
const noteList = document.getElementById("noteList");
const delnote = document.getElementById("clearAll");
const categorySelect = document.getElementById("categorySelect");
const tablet = document.getElementById("window");
const go = document.getElementById("Go");
const divError = document.getElementById("divError");
const perv = document.getElementsByClassName("container");
const vtor = document.getElementsByClassName("container1");

document.addEventListener("DOMContentLoaded", start);
addNoteBtn.addEventListener("click", addNote);
delnote.addEventListener("click", delAll);
go.addEventListener("click", calc);

let weightedNotes = [];

function start(){
    renderNotes()
    let resultHTML = `<h3>Здесь будет распределение</h3>`;
    tablet.innerHTML = resultHTML;
}
noteInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        addNote();
    }
});

const categoryWeights = {
    "Очень важно": 9,
    "Важно": 7,
    "Нужно": 5,
    "Маловажно": 3,
    "Не важно": 1
};

function showError(massege) {
    divError.innerHTML = massege
    setTimeout(() => divError.style.display = "inline", 10);
    setTimeout(() => divError.style.right = "0", 100);
    setTimeout(() => divError.style.right = "-300px", 1500);
    setTimeout(() => divError.style.display = "none", 2000);
    
}

function addNote() {
    const text = noteInput.value.trim();
    const category = categorySelect.value;

    if (!(category in categoryWeights)) {
        return showError("Выберите категорию");
    }

    if (text === "") return showError("Напишите категорию");

    const note = {
        id: Date.now(),
        text: text,
        category: category
    };

    saveNoteToLocalStorage(note);
    renderNotes(); 
    noteInput.value = ""; 
}

function saveNoteToLocalStorage(note) {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.push(note);
    localStorage.setItem("notes", JSON.stringify(savedNotes));
}

function delAll() {
    localStorage.removeItem("notes");
    renderNotes();
}

function renderNotes() {
    noteList.innerHTML = "";

    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    savedNotes.sort((a, b) => {
        return categoryWeights[b.category] - categoryWeights[a.category];
    });

    savedNotes.forEach(note => {
        const noteElement = document.createElement("li");
        noteElement.innerHTML = `
            <span class="note-text"><strong>${note.text}</strong></span>
            <span class="note-category">${note.category}</span>
            <button class="note-but" onclick="deleteNote(${note.id})">🗑️</button>
        `;
        noteElement.setAttribute("data-id", note.id);
        noteList.appendChild(noteElement);
    });
}

function deleteNote(noteId) {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    let notes = savedNotes.filter(note => note.id !== noteId);
    localStorage.setItem("notes", JSON.stringify(notes));

    let noteElement = document.querySelector(`[data-id="${noteId}"]`);

    if (noteElement) {
        noteElement.classList.add("fade-out");
        setTimeout(() => noteElement.remove(), 900);
    }
}

function calc() {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    if (savedNotes.length === 0) {
        showError("Нет сохраненных данных");
        return;
    }

    let n = savedNotes.length;
    let matrix = Array.from({ length: n }, () => Array(n).fill(1));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                matrix[i][j] = categoryWeights[savedNotes[i].category] / categoryWeights[savedNotes[j].category];
            }
        }
    }

    let geomMeans = matrix.map(row => {
        return Math.pow(row.reduce((acc, val) => acc * val, 1), 1 / n);
    });

    let sumGeomMeans = geomMeans.reduce((acc, val) => acc + val, 0);
    let weights = geomMeans.map(val => val / sumGeomMeans);

    weightedNotes = savedNotes.map((note, index) => ({
        ...note,
        weight: weights[index]
    }));

    weightedNotes.sort((a, b) => categoryWeights[b.category] - categoryWeights[a.category]);


    let resultHTML = '<h3>Распределение бюджета:</h3>';
    weightedNotes.forEach(note => {
        resultHTML += `
            <div style="background: #ddd; padding: 10px; margin: 5px 0; border-radius: 5px;">
                ${note.text} : <strong>${(note.weight * 100).toFixed(2)}%</strong>
            </div>
        `;
    });
    resultHTML += `
        <input type="text" id="rubInput" placeholder="Введите сумму">
        <button class="Go-fin">Распределить</button>
        <span class="VestiSum"><h3>Введите ваш ежемесячный доход, и система автоматически распределит его по выбранным категориям</h3></span>
    `;
    tablet.innerHTML = resultHTML;
    perv.innerHTML = " ";

    setTimeout(() => {
        document.querySelector(".Go-fin").addEventListener("click", distributeBudget);
    }, 100);
}


function distributeBudget() {
    let inputElement = document.getElementById("rubInput");
    let budget = parseFloat(inputElement.value);

    if (isNaN(budget) || budget <= 0) {
        showError("Введите корректную сумму");
        return;
    }

    if (!weightedNotes || weightedNotes.length === 0) {
        showError("Сначала рассчитайте распределение");
        return;
    }

    let resultHTML = `<h3>Распределение бюджета для ${budget}₽ :</h3>`;
    weightedNotes.forEach(note => {
        let categorySum = (budget * note.weight).toFixed(2);
        resultHTML += `
            <div style="background: #ddd; padding: 10px; margin: 5px 0; border-radius: 5px;">
                ${note.text} (${(note.weight * 100).toFixed(2)}%): <strong>${categorySum}₽</strong>
            </div>
        `;
    });
    resultHTML +=   `
    <input type="text" id="rubInput" placeholder="Введите сумму">
    <button class="Go-fin">Распределить</button>
    <span class="VestiSum"><h3>Введите ваш ежемесячный доход, и система автоматически распределит его по выбранным категориям</h3></span>
`;
    tablet.innerHTML = resultHTML;
    setTimeout(() => {
        document.querySelector(".Go-fin").addEventListener("click", distributeBudget);
    }, 100);
}

