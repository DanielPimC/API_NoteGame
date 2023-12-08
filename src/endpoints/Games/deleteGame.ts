import { Request, Response } from 'express'
import connection from '../../connection'
import { Authenticator } from '../../services/Authenticator'

export default async function deleteGame(req: Request, res: Response):Promise<void> {
    try {
        const token = req.headers.authorization
        let idJogo = req.params.id

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

        if (!idJogo) {
            res.status(400)
            throw new Error("Insira o ID na URL da requisição.")
        }

        const [findGame] = await connection ('games')
            .where({ id: idJogo })

        if(!findGame){
            res.status(404)
            throw new Error("Este jogo não foi encontrado.")
        }

        if(findGame.email_owner !== user.email){
            if(tokenData.role === "USER"){
                res.status(403)
                throw new Error("Você não tem permissão para deletar este jogo.")
            }
        }

        res.send(`SUCESSO! Jogo ${findGame.name} deletado!`).status(200)
        await connection('games')
            .delete()
            .where({id: idJogo})
        return
    } catch (error: any) {
        res.send(error.sqlMessage || error.message).status(500)
    }
}