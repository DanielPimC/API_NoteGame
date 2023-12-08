import { Request, Response } from 'express'
import connection from '../../connection'

export default async function listAllGames(req: Request, res: Response):Promise<void> {
    try {
        const token = req.headers.authorization

        if (!token) {
            res.status(401)
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.")
        }

        const listaJogos = await connection('games').select('*')

        if (listaJogos.length === 0) {
            res.send("Nenhum jogo foi encontrado.").status(204)
        }

        const jogosInfo = listaJogos.map((game) => {
            return `ID: ${game.id}\nEmail do Dono: ${game.email_owner}\nNome do Jogo: ${game.name}\nGênero: ${game.genre}\n Nota: ${game.rating}\n`
        })
        const listaDeJogos = jogosInfo.join('\n')
        res.send(listaDeJogos).status(200)
    } catch (error: any) {
        res.send(error.sqlMessage || error.message).status(500)
    }
}