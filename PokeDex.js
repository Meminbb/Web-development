let allPokemon = []
let filteredPokemon = []
let page = 0
const perPage = 9
let currentCry = null
let selectedTypes = []
let selectedPokemon = []

async function loadAllPokemon(){
    const listRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1350")
    const listData = await listRes.json()

    const requests = listData.results.map(p =>
        fetch(p.url).then(r => r.json())
    )

    allPokemon = await Promise.all(requests)
    filteredPokemon = allPokemon

    renderPage()
    renderSelectedPokemon()
}

function renderPage(){
    const grid = document.getElementById("pokedexGrid")
    grid.innerHTML = ""

    const start = page * perPage
    const end = start + perPage
    const pokemonPage = filteredPokemon.slice(start, end)

    pokemonPage.forEach(data => {
        const types = data.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join(" ")
        const abilities = data.abilities.map(a => a.ability.name).join(", ")
        const height = (data.height * 10) / 100
        const weight = data.weight / 10
        const img = data.sprites.other["official-artwork"].front_default
        const moves = data.moves.slice(0,3).map(a => a.move.name).join(", ")

        const isSelected = selectedPokemon.some(p => p.id === data.id)

        const card = document.createElement("div")
        card.className = "pokemon-card"

        if (isSelected) {
            card.classList.add("selected-pokemon")
        }

        card.innerHTML = `
            <h3 class="cap">#${data.id} ${data.name}</h3>
            <img src="${img}" alt="${data.name}">
            <p class="cap">Type: ${types}</p>
            <p class="cap">Ability: ${abilities}</p>
            <p>Height: ${height} m</p>
            <p>Weight: ${weight} kg</p>
            <p>Moves: ${moves}</p>
        `

        card.addEventListener("click", () => {
            playCry(data)
            togglePokemonSelection(data)
        })

        grid.appendChild(card)
    })
}

function renderSelectedPokemon(){
    const container = document.getElementById("selectedPokemonList")
    const battleBtn = document.getElementById("battleBtn")

    if (!container) return

    if (selectedPokemon.length === 0) {
        container.innerHTML = `<p>No Pokémon selected</p>`
    } else {
        container.innerHTML = selectedPokemon.map(pokemon => {
            const img = pokemon.sprites.other["official-artwork"].front_default

            return `
                <div class="selected-card">
                    <img src="${img}" alt="${pokemon.name}">
                    <div>
                        <h4 class="cap">#${pokemon.id} ${pokemon.name}</h4>
                        <button class="remove-btn" onclick="removeSelectedPokemon(${pokemon.id})">
                            Remove
                        </button>
                    </div>
                </div>
            `
        }).join("")
    }

    if (battleBtn) {
        battleBtn.disabled = selectedPokemon.length !== 2
    }
}

function togglePokemonSelection(pokemon){
    const index = selectedPokemon.findIndex(p => p.id === pokemon.id)

    if (index !== -1) {
        selectedPokemon.splice(index, 1)
    } else {
        if (selectedPokemon.length >= 2) {
            alert("You can only select 2 Pokémon")
            return
        }

        selectedPokemon.push(pokemon)
    }

    renderSelectedPokemon()
    renderPage()
}

function removeSelectedPokemon(id){
    selectedPokemon = selectedPokemon.filter(p => p.id !== id)
    renderSelectedPokemon()
    renderPage()
}

function clearSelection(){
    selectedPokemon = []
    renderSelectedPokemon()
    renderPage()
}

function startBattle(){
    if (selectedPokemon.length !== 2) {
        alert("Select 2 Pokémon first")
        return
    }

    const pokemon1 = selectedPokemon[0]
    const pokemon2 = selectedPokemon[1]

    window.location.href = `PokeBattle.html?p1=${pokemon1.id}&p2=${pokemon2.id}`
}


function nextPage(){
    if ((page + 1) * perPage < filteredPokemon.length) {
        page++
        renderPage()
    }
}

function previousPage(){
    if (page > 0) {
        page--
        renderPage()
    }
}

function searchPokemon(){
    const query = document
        .getElementById("searchBar")
        .value
        .toLowerCase()
        .trim()

    applyFilters(query)
}

function toggleType(button, type){
    if (selectedTypes.includes(type)) {
        selectedTypes = selectedTypes.filter(t => t !== type)
        button.classList.remove("selected")
    } else {
        selectedTypes.push(type)
        button.classList.add("selected")
    }

    applyFilters(document.getElementById("searchBar").value.toLowerCase().trim())
}

function applyFilters(query = ""){
    filteredPokemon = allPokemon.filter(pokemon => {
        const matchesSearch =
            pokemon.name.includes(query) ||
            pokemon.id.toString().includes(query)

        const matchesType =
            selectedTypes.length === 0 ||
            selectedTypes.every(type =>
                pokemon.types.some(t => t.type.name === type)
            )

        return matchesSearch && matchesType
    })

    page = 0
    renderPage()
}

function playCry(pokemon){
    const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy

    if (!cryUrl) return

    if (currentCry) {
        currentCry.pause()
        currentCry.currentTime = 0
    }

    currentCry = new Audio(cryUrl)
    currentCry.play()
}

loadAllPokemon()