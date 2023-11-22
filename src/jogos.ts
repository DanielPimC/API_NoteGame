interface Jogos {
    id: number,
    nomeJogo: string,
    genero: string,
    nota: number
}

export let listaJogos: Jogos[] = [
    {
        id: 1,
        nomeJogo: "Minecraft",
        genero: "Sandbox",
        nota: 10
    },
    {
        id: 2,
        nomeJogo: "Terraria",
        genero: "Sandbox",
        nota: 9.5
    },
]