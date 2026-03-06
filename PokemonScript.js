async function getPokemon(){

    const name = document.getElementById("pokemonName").value.toLowerCase()

    try{

        const response = await fetch("https://pokeapi.co/api/v2/pokemon/" + name)

        const data = await response.json()
        
        document.getElementById("name").innerText = data.name
        document.getElementById("sprite").src = data.sprites.front_default
        document.getElementById("height").innerText = "Height: " + data.height
        document.getElementById("ability").innerText = "Ability: " + data.abilities[0].ability.name
        document.querySelector(".pokemon-result").style.display = "block"

    }
    catch(error){
        alert("Pokemon no encontrado")
    }
}