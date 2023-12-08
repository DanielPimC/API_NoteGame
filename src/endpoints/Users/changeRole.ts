import { Request, Response } from 'express'
import connection from '../../connection'
import { Authenticator } from '../../services/Authenticator'

export default async function changeRole(req: Request, res: Response): Promise<void> {
    try {
        const { email, role } = req.body
        const token = req.headers.authorization

        if (!token) {
            res.status(401)
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.")
        }

        const authenticator = new Authenticator()
        const tokenData = authenticator.getTokenData(token)

        if (tokenData.role === "USER") {
            res.status(403)
            throw new Error("Você não tem permissão para alterar a role de outro usuário.")
        }

        if (!email && !role) {
            res.status(400)
            throw new Error("Preencha os campos corretamente. Campos necessários: 'email' e 'role'.")
        }

        const [user] = await connection('users')
            .where({ email })

        if (!user) {
            res.status(404)
            throw new Error("Usuário inexistente.")
        }

        if (user.id === tokenData.id) {
            res.status(403)
            throw new Error("Você não pode alterar a sua própria role.")
        }

        if (role !== "ADMIN" && role !== "USER") {
            res.status(400)
            throw new Error("Role inválida. Escolha entre 'USER' e 'ADMIN'.")
        }

        if (user.role === role) {
            res.status(409)
            throw new Error(`A role do usuário já é ${role}. Nenhuma alteração realizada.`)
        }

        await connection('users')
            .update({ role })
            .where({ email: email })

        res.send(`Usuário atualizado com sucesso. Role ${role} definida.`).status(200)
    } catch (error: any) {
        res.send(error.sqlMessage || error.message).status(500)
    }
}
