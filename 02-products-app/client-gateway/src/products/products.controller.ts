import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';



@Controller('products')
export class ProductsController {

  constructor() {}

  @Post()
  createProduct(){
    return 'Crea un producto'
  }

  @Get()
  findAllProducts() {
    return 'Esta función regresa varios productos'
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
