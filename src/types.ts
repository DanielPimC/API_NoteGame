export type user = {
    id: string,
    email: string,
    password: string
    name: string,
    role: Roles
}

export type game = {
    id: string,
    email_owner: string,
    name: string,
    genre: string,
    rating: number
}

export enum Roles{
    ADMIN = "ADMIN",
    USER = "USER"
}
