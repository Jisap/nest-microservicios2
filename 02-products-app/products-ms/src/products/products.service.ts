import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient, Product } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

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

    const totalPages = await this.product.count();

    const lastPage = Math.ceil(totalPages/limit)

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit, // Desde donde se quiere empezar a ver registros
        take: limit               // Número de registros por página  
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
      where: { id }
    });

    if(!product){
      throw new NotFoundException(`Product with id #${id} not found`)
    }

    return product
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.product.update({
      where: { id },
      data: updateProductDto
    })
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
