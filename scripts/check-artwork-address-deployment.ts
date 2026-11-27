import {readFile} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
import {parseEnv} from 'node:util';
function parseArtworkAddressCapability(value:unknown){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();const c=value as {schemaVersion:number;available:boolean;mode:string;addressRevision:string|null;minimumContractVersion:number};
 if(Object.keys(c).sort().join(',')!=='addressRevision,available,minimumContractVersion,mode,schemaVersion'||c.schemaVersion!==1||typeof c.available!=='boolean'||!['legacy','active'].includes(c.mode)||![0,1].includes(c.minimumContractVersion)||c.addressRevision!==null&&(typeof c.addressRevision!=='string'||!/^(0|[1-9][0-9]{0,29})$/.test(c.addressRevision))||c.mode==='active'&&(!c.available||c.minimumContractVersion!==1)||!c.available&&(c.mode!=='legacy'||c.minimumContractVersion!==0||c.addressRevision!==null))throw new Error();return c;
}
const [file,supported]=process.argv.slice(2);
try{
 if(!file||!isAbsolute(file)||!['0','1'].includes(supported??''))throw new Error();const env=parseEnv(await readFile(file,'utf8')),origin=new URL(env.BACKEND_URL!);if(origin.origin!==env.BACKEND_URL||origin.protocol!=='https:'&&!(env.DATA_MODE==='mock'&&env.DEPLOYMENT_ENV==='test'&&['127.0.0.1','localhost'].includes(origin.hostname)))throw new Error();
 const floor=env.ARTWORK_ADDRESSES_MINIMUM_CONTRACT_VERSION==='1'?1:0,response=await fetch(origin.origin+'/v1/public/artwork-addresses/capabilities',{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(5000)});
 if(response.status===404&&floor===0){await response.body?.cancel();console.log(JSON.stringify({admitted:true,available:false,mode:'legacy'}));}
 else {if(!response.ok)throw new Error();const reader=response.body?.getReader();if(!reader)throw new Error();let size=0;const chunks:Uint8Array[]=[];try{for(;;){const p=await reader.read();if(p.done)break;size+=p.value.length;if(size>4096)throw new Error();chunks.push(p.value);}}finally{await reader.cancel().catch(()=>undefined);}const c=parseArtworkAddressCapability(JSON.parse(Buffer.concat(chunks).toString('utf8')));if(Math.max(floor,c.minimumContractVersion)>Number(supported)||floor===1&&!c.available)throw new Error();console.log(JSON.stringify({...c,admitted:true}));}
}catch{console.error(JSON.stringify({error:{code:'artwork_address_deployment_rejected'}}));process.exitCode=1;}
