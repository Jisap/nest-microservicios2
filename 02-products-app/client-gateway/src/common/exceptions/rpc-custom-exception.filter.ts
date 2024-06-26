import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)                                                        // Atrapamos la exception de tipo Rpc
export class RpcCustomExceptionFilter implements ExceptionFilter {          // La clase RpcCustomExceptionFilter implementa la interfaz ExceptionFilter. Esto obliga a la clase a definir el método catch.
  
  catch(exception: RpcException, host: ArgumentsHost) {                     // El método catch recibe dos argumentos: la exception y el contexto de la misma

    const ctx = host.switchToHttp()                                         // Contexto
    const response = ctx.getResponse()                                      // Objeto de respuesta http desde el contexto 

    const rpcError = exception.getError()                                   // Error desde la exception
    
    //Evaluaciones de errores
    
    if( rpcError.toString().includes('Empty response') ){                   // Si el error contiene 'Empty response'
      return response.status(500).json({
        status: 500,
        message: rpcError.toString().substring(
          0, rpcError.toString().indexOf('(') - 1                           // El message contendrá la descripción menos la alusión al microservicio que falla
        )                                                                   
      })
    }

    if( typeof rpcError === 'object' &&                                     // verificacion de si el error es un objeto y
      'status' in rpcError &&                                               // si tiene un status
      'message' in rpcError                                                 // y un message
    ){
      const status = isNaN(+rpcError.status)                                // Si tiene todo lo anterior se define el status
        ? 400 
        : +rpcError.status;                 
      return response.status(status).json(rpcError)                         // y se introduce en la response
    }

    response.status(400).json({                                             // Si rpcError no cumple con las condiciones anteriores, badRequest y mensaje de error
      status: 400,
      message: rpcError
    })
  }
}