import { UserType } from "src/@types/auth.type";


export type CaroType = {
    name: string;
    users: UserType[];
    createdBy: UserType
}