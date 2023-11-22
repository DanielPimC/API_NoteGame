import knex from 'knex'
import dotenv from 'dotenv'

dotenv.config()

const connection = knex({
    client: "pg",
    connection: {
        host: process.env.DB_HOST,
        port: 5432,
        user: process.env.DB_USER,
        password: String(process.env.DB_PASSWORD),
        database: process.env.DB_SCHEMA,
        multipleStatements: true
    }
})

export default connection