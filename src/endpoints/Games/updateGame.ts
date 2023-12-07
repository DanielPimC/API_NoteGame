import { Request, Response } from 'express';
import connection from '../../connection';
import { Authenticator } from '../../services/Authenticator' 

export default async function updateGame(req: Request, res: Response):Promise<void> {
    try {
        let idJogo = req.params.id;
        let { nomeJogo, genero, nota } = req.body;
        const token = req.headers.authorization;

        if (!token) {
            res.status(401);
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.");
        }
        
        const authenticator = new Authenticator()
        const tokenData = authenticator.getTokenData(token)

        const [user] = await connection ('users')
            .where({ id: tokenData.id })


        if (!nomeJogo && !genero && !nota === undefined ) {
            res.status(400);
            throw new Error("Preencha os campos corretamente. Campos disponíveis: 'nomeJogo', 'genero' e/ou 'nota'.")
        }
        if(nota){
            if(nota < 0 || nota > 10 || isNaN(nota)){
                res.status(400)
                throw new Error("Nota inválida. Digite um valor entre 0 e 10.")     
            }
        }
        if (!idJogo) {
            res.status(400)
            throw new Error("Insira o ID na URL da requisição.")
        }

        const [findGame] = await connection ('games')
            .where({id: idJogo})

        if(!findGame){
            res.status(404)
            throw new Error("Este jogo não foi encontrado.")
        }

        if(findGame.email_owner != user.email){
            res.status(403)
            throw new Error("Você não tem permissão para alterar este jogo.")
        }

        let mensagens = []
        
        if(nomeJogo){
            if(nomeJogo === findGame.name){
                res.status(400)
                throw new Error("O nome inserido é igual ao atual.")
            }
            await connection('games')
                .update({name: nomeJogo})
                .where({id: idJogo})
            mensagens.push(`SUCESSO! Nome do jogo alterado para ${nomeJogo}.`);
        }

        if(genero){
            if(genero === findGame.genre){
                res.status(400)
                throw new Error("O gênero inserido é igual ao atual.")
            }
            await connection('games')
                .update({genre: genero})
                .where({id: idJogo})
            mensagens.push(`SUCESSO! Gênero do jogo alterado para ${genero}.`);
        }

        if(nota){
            if(nota === findGame.rating){
                res.status(400)
                throw new Error("A nota inserida é igual a atual.")
            }
            await connection('games')
                .update({rating: nota})
                .where({id: idJogo})   
            mensagens.push(`SUCESSO! Nota do jogo alterada para ${nota}.`);
        }

        if(mensagens.length === 0){
            res.send("Nenhuma alteração feita.").status(200)
        }else {
            res.send(mensagens.join('\n')).status(200)
        }
    } catch (error: any) {
        res.send(error.sqlMessage || error.message).status(500)
    }
}