let allPokemon = []
let filteredPokemon = []
let page = 0
const perPage = 9
let currentCry = null

async function loadAllPokemon(){

    const listRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1350")
    const listData = await listRes.json()

    const requests = listData.results.map(p =>
        fetch(p.url).then(r => r.json())
    )

    allPokemon = await Promise.all(requests)

    filteredPokemon = allPokemon

    renderPage()
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

        const card = document.createElement("div")
        card.className = "pokemon-card"

        card.innerHTML = `
            <h3 class="cap">#${data.id} ${data.name}</h3>
            <img src="${img}">
            <p class="cap">Type: ${types}</p>
            <p class="cap">Ability: ${abilities}</p>
            <p>Height: ${height} m</p>
            <p>Weight: ${weight} kg</p>
        `
        card.addEventListener("click", () => {
            playCry(data)
        })
        grid.appendChild(card)
    })
}

function nextPage(){
    if((page + 1) * perPage < filteredPokemon.length){
        page++
        renderPage()
    }
}

function previousPage(){
    if(page > 0){
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

let selectedTypes = []

function toggleType(button, type){

    if(selectedTypes.includes(type)){
        selectedTypes = selectedTypes.filter(t => t !== type)
        button.classList.remove("selected")
    }else{
        selectedTypes.push(type)
        button.classList.add("selected")
    }

    applyFilters()
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

    if(!cryUrl) return

    if(currentCry){
        currentCry.pause()
        currentCry.currentTime = 0
    }

    currentCry = new Audio(cryUrl)
    currentCry.play()
}


loadAllPokemon()