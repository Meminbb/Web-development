let pokemon1 = null
let pokemon2 = null
let battleInterval = null

let battleState = {
    p1Hp: 100,
    p2Hp: 100,
    turn: 1,
    finished: false,

    p1OwnTurns: 0,
    p2OwnTurns: 0,

    p1DefenseBlock: false,
    p2DefenseBlock: false,

    p1MovePool: [],
    p2MovePool: [],

    p1SpecialPoolActive: false,
    p2SpecialPoolActive: false
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

    battleState.p1MovePool = getBaseMovePool(pokemon1)
    battleState.p2MovePool = getBaseMovePool(pokemon2)

    renderBattle()
    addHistoryEntry(`${capitalize(pokemon1.name)} vs ${capitalize(pokemon2.name)}!`)
    document.getElementById("battleStatus").textContent = "Battle in progress..."

    startAutoBattle()
}

function getBaseMovePool(pokemon) {
    return pokemon.moves.slice(0, 10).map(m => ({
        type: "normal",
        name: m.move.name
    }))
}

function activateAttackSpecial(playerKey, pokemon) {
    const normalPool = getBaseMovePool(pokemon)
    const reducedPool = normalPool.slice(0, Math.max(0, normalPool.length - 3))

    const specialMoves = [
        { type: "special-attack", name: "special-attack" },
        { type: "special-attack", name: "special-attack" },
        { type: "special-attack", name: "special-attack" }
    ]

    const newPool = [...reducedPool, ...specialMoves]

    if (playerKey === "p1") {
        battleState.p1MovePool = newPool
        battleState.p1SpecialPoolActive = true
    } else {
        battleState.p2MovePool = newPool
        battleState.p2SpecialPoolActive = true
    }

    addHistoryEntry(`${capitalize(pokemon.name)} charged a SPECIAL ATTACK!`)
}

function activateDefenseSpecial(playerKey, pokemon) {
    const normalPool = getBaseMovePool(pokemon)
    const reducedPool = normalPool.slice(0, Math.max(0, normalPool.length - 2))

    const specialMoves = [
        { type: "special-defense", name: "special-defense" },
        { type: "special-defense", name: "special-defense" }
    ]

    const newPool = [...reducedPool, ...specialMoves]

    if (playerKey === "p1") {
        battleState.p1MovePool = newPool
        battleState.p1SpecialPoolActive = true
    } else {
        battleState.p2MovePool = newPool
        battleState.p2SpecialPoolActive = true
    }

    addHistoryEntry(`${capitalize(pokemon.name)} prepared a SPECIAL DEFENSE!`)
}

function restoreNormalPool(playerKey, pokemon) {
    if (playerKey === "p1") {
        battleState.p1MovePool = getBaseMovePool(pokemon)
        battleState.p1SpecialPoolActive = false
    } else {
        battleState.p2MovePool = getBaseMovePool(pokemon)
        battleState.p2SpecialPoolActive = false
    }
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

    const isP1Turn = battleState.turn % 2 !== 0
    const attacker = isP1Turn ? pokemon1 : pokemon2
    const defender = isP1Turn ? pokemon2 : pokemon1
    const attackerKey = isP1Turn ? "p1" : "p2"
    const defenderKey = isP1Turn ? "p2" : "p1"
    const defenderHpKey = isP1Turn ? "p2Hp" : "p1Hp"

    if (attackerKey === "p1") {
        battleState.p1OwnTurns++
    } else {
        battleState.p2OwnTurns++
    }

    const ownTurns = attackerKey === "p1" ? battleState.p1OwnTurns : battleState.p2OwnTurns
    const hasSpecialPoolActive = attackerKey === "p1"
        ? battleState.p1SpecialPoolActive
        : battleState.p2SpecialPoolActive

    if (!hasSpecialPoolActive) {
        if (ownTurns % 3 === 0) {
            activateAttackSpecial(attackerKey, attacker)
        } else if (ownTurns % 2 === 0) {
            activateDefenseSpecial(attackerKey, attacker)
        }
    }

    const movePool = attackerKey === "p1" ? battleState.p1MovePool : battleState.p2MovePool
    const randomMove = movePool[Math.floor(Math.random() * movePool.length)]

    const didHit = Math.random() < 0.8

    if (!didHit) {
        addHistoryEntry(
            `${capitalize(attacker.name)} used ${formatMoveName(randomMove.name)}, but it missed!`
        )

        if (randomMove.type === "special-attack" || randomMove.type === "special-defense") {
            restoreNormalPool(attackerKey, attacker)
        }

        battleState.turn++
        updateHpBars()
        return
    }

    let damage = Math.floor(Math.random() * 16)

    if (randomMove.type === "special-attack") {
        damage *= 2
    }

    if (randomMove.type === "special-defense") {
        damage = 0

        if (attackerKey === "p1") {
            battleState.p1DefenseBlock = true
        } else {
            battleState.p2DefenseBlock = true
        }

    }

    if (defenderKey === "p1" && battleState.p1DefenseBlock) {
        damage = Math.floor(damage / 2)
        battleState.p1DefenseBlock = false
        addHistoryEntry(`${capitalize(defender.name)} blocked half of the damage!`)
    } else {battleState[defenderHpKey] -= damage}

    if (defenderKey === "p2" && battleState.p2DefenseBlock) {
        damage = Math.floor(damage / 2)
        battleState.p2DefenseBlock = false
        addHistoryEntry(`${capitalize(defender.name)} blocked half of the damage!`)
    } else {battleState[defenderHpKey] -= damage}


    if (battleState[defenderHpKey] < 0) {
        battleState[defenderHpKey] = 0
    }

    if (randomMove.type === "special-attack") {
        addHistoryEntry(
            `${capitalize(attacker.name)} used Special Attack and dealt ${damage} damage to ${capitalize(defender.name)}.`
        )
        restoreNormalPool(attackerKey, attacker)
    } else if (randomMove.type === "special-defense") {
        addHistoryEntry(
            `${capitalize(attacker.name)} is now protected by Special Defense!`
        )
        restoreNormalPool(attackerKey, attacker)
    } else {
        addHistoryEntry(
            `${capitalize(attacker.name)} used ${formatMoveName(randomMove.name)} and dealt ${damage} damage to ${capitalize(defender.name)}.`
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