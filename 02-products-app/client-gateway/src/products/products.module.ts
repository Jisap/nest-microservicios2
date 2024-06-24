import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, PRODUCT_SERVICE, envs } from 'src/config';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ProductsController],
  providers: [],
  imports: [
    
    // ClientsModule.register([ 
    //   {
    //     name: PRODUCT_SERVICE,    // Injection token (nombre del servicio)
    //     transport: Transport.TCP,
    //     options: {
    //       host: envs.productsMicroservicesHost, // host
    //       port: envs.productsMicroservicesPort  // port
    //     }
    //   }
    // ])
    // ClientsModule.register([
    //   {
    //     name: NATS_SERVICE,         // Injection token (nombre del servicio)
    //     transport: Transport.NATS,
    //     options: {
    //       servers: envs.natsServers
    //     }
    //   }
    // ])

    NatsModule
  ]
})
export class ProductsModule {}
