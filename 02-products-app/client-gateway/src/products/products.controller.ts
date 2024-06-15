import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCT_SERVICE } from 'src/config';



@Controller('products')
export class ProductsController {

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {}

  @Post()
  createProduct(){
    return 'Crea un producto'
  }

  @Get()
  findAllProducts() {
    return this.productsClient.send(
      { cmd: 'find_all_products' },       // Primer arg objeto del productController del microservicio
      {}                                  // Segundo arg es el payload con el limit y la página desde donde empezaría la busqueda
    ) 
  }

  @Get(':id')
  findOne(@Param('id') id:string) {
    return 'Esta función regresa un producto por id ' + id
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
