import { RESPONSE_MESSAGE } from './../decorators/customize';
import { Reflector } from '@nestjs/core';
// Logging (Ghi log): Ghi lại thông tin về request và response.
// Transformation (Biến đổi): Thay đổi hoặc định dạng lại dữ liệu trước khi trả về cho client.
// Error handling (Xử lý lỗi): Bắt và xử lý lỗi xảy ra trong quá trình xử lý request.
// Timeouts (Giới hạn thời gian): Đặt giới hạn thời gian cho request để đảm bảo hệ thống không bị treo do các request kéo dài.
// Response Mapping (Ánh xạ phản hồi): Điều chỉnh cấu trúc của response trước khi trả về.

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class Transformation implements NestInterceptor {

    constructor(private reflector: Reflector) { }


    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(
                map((data) => ({
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message: this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()),
                    data: data,
                }))
            );
    }
}