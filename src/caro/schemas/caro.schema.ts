import { User } from './../../auth/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { validate } from 'class-validator';
import mongoose, { HydratedDocument } from "mongoose";

export type CaroDocument = HydratedDocument<Caro>

@Schema({ timestamps: true })
export class Caro {
    @Prop()
    name: string;

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
        validate: {
            validator: (value: mongoose.Types.ObjectId[]) => value.length < 2,
            message: "Số người trong phòng vượt quá giới hạn"
        }
    })
    users: mongoose.Types.ObjectId[]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    createdBy: mongoose.Types.ObjectId
}


export const CaroSchema = SchemaFactory.createForClass(Caro)