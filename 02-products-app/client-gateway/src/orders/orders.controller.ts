import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseUUIDPipe, Query } from '@nestjs/common';
import { ORDER_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';


@Controller('orders')
export class OrdersController {

  constructor(@Inject(ORDER_SERVICE) private readonly ordersClient: ClientProxy,) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersClient.send(
      'createOrder',
      createOrderDto
    );
  }

  @Get()
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    
    return this.ordersClient.send(
      'findAllOrders',
      orderPaginationDto
    );
  }

  @Get('id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {

    try {
      const order = await firstValueFrom(
        this.ordersClient.send(
          'findOneOrder',
          {id}
        )
      );
      return order;

    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,              // Se recibe el status
    @Query() paginationDto: PaginationDto,      // y la paginación
  ) {

    try {

      return this.ordersClient.send(
        'findAllOrders',{                       // El controlador del orderMicroservicios recibe
          ...paginationDto,                     // la paginación y
          status: statusDto.status              // el status
        }
      );

    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id:string,
    @Body() statusDto: StatusDto
  ){
    try {
      return this.ordersClient.send(
        'changeOrderStatus', {
          id,
          status: statusDto.status
        }
      )
    } catch (error) {
      throw new RpcException(error)
    }
  }
}
