import { Request, Response } from 'express'
import connection from '../../connection'
import { Authenticator } from '../../services/Authenticator'
import { compare } from 'bcryptjs'

export default async function loginUser(req: Request, res: Response):Promise<void> {
    try{
        const {email, password} = req.body
        
        if(!email || !password){
            res.status(400)
            throw new Error("Preencha os campos corretamente. Campos necessários: 'email' e 'password'.")
        }

        const [user] = await connection('users')
            .where({ email })

        if (!user){
            res.status(404)
            throw new Error("Usuário inexistente.")
        }

        const correctPassword = await compare(password, user.password)

        if(!correctPassword){
            res.status(401)
            throw new Error("Senha incorreta.")
        }

        const authenticator = new Authenticator()
        const token = authenticator.generateToken({ id: user.id, role: user.role })

        res.send(`Usuário logado com sucesso! \n Token: ${token}`).status(200)
    }catch(error: any){
            res.send(error.sqlMessage || error.message).status(500)
    }
}