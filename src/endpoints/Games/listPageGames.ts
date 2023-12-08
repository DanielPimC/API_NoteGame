    import { Request, Response } from 'express'
    import connection from '../../connection'

    export default async function listPageGames(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization

            if (!token) {
                res.status(401)
                throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.")
            }

            const page = parseInt(req.query.page as string) || 1
            const size = parseInt(req.query.size as string) || 3

            if (isNaN(page) || isNaN(size)) {
                res.status(400)
                throw new Error("Os parâmetros de página e tamanho devem ser números válidos.")
            }

            const offSet = (page - 1) * size

            const games = await connection('games')
                .offset(offSet)
                .limit(size)

            if(games.length === 0){
                res.send("Nenhum jogo foi encontrado nesta página.").status(204)
                return
            }

            const gamesInfo = games.map((game) => {
                return `ID: ${game.id}\nNome do Jogo: ${game.name}\nEmail do Dono: ${game.email_owner}\nGênero: ${game.genre}\nNota: ${game.rating}\n`
            })

            const gameList = gamesInfo.join('\n')
            res.status(200).send(gameList)
        } catch (error: any) {
            res.send(error.sqlMessage || error.message).status(500)
        }
    }
