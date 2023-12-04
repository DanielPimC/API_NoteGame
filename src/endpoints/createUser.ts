import { Request, Response } from 'express'
import connection from '../connection'
import { user, Roles } from '../types'
import { generateId } from '../services/IdGenerator'
import { Authenticator } from '../services/Authenticator'

export default async function createUser(req: Request, res: Response): Promise<void> {
    try{
        const {name, email, password, role} = req.body
        
        if (!name || !email || !password){
            res.status(422)
            throw new Error("Preencha os campos corretamente. Campos necessários: 'name', 'email' e 'password'.")
        }

        if (role !== undefined && role !== "ADMIN" && role !== "USER") {
            res.status(422)
            throw new Error("Role inválida. Escolha entre 'USER' e 'ADMIN'.");
        }


        const [user] = await connection('users')
            .where({email})

        if(user){
            res.status(409)
            throw new Error("Email já cadastrado.")
        }

        const id: string = generateId()
        const userRole: Roles = role !== undefined ? role : Roles.USER;

        const newUser: user = { id, name, email, password, role: userRole };

        await connection('users')
            .insert(newUser)

            const authenticator = new Authenticator();
            const token = authenticator.generateToken({ id: id, role: role });


            res.send(`Usuário criado com sucesso! \n Token do usuário: ${token}`).status(200)
    }catch(error: any){
        res.send(error.sqlMessage || error.message)
    }
}