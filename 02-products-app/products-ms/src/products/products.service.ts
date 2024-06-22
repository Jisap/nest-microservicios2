import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient, Product } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';


@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('ProductsService')

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll( paginationDto: PaginationDto) {
    
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({ where: {available: true} });

    const lastPage = Math.ceil(totalPages/limit)

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit, // Desde donde se quiere empezar a ver registros
        take: limit,              // Número de registros por página  
        where: {
          available: true
        }
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      }
    }
  }

  async findOne(id: number) {
    
    const product = await this.product.findFirst({
      where: { id, available: true }
    });

    if(!product){
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id:__, ...data } = updateProductDto; // Eliminamos el id del updateProductDto para obtener la data 
    
    await this.findOne(id)
    
    return this.product.update({
      where: { id },
      data: data
    })
  }

  async remove(id: number) {

    await this.findOne(id)

    const product = await this.product.update({
      where: { id },
      data: {
        available: false
      }
    })

    return product
  }

  async validateProducts( ids: number[]){                 // Esta fn se encarga de asegurarse de que los ptos de la orden existan en bd
  
    ids = Array.from(new Set(ids));                       // [ids] sin duplicados 
  
    const products = await this.product.findMany({        // Buscamos en bd todos los ptos que coincidan con esos ids
      where: {
        id: {
          in: ids
        }
      }
    })

    if( products.length !== ids.length){
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST
      })
    }

    return products;
  }
}
