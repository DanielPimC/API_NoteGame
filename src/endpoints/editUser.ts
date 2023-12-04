import { Request, Response} from 'express'
import connection from '../connection'
import { Authenticator } from '../services/Authenticator'

export default async function editUser(req: Request, res: Response):Promise<void> {
    try{
        const authenticator = new Authenticator()
        const {name} = req.body
        const token = req.headers.authorization

        console.log(token)

        if(!token){
            res.status(401)
            throw new Error("Preencha o header corretamente. Campo necessário: 'authorization'.")
        }

        if(!name){
            res.status(422)
            throw new Error("Preencha os campos corretamente. Campo necessário: 'name'.")
        }

        const tokenData = authenticator.getTokenData(token)
        await connection('users')
            .update({ name })
            .where({ id: tokenData.id })

        res.send("Usuário atualizado com sucesso.")
    }catch (error: any){
        res.send(error.sqlMessage || error.message)
    }
}