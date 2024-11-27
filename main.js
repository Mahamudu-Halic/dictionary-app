import {fetchApi} from "./fetch-api.js";

const body = document.querySelector("body")
const toggleInput = document.querySelector("#toggle")
const dropdown = document.querySelector('.custom-dropdown');
const trigger = dropdown.querySelector('.dropdown-trigger');
const options = dropdown.querySelectorAll('.dropdown-option');
const selectedOption = trigger.querySelector("#selected-option")
const searchbar = document.querySelector(".searchbar")
const searchBtn = document.querySelector("#search-btn")
const searchInput = document.querySelector("#search-input")
const resultsWrapper = document.querySelector("#results-wrapper")
const errorMessage = document.querySelector("#error-message")
const notFoundWrapper = document.querySelector(".not-found-wrapper")
const fonts = {
    serif: "serif",
    sans: "sans-serif",
    monospace: "monospace"
}

const displayNotFound = (data) => {
    notFoundWrapper.style.display = "flex"
    notFoundWrapper.innerHTML = `
    <img alt="" class="emoji" src="./assets/images/emoji.png">
        <h3 id="not-found-title">${data.title}</h3>
        <p id="not-found-message">${data.message} ${data.resolution}</p>
        
    `
}

const displayCannotBeEmpty = (errMsg) => {
    searchbar.classList.add("error");
    errorMessage.style.display = "block";
    errorMessage.textContent = errMsg;

    setTimeout(() => {
        searchbar.classList.remove("error");
        errorMessage.style.display = "none";
        errorMessage.textContent = "";
    }, 3000)
}

const renderResults = ({data, status}) => {
    resultsWrapper.innerHTML = "";
    searchInput.value = "";
    searchInput.disabled = false;

    if (status === 404) return displayNotFound(data);
    if (status === "offline") return displayNotFound(data);
    if (status === "error") return displayNotFound(data);

    const {word, phonetic, phonetics} = data[0];
    sessionStorage.setItem("word", word)

    const wordWrapper = document.createElement("section");
    wordWrapper.className = "wrapper word-result-wrapper";

    const wordContainer = document.createElement("div");
    wordContainer.className = "word-container";

    wordContainer.innerHTML = `
        <h2 class="word">${word}</h2>
        <p class="pronunciation">${phonetic || ""}</p>
    `;

    wordWrapper.appendChild(wordContainer);

    if (phonetics.length) {
        const audio = phonetics[phonetics.length - 1].audio;
        const playBtn = document.createElement("button")
        playBtn.className = "play-btn"
        playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75"><g fill="#A445ED" fill-rule="evenodd"><circle cx="37.5" cy="37.5" r="37.5" opacity=".25"/><path d="M29 27v21l21-10.5z"/></g></svg>`

        const audioElement = document.createElement("audio")
        audioElement.src = audio;

        playBtn.addEventListener("click", () => {
            audioElement.play()
        });

        wordWrapper.appendChild(playBtn)
    }

    resultsWrapper.appendChild(wordWrapper)

    data.forEach(item => {
        const wordDefinitions = document.createElement("section")
        wordDefinitions.className = "wrapper definitions"

        item.meanings.forEach(meaning => {
            const definitionItem = document.createElement("div")
            definitionItem.className = "definition-item"

            const definitionList = meaning.definitions.map(definition => `<li>${definition.definition}</li>${definition.example ? `<p class="example">"${definition.example}"</p>` : ""}`).join("")

            const synonyms = meaning.synonyms.length ? `<p>Synonyms</p><div class="synonyms"><span>${meaning.synonyms.join(", ")}</span></div>` : "";
            const antonyms = meaning.antonyms.length ? `<p>Antonyms</p><div class="synonyms"><span>${meaning.antonyms.join(", ")}</span></div>` : "";

            definitionItem.innerHTML = `<div class="title"><h3 class="part-of-speech">${meaning.partOfSpeech || ""}</h3><hr></div><p class="meaning-paragraph">Meaning</p><ul class="content">${definitionList}</ul><div class="synonyms-container">${synonyms}</div><div class="synonyms-container">${antonyms}</div>`;

            wordDefinitions.appendChild(definitionItem)
        })

        const source = document.createElement("section")
        source.className = "source wrapper"
        const sourceUrls = item.sourceUrls.map(url => `<a href="${url}"  target="_blank">${url}<img alt="" src="./assets/images/icon-new-window.svg"></a>`).join("")
        source.innerHTML = `<p>Source</p><div>${sourceUrls}</div>`

        const divider = document.createElement("hr")
        resultsWrapper.appendChild(wordDefinitions)
        resultsWrapper.appendChild(divider)
        resultsWrapper.appendChild(source)
    })
}

const handleSearch = () => {
    const word = searchInput.value.trim().toLowerCase();
    searchbar.classList.remove("error");
    errorMessage.style.display = "none";
    notFoundWrapper.style.display = "none";
    notFoundWrapper.innerHTML = "";
    if (!word) return displayCannotBeEmpty("Whoops, can’t be empty...")

    const hasNumber = /\d/.test(word);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(word);

    if(hasSymbol || hasNumber) return displayCannotBeEmpty("Cannot include special characters or numbers...")

    searchInput.disabled = true
    fetchApi(word).then(result => renderResults(result));
};

// Toggle dropdown open/close
trigger.addEventListener('click', () => {
    dropdown.classList.toggle('open');
});

// Handle option selection
options.forEach(option => {
    option.addEventListener('click', () => {
        selectedOption.textContent = option.textContent;

        options.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        const font = option.className.includes("sans") ? fonts.sans : option.className.includes("serif") ? fonts.serif : fonts.monospace
        body.style.fontFamily = font;
        sessionStorage.setItem("font", font)
        sessionStorage.setItem("fontName", option.textContent)

        dropdown.classList.remove('open');
    });
});

toggleInput.addEventListener("click", () => {
    body.classList.toggle("dark")
    toggleInput.checked ? sessionStorage.setItem("theme", "dark") : sessionStorage.setItem("theme", "")
})

// Add click event listener to the button
searchBtn.addEventListener("click", handleSearch);

// Add keydown event listener to the input
searchInput.addEventListener("keydown", (event) => {
    event.key === "Enter" && handleSearch()
});

window.addEventListener("load", () => {
    const theme = sessionStorage.getItem("theme");
    const font = sessionStorage.getItem("font");
    const fontName = sessionStorage.getItem("fontName");
    const word = sessionStorage.getItem("word");

    theme && body.classList.add(theme);
    toggleInput.checked = !!theme;

    body.style.fontFamily = font || fonts.sans;
    selectedOption.textContent = fontName || "Sans Serif";
    fetchApi(word || "search").then(result => renderResults(result))
})