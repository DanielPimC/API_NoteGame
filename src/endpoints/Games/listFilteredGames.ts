import { Request, Response } from 'express';
import connection from '../../connection';

export default async function listFilteredGames(req: Request, res: Response): Promise<void> {
    try {
        const token = req.headers.authorization;

        if (!token) {
            res.status(401);
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.");
        }

        let query = connection('games');

        if (req.query.name) {
            query = query.where('name', 'like', `%${req.query.name}%`);
        }

        if (req.query.email) {
            query = query.where('email_owner', 'like', `%${req.query.email}%`);
        }

        if (req.query.genre) {
            query = query.where('genre', req.query.genre);
        }

        if (req.query.minRating) {
            query = query.where('rating', '>=', req.query.minRating);
        }

        if (req.query.maxRating) {
            query = query.where('rating', '<=', req.query.maxRating);
        }

        const filteredGames = await query.select('*');

        if (filteredGames.length === 0) {
            res.send("Nenhum jogo encontrado com os filtros fornecidos.").status(204);
            return;
        }

        const gamesInfo = filteredGames.map((game) => {
            return `ID: ${game.id}\nNome do Jogo: ${game.name}\nEmail do Dono: ${game.email_owner}\nGênero: ${game.genre}\nNota: ${game.rating}\n`;
        });

        const gameList = gamesInfo.join('\n');
        res.status(200).send(gameList);
    } catch (error: any) {
        res.send(error.sqlMessage || error.message).status(500);
    }
}
