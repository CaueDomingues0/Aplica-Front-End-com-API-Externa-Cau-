async function fetchPokemon() {
    const randomNumber = Math.floor(Math.random() * 800) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomNumber}`);
    const data = await response.json();

    return {
        name: data.name,
        img: data.sprites.other.dream_world.front_default || data.sprites.front_default 
    };
}

async function getPokemons() {
    const pokemons = new Set();

    while (pokemons.size < 9) {
        const pokemon = await fetchPokemon();
        if (pokemon.img) {
            pokemons.add(JSON.stringify(pokemon));
        }
    }

    let pokemonList = [...pokemons].map(p => JSON.parse(p));
    let cardPairs = [...pokemonList, ...pokemonList]; 

    return cardPairs.sort(() => Math.random() - 0.5); 
}

async function buildCards() {
    const pokemons = await getPokemons();
    const area = document.getElementById("render-area");

    pokemons.forEach(pokemon => {
        const div = document.createElement("div");
        div.classList.add("card");
        div.dataset.name = pokemon.name;

        const pokeBallDiv = document.createElement("div");
        pokeBallDiv.classList.add("poke-ball");
        
        const img = document.createElement("img");
        img.src = pokemon.img;
        img.classList.add("hidden"); 

        div.appendChild(pokeBallDiv); 
        div.appendChild(img); 
        area.appendChild(div);

        div.addEventListener("click", () => flipCard(div));
    });
}

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCards = 0; 
let moves = 0;
let level = 1; 

function updateScore() {
    document.getElementById("moves").textContent = moves;
    document.getElementById("pairs").textContent = matchedCards;
    document.getElementById("level").textContent = level;
}

function flipCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains("flipped")) return;

    const pokeBall = card.querySelector(".poke-ball");
    const img = card.querySelector("img");

    pokeBall.style.display = "none";
    img.classList.remove("hidden");
    card.classList.add("flipped"); 

    moves++; 
    updateScore(); 

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        checkMatch();
    }
}

function checkMatch() {
    if (firstCard.dataset.name === secondCard.dataset.name) {
        matchedCards++;
        resetTurn();

        if (matchedCards === 9) { 
            setTimeout(() => {
                alert("Você venceu! Parabéns!");
                level++; 
                resetGame(); 
            }, 500);
        }
    } else {
        lockBoard = true;
        setTimeout(() => {
            firstCard.querySelector(".poke-ball").style.display = "block"; 
            secondCard.querySelector(".poke-ball").style.display = "block"; 
            firstCard.querySelector("img").classList.add("hidden");
            secondCard.querySelector("img").classList.add("hidden");
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            resetTurn();
        }, 1000);
    }
}
function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function resetGame() {
    matchedCards = 0;
    moves = 0;
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.classList.remove("flipped");
        card.querySelector(".poke-ball").style.display = "block"; 
        card.querySelector("img").classList.add("hidden");
    });
    buildCards(); 
    updateScore(); 
}
buildCards();