import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto';
import { PRODUCT_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';



@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy, // Inyección del servicio de ptos definido en orders module
  ){
    super()
  }
  
  async onModuleInit() {
    await this.$connect(); // Inicialización a la base de datos
    this.logger.log('Database connected')
  }

  async create(createOrderDto: CreateOrderDto) {
    
    const ids = [5, 6]

    const products = await firstValueFrom(
      this.productsClient.send({ cmd: 'validate_products' }, ids)
    )

    return products
    
    // return this.order.create({
    //   data: createOrderDto
    // })
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {

    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    })

    const currentPage = orderPaginationDto.page;  // Página actual desde donde se quiere empezar a buscar
    const perPage = orderPaginationDto.limit;     // registros por página

    return {
      data: await this.order.findMany({           
        skip: ( currentPage - 1 ) * perPage,      // Se saltan los registros correspondientes a la página actual *  el limit
        take: perPage,                            // se mostrarán los registros según el limit
        where: {
          status: orderPaginationDto.status       // y de esos registros los que coincidam con el status del query
        }
      }),
      meta: {                                     // Ademas se mostrará la información meta de la busqueda
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage)
      }
    }
  }

  async findOne(id: string) {
    
    const order = await this.order.findFirst({
      where: { id }
    });

    if(!order){
      throw new RpcException({
        status: HttpStatus.NOT_FOUND, 
        message: `Order with id ${id} not found`
      });
    }
    
    return order
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto){

    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);
    if( order.status === status ){
      return order
    }

    return this.order.update({
      where: { id },
      data: {
        status: status
      }
    })
  }
}
