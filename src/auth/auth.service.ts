import { RefreshToken } from 'src/auth/schemas/refresh-token.schema';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register.dto';
import { genSaltSync, hashSync, compare } from 'bcryptjs';
import { LoginAuthDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';
import { Response } from 'express';
import { UserType } from 'src/@types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,  // Đổi tên từ `JwtService` thành `jwtService` để phù hợp với convention
  ) { }

  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  async login({ email, password }: LoginAuthDto, response: Response) {
    const user = await this.userModel.findOne({ email })
    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không chính xác. Vui lòng thử lại!")
    }

    const check = await compare(password, user.password)
    if (!check) {
      throw new UnauthorizedException("Email hoặc mật khẩu không chính xác. Vui lòng thử lại!")
    }
    const tokens = await this.generateUserToken(user._id);

    //Set cookies 
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, // Ngăn không cho JavaScript từ client truy cập vào cookie này
      // secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong môi trường sản xuất
      sameSite: 'lax', // Giảm thiểu nguy cơ tấn công CSRF
      maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (1 ngày)
    });

    return {
      ...tokens,
    }
  }

  async register({ email, name, password }: RegisterAuthDto, response: Response) {
    const isExists = await this.userModel.findOne({ email });
    if (isExists) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashedPassword = this.hashPassword(password);
    const user = await this.userModel.create({ email, name, password: hashedPassword });
    const tokens = await this.generateUserToken(user._id);

    //Set cookies 
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, // Ngăn không cho JavaScript từ client truy cập vào cookie này
      // secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong môi trường sản xuất
      sameSite: 'lax', // Giảm thiểu nguy cơ tấn công CSRF
      maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (1 ngày)
    });

    return {
      ...tokens,
    }
  }

  async generateUserToken(userId) {
    const user = await this.userModel.findOne<UserType>({ _id: userId })
    if (!user) {
      throw new BadRequestException()
    }
    await this.refreshTokenModel.deleteMany({ userId });
    const accessToken = await this.jwtService.sign({ _id: user._id, name: user.name, email: user.email }, { expiresIn: '1d' })
    const refreshToken = uuidv4()
    await this.storeRefreshToken(refreshToken, userId)
    return {
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email }
    };
  }

  async refreshToken(token: string, response: Response) {
    const refreshToken = await this.refreshTokenModel.findOne(
      {
        token: token,
        expiresIn: { $gte: new Date() }//thời gian lớn hơn hoặc bằng thời gian hiện tại nghĩa là chưa hết hạn
      }
    )
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh Token đã hết hạn")
    }
    const tokens = await this.generateUserToken(refreshToken.userId)
    //Set cookies 
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, // Ngăn không cho JavaScript từ client truy cập vào cookie này
      // secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong môi trường sản xuất
      sameSite: 'lax', // Giảm thiểu nguy cơ tấn công CSRF
      maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (1 ngày)
    });

    return { ...tokens }
  }


  async storeRefreshToken(token: string, userId: string) {//Lưu vào bảng refresh token
    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + 3)//+ 3 ngay
    await this.refreshTokenModel.create({ token, userId, expiresIn })
  }


  async logout(user: UserType, response: Response) {
    try {
      await this.refreshTokenModel.deleteMany({ userId: user._id });
      response.clearCookie('refresh_token');
    } catch (err) {
      throw new BadRequestException("Đăng xuất gặp lỗi")
    }
  }
}
