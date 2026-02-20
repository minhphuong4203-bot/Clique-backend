import { IsArray, ValidateNested, IsDateString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotDto {
    @ApiProperty({ description: 'Ngày rảnh (ISO 8601 string, phần giờ sẽ bị bỏ qua)', example: '2023-10-25T00:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ description: 'Giờ bắt đầu rảnh (ISO 8601 string)', example: '2023-10-25T14:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ description: 'Giờ kết thúc rảnh (ISO 8601 string)', example: '2023-10-25T16:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    endTime: string;
}

export class SubmitAvailabilityDto {
    @ApiProperty({ type: [AvailabilitySlotDto], description: 'Danh sách các khoảng thời gian rảnh' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AvailabilitySlotDto)
    slots: AvailabilitySlotDto[];
}
