import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class RefreshToken extends Document {
    @Prop({ required: true })
    token: string;

    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ required: true })
    expiresIn: Date;

}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);