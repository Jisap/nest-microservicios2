import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';



@Controller('products')
export class ProductsController {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy, // Conexión al microservicio de products
  ) {}

  @Post()
  createProduct(@Body() createProductDto:CreateProductDto){
    return this.client.send(
      { cmd: 'create_product' }, 
      createProductDto
    )
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      { cmd: 'find_all_products' },       // Primer arg objeto del productController del microservicio
       paginationDto                      // Segundo arg es el payload (paginationDto) con el limit y la página desde donde empezaría la busqueda
    ) 
  }

  @Get(':id')
  async findOne(@Param('id') id:string) {

    try {
      const product = await firstValueFrom(                               // firstValueFrom permite recibir un observable como argumento y trabajarlo como una promesa
        this.client.send({ cmd: 'find_one_product' }, {id})               // de esta manera no hay que hacer ningun subscribe al observable.
      );                                                                  // Se espera el primer valor que va a emitir
      return product                                                      // Si todo sale bien retornamos el producto
      
    } catch (error) {
      throw new RpcException(error)
    }

    //return this.client.send({ cmd: 'find_one_product' }, {id})  // Forma alternativa corta
    //   .pipe(
    //      catchError( err => { throw new RpcException(err) })
    //)    
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {   
    return this.client.send({ cmd: 'delete_product' },{id}
    ).pipe(
      catchError(err => { throw new RpcException(err) })
    )
  }

  @Patch(':id')
  patchProduct(
    @Param('id', ParseIntPipe) id:number,
    @Body() updateProductDto: UpdateProductDto,
  ){
    return this.client.send({ cmd: 'update_product' }, 
      { id, 
        ...updateProductDto 
      }
    ).pipe(
      catchError( err => { throw new RpcException( err )})
    )
  }
}
