import {Request,Response} from "express"

export interface IAuthAdminController{
    verifyAdmin(req:Request,res:Response):Promise<void>
}