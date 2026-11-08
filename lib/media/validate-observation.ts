import type {MediaObservation} from "./observations";
export function validateMediaObservation(value:unknown):MediaObservation{
 if(!value||typeof value!=="object"||Array.isArray(value))throw Error("invalid_request");const v=value as MediaObservation;
 const keys=["resourceKind","resourceId","displayId","retry","event","elapsedMs"];
 if(Object.keys(v).length!==6||!keys.every(k=>Object.hasOwn(v,k))||!["artwork","siteLogo"].includes(v.resourceKind)||typeof v.resourceId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.resourceId)||typeof v.displayId!=="string"||!/^[A-Za-z0-9_.:-]{1,160}$/.test(v.displayId)||![0,1].includes(v.retry)||!["loaded","failed","timeout","retry"].includes(v.event)||!Number.isInteger(v.elapsedMs)||v.elapsedMs<0||v.elapsedMs>180000)throw Error("invalid_request");
 return {resourceKind:v.resourceKind,resourceId:v.resourceId,displayId:v.displayId,retry:v.retry,event:v.event,elapsedMs:v.elapsedMs};
}
