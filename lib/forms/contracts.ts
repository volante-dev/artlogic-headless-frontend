import {Ajv2020} from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import {formsSchemaDocument} from "./schemas.generated";
// OpenAPI's components container is not itself a JSON Schema keyword.
const schemas=JSON.parse(JSON.stringify(formsSchemaDocument.components.schemas).replaceAll("#/components/schemas/","#/$defs/"));
const ajv=new Ajv2020({strict:true,allErrors:false});(addFormatsModule as unknown as(a:Ajv2020)=>void)(ajv);ajv.addKeyword({keyword:"example",valid:true});ajv.addSchema({$id:"urn:artlogic:forms-bff",$defs:schemas});
export function validFormContract(schema:string,value:unknown){return ajv.getSchema("urn:artlogic:forms-bff#/$defs/"+schema)?.(value)===true;}
