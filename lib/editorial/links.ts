export function safeEditorialHref(value:string){
 if(value!==value.trim()||/[\u0000-\u0020\u007f\\]/u.test(value)||/%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i.test(value))return false;
 if(value.startsWith("/")&&!value.startsWith("//")||value.startsWith("#"))return true;
 try{const url=new URL(value);return url.protocol==="https:"&&Boolean(url.hostname)&&!url.username&&!url.password||["mailto:","tel:"].includes(url.protocol)&&Boolean(url.pathname);}catch{return false;}
}
