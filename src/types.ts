export type user = {
    id: string,
    email: string,
    password: string
    name: string,
    role: Roles
}

export enum Roles{
    ADMIN = "ADMIN",
    USER = "USER"
}