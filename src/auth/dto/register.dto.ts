import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class RegisterAuthDto {
    @IsNotEmpty({ message: "Họ và tên không được để trống" })
    name: string;

    @IsNotEmpty({ message: "Email khồn được để trống" })
    @IsEmail({}, { message: "Email không đúng định dạng" })
    email: string;

    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    @MinLength(6, { message: "Tối thiểu chứa 6 ký tự" })
    password: string;
}
