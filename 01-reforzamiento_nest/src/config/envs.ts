import 'dotenv/config';
import * as joi from 'joi'

interface EnvVars {
  PORT: number;

}

const envsSchema = joi.object({                                        // Esquema de validación según joi
  PORT: joi.number().required()
})
.unknown(true)

const { error, value } = envsSchema.validate(process.env);             // Se le pasa a ese esquema la función de joi "validate"

if(error){
  throw new Error(`Config validation error: ${error.message}`);        // Si hay algún error dispara el throw   
}

const envVars:EnvVars = value;                                         // Tipamos las variables de entorno que usaremos

export const envs = {                                                  // Y si no hay error se exporta la variable de entorno desde el esquema validado. 
  port: envVars.PORT

}