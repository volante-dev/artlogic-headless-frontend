import{loadConfig,stringValue}from"../config/env";
/** Embed private previews only in the configured admin; never trust request origins. */
export function previewFramePolicy(){return "frame-ancestors 'self' "+stringValue(loadConfig(),"ADMIN_ORIGIN");}
