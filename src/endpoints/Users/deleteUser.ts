import { Request, Response, response} from 'express'
import connection from '../../connection'
import { Authenticator } from '../../services/Authenticator'

export default async function deleteUser(req: Request, res: Response):Promise<void> {
    try{
        const {email} = req.body
        const token = req.headers.authorization

        if(!token){
            res.status(401)
            throw new Error("Preencha o header corretamente. Campo necessário: 'Authorization'.")
        }
        
        const authenticator = new Authenticator()
        const tokenData = authenticator.getTokenData(token)

        if(tokenData.role === "USER"){
            res.status(403)
            throw new Error("Você não tem permissão para deletar um usuário.")
        }

        if(!email){
            res.status(400)
            throw new Error("Preencha os campos corretamente. Campo necessário: 'email'.")
        }

        const [user] = await connection('users')
            .where({email})

        if(!user){
            res.status(404)
            throw new Error("Usuário inexistente.")
        }

        if(user.id === tokenData.id){
            res.status(403)
            throw new Error("Você não pode deletar a sua própria conta.")
        }

        await connection('users')
            .delete()
            .where({ email: email })

        res.send("Usuário deletado com sucesso.").status(200)
    }catch (error: any){
        res.send(error.sqlMessage || error.message).status(500)
    }
}