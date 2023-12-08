import { Request, Response } from 'express'
import connection from '../../connection'
import { Authenticator } from '../../services/Authenticator'
import { hash, compare } from '../../hashManager'

export default async function editUser(req: Request, res: Response): Promise<void> {
    try {
        const { name, email, password } = req.body
        const token = req.headers.authorization

        if (!token) {
            res.status(401)
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.")
        }

        const authenticator = new Authenticator()
        const tokenData = authenticator.getTokenData(token)

        const [user] = await connection('users')
            .where({ id: tokenData.id })

        if (!name && !email && !password) {
            res.status(400)
            throw new Error("Preencha o(s) campo(s) que quer editar.")
        }

        const changes: { name?: string; email?: string; password?: string } = {}

        if (email) {
            const [existingUserWithEmail] = await connection('users')
                .where({ email })

            if (existingUserWithEmail) {
                res.status(409)
                throw new Error("Email já cadastrado.")
            }

            if (email !== user.email) {
                changes.email = email
            }
        }

        if(name){
            if(name === user.name){
                res.status(409)
                throw new Error("O nome inserido é igual ao atual.")
            }
            changes.name = name
        }

        if (password) {
            const samePassword = await compare(password, user.password)

            if (samePassword) {
                res.status(409)
                throw new Error("A senha inserida é igual a atual.")
            }

            const cypherPassword = await hash(password)
            changes.password = cypherPassword
        }

        if (Object.keys(changes).length > 0) {
            await connection('users')
                .update(changes)
                .where({ id: tokenData.id })
        }

        res.send("Usuário atualizado com sucesso.").status(200)
    } catch (error: any) {
        res.send(error.sqlMessage || error.message).status(500)
    }
}
