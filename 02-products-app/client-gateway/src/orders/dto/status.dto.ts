import { OrderStatus, OrderStatusList } from "../enum/order.enum";
import { IsEnum, IsOptional } from 'class-validator';



export class StatusDto {

  @IsOptional()
  @IsEnum( OrderStatusList, {
    message: `Valid status ar ${ OrderStatusList}` 
  })
  status: OrderStatus
}