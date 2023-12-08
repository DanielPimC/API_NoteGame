import { Request, Response } from 'express'
import connection from '../../connection'
import { game } from '../../types'
import { generateId } from '../../services/IdGenerator'
import { Authenticator } from '../../services/Authenticator'

export default async function registerGame(req: Request, res: Response):Promise<void> {
    try {
        let { nomeJogo, genero, nota } = req.body
        const token = req.headers.authorization

        if (!token) {
            res.status(401)
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.")
        }

        const authenticator = new Authenticator()
        const tokenData = authenticator.getTokenData(token)

        const [user] = await connection ('users')
            .where({ id: tokenData.id })

        if (!user) {
            res.status(404)
            throw new Error("Usuário inexistente.")
        }

        if (nomeJogo === undefined || nomeJogo.trim() === '') {
            res.status(400)
            throw new Error("O campo 'nomeJogo' está vazio ou inexistente.")
        }

        if (genero === undefined || genero.trim() === '') {
            res.status(400)
            throw new Error("O campo 'genero' está vazio ou inexistente.")
        }

        if (nota === undefined || isNaN(nota) || nota < 0 || nota > 10) {
        res.status(400)
        throw new Error("O campo 'nota' está vazio, inexistente ou é um número inválido." )
        }

        let newGame: game = {
            id: generateId(),
            email_owner: user.email,
            name: nomeJogo,
            genre: genero,
            rating: nota
        }

        await connection('games')
            .insert(newGame)
        res.send(`SUCESSO! Jogo ${nomeJogo} criado.`).status(201)
    } catch (error: any) {
        res.send(error.sqlMessage || error.message).status(500)
    }
}