export function formExecutionMode(input:{requested?:"live"|"inert";inherited:"live"|"inert";editorial:"live"|"inert";contact:"live"|"captured"|"inert";scope:"public"|"preview"}){
 return input.requested==="inert"||input.inherited==="inert"||input.editorial==="inert"||input.contact==="inert"||input.scope==="preview"?"inert" as const:"live" as const;
}
