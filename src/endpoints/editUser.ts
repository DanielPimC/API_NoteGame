import { Request, Response} from 'express'
import connection from '../connection'
import { Authenticator } from '../services/Authenticator'
import { hash } from '../hashManager'

export default async function editUser(req: Request, res: Response):Promise<void> {
    try{
        const authenticator = new Authenticator()
        const {name, email, password} = req.body
        const token = req.headers.authorization

        if(!token){
            res.status(401)
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.")
        }

        if(!name){
            res.status(422)
            throw new Error("Preencha os campos corretamente. Campo necessário: 'name'.")
        }

        const tokenData = authenticator.getTokenData(token)

        if(!name && !email && !password){
            res.status(422)
            throw new Error("Preencha o(s) campo(s) que quer editar.")
        }

        if(name){
        await connection('users')
            .update({ name })
            .where({ id: tokenData.id })
        }

        if(password){
            const cypherPassword = await hash(password);
            await connection('users')
            .update({ password: cypherPassword })
            .where({ id: tokenData.id })
        }

        if(email){

            const [user] = await connection('users')
            .where({email})
        if(user){
            res.status(409)
            throw new Error("Email já cadastrado.")
        }
            await connection('users')
            .update({ email })
            .where({ id: tokenData.id })
        }

        res.send("Usuário atualizado com sucesso.")

    }catch (error: any){
        res.send(error.sqlMessage || error.message)
    }
}