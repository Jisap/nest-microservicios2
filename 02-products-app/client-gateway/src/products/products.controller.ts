import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { PRODUCT_SERVICE } from 'src/config';



@Controller('products')
export class ProductsController {

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy, // Conexión al microservicio de products
  ) {}

  @Post()
  createProduct(){
    return 'Crea un producto'
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.productsClient.send(
      { cmd: 'find_all_products' },       // Primer arg objeto del productController del microservicio
       paginationDto                      // Segundo arg es el payload (paginationDto) con el limit y la página desde donde empezaría la busqueda
    ) 
  }

  @Get(':id')
  async findOne(@Param('id') id:string) {

    try {
      const product = await firstValueFrom(                               // firstValueFrom permite recibir un observable como argumento y trabajarlo como una promesa
        this.productsClient.send({ cmd: 'find_one_product' }, {id})       // de esta manera no hay que hacer ningun subscribe al observable.
      );                                                                  // Se espera el primer valor que va a emitir
      return product                                                      // Si todo sale bien retornamos el producto
      
    } catch (error) {
      throw new RpcException(error)
    }

    //return this.productsClient.send({ cmd: 'find_one_product' }, {id}) 
    //   .pipe(
    //      catchError( err => { throw new RpcException(err) })
    //)    
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return 'Esta función borra un producto por id ' + id
  }

  @Patch(':id')
  patchProduct(
    @Param('id') id:string,
    @Body() body: any
  ){
    return 'Esta función actualiza el producto ' + id
  }
}
