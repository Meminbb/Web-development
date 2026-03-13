let pokemon1 = null
let pokemon2 = null
let battleInterval = null

let battleState = {
    p1Hp: 100,
    p2Hp: 100,
    turn: 1,
    finished: false
}

async function loadBattle() {
    const params = new URLSearchParams(window.location.search)
    const p1 = params.get("p1")
    const p2 = params.get("p2")

    if (!p1 || !p2) {
        document.getElementById("battleHistory").innerHTML = "<p>Missing Pokémon data.</p>"
        document.getElementById("battleStatus").textContent = "Battle could not start"
        return
    }

    const res1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${p1}`)
    const res2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${p2}`)

    pokemon1 = await res1.json()
    pokemon2 = await res2.json()

    renderBattle()
    addHistoryEntry(`${capitalize(pokemon1.name)} vs ${capitalize(pokemon2.name)}!`)
    document.getElementById("battleStatus").textContent = "Battle in progress..."

    startAutoBattle()
}

function renderBattle() {
    document.getElementById("pokemon1Name").textContent = capitalize(pokemon1.name)
    document.getElementById("pokemon2Name").textContent = capitalize(pokemon2.name)

    document.getElementById("pokemon1Image").src =
        pokemon1.sprites.front_default || pokemon1.sprites.other["official-artwork"].front_default

    document.getElementById("pokemon2Image").src =
        pokemon2.sprites.front_default || pokemon2.sprites.other["official-artwork"].front_default

    updateHpBars()
}

function updateHpBars() {
    const hp1 = Math.max(0, battleState.p1Hp)
    const hp2 = Math.max(0, battleState.p2Hp)

    const hpBar1 = document.getElementById("pokemon1HpBar")
    const hpBar2 = document.getElementById("pokemon2HpBar")

    hpBar1.style.width = `${hp1}%`
    hpBar2.style.width = `${hp2}%`

    hpBar1.style.background = getHpColor(hp1)
    hpBar2.style.background = getHpColor(hp2)

    document.getElementById("pokemon1HpText").textContent = `HP: ${hp1} / 100`
    document.getElementById("pokemon2HpText").textContent = `HP: ${hp2} / 100`
}

function getHpColor(hp) {
    if (hp > 50) return "#4caf50"
    if (hp > 20) return "#ff9800"
    return "#e63946"
}

function startAutoBattle() {
    battleInterval = setInterval(runTurn, 1500)
}

function runTurn() {
    if (battleState.finished) {
        clearInterval(battleInterval)
        return
    }

    const attacker = battleState.turn % 2 !== 0 ? pokemon1 : pokemon2
    const defender = battleState.turn % 2 !== 0 ? pokemon2 : pokemon1
    const defenderKey = battleState.turn % 2 !== 0 ? "p2Hp" : "p1Hp"

    const movePool = attacker.moves.slice(0, 10)
    const randomMove = movePool[Math.floor(Math.random() * movePool.length)]

    const hitChance = 0.8 // 80% de pegar, 20% de fallar
    const didHit = Math.random() < hitChance

    if (didHit) {
        const damage = Math.floor(Math.random() * 18) + 8

        battleState[defenderKey] -= damage

        if (battleState[defenderKey] < 0) {
            battleState[defenderKey] = 0
        }

        addHistoryEntry(
            `${capitalize(attacker.name)} used ${formatMoveName(randomMove.move.name)} and dealt ${damage} damage to ${capitalize(defender.name)}.`
        )
    } else {
        addHistoryEntry(
            `${capitalize(attacker.name)} used ${formatMoveName(randomMove.move.name)}, but it missed!`
        )
    }

    updateHpBars()

    if (battleState.p1Hp <= 0 || battleState.p2Hp <= 0) {
        finishBattle()
        return
    }

    battleState.turn++
}

function finishBattle() {
    battleState.finished = true
    clearInterval(battleInterval)

    const winner = battleState.p1Hp > 0 ? pokemon1 : pokemon2
    const loser = battleState.p1Hp <= 0 ? pokemon1 : pokemon2

    addHistoryEntry(`${capitalize(loser.name)} fainted!`)
    addHistoryEntry(`${capitalize(winner.name)} wins the battle!`)
    document.getElementById("battleStatus").textContent = `${capitalize(winner.name)} wins!`
}

function addHistoryEntry(text) {
    const history = document.getElementById("battleHistory")
    const entry = document.createElement("div")
    entry.className = "battle-log-entry"
    entry.textContent = text

    history.prepend(entry)
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatMoveName(move) {
    return move
        .split("-")
        .map(word => capitalize(word))
        .join(" ")
}

loadBattle()
