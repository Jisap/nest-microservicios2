import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
//import { ClientsModule, Transport } from '@nestjs/microservices';
//import { ORDER_SERVICE, envs } from 'src/config';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [OrdersController],
  imports: [
    // ClientsModule.register([
    //   {
    //     name: ORDER_SERVICE,    // Injection token (nombre del servicio)
    //     transport: Transport.TCP,
    //     options: {
    //       host: envs.ordersMicroservicesHost, // host
    //       port: envs.ordersMicroservicesPort  // port
    //     }
    //   }
    // ])
    
    NatsModule
  ]
  
})
export class OrdersModule {}
