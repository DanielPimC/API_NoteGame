import express from 'express'
import cors from 'cors'
import createUser from './endpoints/Users/createUser'
import loginUser from './endpoints/Users/loginUser'
import editUser from './endpoints/Users/editUser'
import changeRole from './endpoints/Users/changeRole'
import deleteUser from './endpoints/Users/deleteUser'
import listAllGames from './endpoints/Games/listAllGames'
import listFilteredGames from './endpoints/Games/listFilteredGames'
import listPageGames from './endpoints/Games/listPageGames'
import registerGame from './endpoints/Games/registerGame'
import updateGame from './endpoints/Games/updateGame'
import deleteGame from './endpoints/Games/deleteGame'

        
const app = express()
app.use(express.json())
app.use(cors())

// GET pegar todos os jogos
app.get('/listarJogos', listAllGames)
// GET filtrar jogos
app.get('/filtrarJogos', listFilteredGames)
// GET paginar jogos
app.get('/paginarJogos', listPageGames)
// POST criar novo jogo
app.post('/registrarJogo', registerGame)
//PUT atualizar jogo pelo ID
app.put('/atualizarJogo/:id', updateGame)
// DELETE deletar jogo pelo ID
app.delete('/deletarJogo/:id', deleteGame)

// POST Registro de usuário
app.post("/user/signup", createUser)
// POST Login de usuário
app.post("/user/login", loginUser)
// POST Editar usuário
app.post("/user/edit", editUser)
// POST Editar role de usuário
app.post("/user/changeRole", changeRole)
// DELETE Deletar usuário
app.delete("/user/delete", deleteUser)

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003.")
    });