import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Caro } from 'src/caro/schemas/caro.schema';
import { Model } from 'mongoose';
import { CaroType } from 'src/@types/caro.type';
import { UserType } from 'src/@types/auth.type';
import { CreateCaroDto } from 'src/caro/dto/create-caro.dto';
import path from 'path';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class CaroService {

    constructor(@InjectModel(Caro.name) private caroModel: Model<Caro>) { }

    async listRooms() {
        return await this.caroModel.find()
            .sort({ 'createdAt': -1 })
            .populate([
                {
                    path: "createdBy",
                    select: { name: 1, email: 1, _id: 1 }
                },
                {
                    path: "users",
                    select: { name: 1, email: 1, _id: 1 }
                }
            ])
    }

    async createRoom(body: CreateCaroDto, user: UserType) {
        return await this.caroModel.create({
            ...body,
            users: [user._id],
            createdBy: user._id
        });
    }


    async updateAddUserRoom(roomId: string, user: UserType) {
        try {
            await this.caroModel.updateOne(
                { _id: roomId },
                {
                    $push: { users: user._id },
                }
            );

            return await this.getUserRoom(roomId);
        } catch (err) {
            throw new WsException(err)
        }
    }

    async updateLeaveUserRoom(roomId: string, user: UserType) {
        try {
            await this.caroModel.updateOne(
                { _id: roomId },
                {
                    $pull: { users: user._id }
                }
            );

            return await this.getUserRoom(roomId);
        } catch (err) {
            throw new WsException(err);
        }
    }

    async getUserRoom(roomId: string) {
        try {
            const room = await this.caroModel.findOne<CaroType>({ _id: roomId })
                .populate(
                    {
                        path: "users",
                        select: { _id: 1, name: 1, email: 1 }
                    }
                );
            return room.users;
        } catch (error) {
            throw new WsException(error);
        }
    }

    async removeUserFromRoom(roomId: string, user: UserType) {
        return await this.caroModel.updateOne(
            { _id: roomId },
            {
                $pull: { users: user._id },
            }
        );
    }
}
