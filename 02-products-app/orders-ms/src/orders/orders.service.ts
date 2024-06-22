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

  async create(createOrderDto: CreateOrderDto) {                                // Se reciben los items
    
    try {

      const productIds = createOrderDto.items.map( item => item.productId )     // Obtenemos de cada item su id

      const products: any[] = await firstValueFrom(
        this.productsClient.send({ cmd: 'validate_products' }, productIds)      // validamos en products_ms esos ids (deben existir en bd)
      );

      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {     // Por cada item
        
        const price = products.find(                                            // obtenemos el price (debe de coincidir ids de bd con ids de dto)
          (product) => product.id === orderItem.productId
        ).price

        return acc + price * orderItem.quantity                                 // y dicho price se multiplica por la cantidad + acumulador => TotalAmount

      }, 0)
  
      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {      // Sistema similar para obtener el total de items 
        return acc + orderItem.quantity
      }, 0)

      const order = await this.order.create({                                   // Grabación en bd de la order
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find((product) => product.id === orderItem.productId).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity
              }))
            }
          }
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      })

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find(product => product.id === orderItem.productId).name
        }))
      
      }
      
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs'
      })
    }

    
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
