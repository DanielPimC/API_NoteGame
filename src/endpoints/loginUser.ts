import { Request, Response } from 'express'
import connection from '../connection'
import { user } from '../types'
import { generateId } from '../services/IdGenerator'
import { Authenticator } from '../services/Authenticator'

export default async function loginUser(req: Request, res: Response):Promise<void> {
    try{
        const {email, password} = req.body
        
        if(!email || !password){
            res.status(422)
            throw new Error("Preencha os campos corretamente. Campos necessários: 'email' e 'password'.")
        }

        const [user] = await connection('users')
            .where({ email })

        if (!user){
            throw new Error("Usuário inexistente.")
        }

        if(password != user.password){
            res.status(400)
            throw new Error("Senha incorreta.")
        }

        const authenticator = new Authenticator()
        const token = authenticator.generateToken({ id: user.id, role: user.role })

        res.send(`Usuário logado com sucesso no token ${token}`).status(201)
        }catch(error: any){
            res.send(error.sqlMessage || error.message)
        }
    }