import express, { Request, Response } from 'express';
import cors from 'cors';
import { listaJogos } from './jogos'
import createUser from './endpoints/createUser';
import loginUser from './endpoints/loginUser';
import editUser from './endpoints/editUser'
import connection from './connection';
        
const app = express();

app.use(express.json());
app.use(cors());

// GET pegar todos os jogos
app.get('/listarJogos', (req: Request, res: Response) => {
    if(listaJogos.length === 0){
        return(res.send(`Lista de jogos vazia!`).status(204))
    }
    const jogosInfo = listaJogos.map((jogo) => {
        return `ID: ${jogo.id}\nNome do Jogo: ${jogo.nomeJogo}\nGênero: ${jogo.genero}\n Nota: ${jogo.nota}\n`
    });
    const listaDeJogos = jogosInfo.join('\n');
    res.send(listaDeJogos).send(200);
});


function buscarJogo(id: number) {
    for (let i = 0; i < listaJogos.length; i++) {
        if (listaJogos[i].id === id) {
            return `ID: ${listaJogos[i].id}\nNome do Jogo: ${listaJogos[i].nomeJogo}\nGênero: ${listaJogos[i].genero}\nNota: ${listaJogos[i].nota}\n`;
        }
    }
    return "";
}

// GET buscar jogo pelo ID 
app.get('/buscarJogo/:id', (req: Request, res: Response) => {
    let idJogo = Number(req.params.id);

    if (!idJogo || isNaN(idJogo)) {
        return res.send("ID inválido.").status(400);
    }

    const resultado = buscarJogo(idJogo);
    if (resultado) {
        return res.send(resultado).status(200);
    } else {
        return res.send("ID não encontrado.").status(404)
    }
});

// POST criar novo jogo
app.post('/registrarJogo', (req: Request, res: Response) => {
    let { nomeJogo, genero, nota } = req.body;

    if (nomeJogo === undefined || nomeJogo.trim() === '') {
        return res.send("O campo 'nomeJogo' está vazio ou inexistente.").status(400)
    }

    if (genero === undefined || genero.trim() === '') {
        return res.send("O campo 'genero' está vazio ou inexistente.").status(400)
    }

    if (nota === undefined || isNaN(nota) || nota < 0 || nota > 10) {
        return (res.send("O campo 'nota' está vazio, inexistente ou é um número inválido." ).status(400))
    }

    let maxId = 0;
    for (const jogo of listaJogos) {
        if (jogo.id > maxId) {
            maxId = jogo.id;
        }
    }
    let novoJogo = {
        id: maxId + 1,
        nomeJogo: nomeJogo,
        genero: genero,
        nota: nota
    };

    listaJogos.push(novoJogo);
    res.send(`SUCESSO! Jogo ${nomeJogo} criado. \n ID do jogo: ${maxId + 1}.`).status(201);
});

//PUT atualizar jogo pelo ID
app.put('/atualizarJogo/:id', (req: Request, res: Response) => {
    let idJogo = Number(req.params.id);
    let { nomeJogo, genero, nota } = req.body;

    if (!nomeJogo && !genero && nota === undefined ) {
        return res.send("O corpo da requisição está vazio. Nenhuma alteração foi feita.").status(400);
    }
    if(nota < 0 || nota > 10 || isNaN(nota)){
        return res.send("Nota inválida. Digite um valor entre 0 e 10.").status(400)
    }

    if (!idJogo || isNaN(idJogo)) {
        return res.send("ID inválido.").status(400);
    }

    let jogoEncontrado = false;
    let mensagens = [];

    for (let i = 0; i < listaJogos.length; i++) {
        if (listaJogos[i].id === idJogo) {
            jogoEncontrado = true;

            if (nomeJogo && listaJogos[i].nomeJogo !== nomeJogo) {
                listaJogos[i].nomeJogo = nomeJogo;
                mensagens.push(`SUCESSO! Nome do jogo alterado para ${listaJogos[i].nomeJogo}.`);
            }

            if (genero && listaJogos[i].genero !== genero) {
                listaJogos[i].genero = genero;
                mensagens.push(`SUCESSO! Gênero do jogo alterado para ${listaJogos[i].genero}.`);
            }
            
            if (nota !== undefined && listaJogos[i].nota !== nota) {
                listaJogos[i].nota = nota;
                mensagens.push(`SUCESSO! Nota do jogo alterada para ${listaJogos[i].nota}.`);
            }
            break;
        }
    }

    if (!jogoEncontrado) {
        res.send("Jogo não encontrado.").status(404);
    }else if(mensagens.length === 0){
        res.send("Nenhuma alteração feita.").status(200)
    }else {
        res.send(mensagens.join('\n')).status(200)
    }
});


// DELETE deletar jogo pelo ID
app.delete('/deletarJogo/:id', (req: Request, res: Response) => {
    let idJogo = Number(req.params.id);
    if (!idJogo || isNaN(idJogo)) {
        return res.send("ID inválido.").status(400);
    }

    const index = listaJogos.findIndex((jogo) => jogo.id === idJogo);
    if (index !== -1) {
        let jogoDeletado = listaJogos[index].nomeJogo
        listaJogos.splice(index, 1);
        res.send(`SUCESSO! Jogo ${jogoDeletado} deletado.!`).status(200);
        jogoDeletado = ''
    } else {
        res.send("Jogo não encontrado.").status(404);
    }
});

app.get("/getBD", async(req: Request, res: Response) => {
    try{
        const nomes = await connection.raw(`SELECT * FROM USERS`)
        res.send(nomes[0])
    }catch(e: any){
        res.send(e.sqlMessage || e.message)
    }
})

app.post("/user/signup", createUser)
app.post("/user/login", loginUser)
app.post("/user/edit", editUser)

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003.");
    });