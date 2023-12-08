import { Request, Response } from 'express'
import connection from '../../connection'
import { user, Roles } from '../../types'
import { generateId } from '../../services/IdGenerator'
import { Authenticator } from '../../services/Authenticator'
import { hash } from '../../hashManager'

export default async function createUser(req: Request, res: Response): Promise<void> {
    try{
        const {name, email, password} = req.body

        if (!name || !email || !password){
            res.status(400)
            throw new Error("Preencha os campos corretamente. Campos necessários: 'name', 'email' e 'password'.")
        }
        
        const [user] = await connection('users')
            .where({email})

        if(user){
            res.status(409)
            throw new Error("Email já cadastrado.")
        }

        const id: string = generateId()
        const cypherPassword = await hash(password)
        let role: Roles = Roles.USER

        if (email === "daniel@admin.com") {
            role = Roles.ADMIN
        }

        const newUser: user = { id, name, email, password: cypherPassword, role }

        await connection('users')
            .insert(newUser)

        const authenticator = new Authenticator()
        authenticator.generateToken({ id: id, role: role })

        res.send(`Usuário criado com sucesso!`).status(201)
    }catch(error: any){
        res.send(error.sqlMessage || error.message).status(500)
    }
}