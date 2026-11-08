import {SvgIcon,type SvgIconProps} from "@mui/material";
const paths={forward:"M4 12h16m-6-6 6 6-6 6",add:"M12 5v14M5 12h14",ready:"m5 12 4 4L19 6",error:"M12 5v9m0 3v1",close:"m6 6 12 12M6 18 18 6",up:"m6 14 6-6 6 6",down:"m6 10 6 6 6-6",image:"M4 5h16v14H4Zm0 11 5-5 4 4 3-3 4 4M15 9h1"} as const;
export function FormIcon({name,...props}:{name:keyof typeof paths}&SvgIconProps){return <SvgIcon {...props} viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></SvgIcon>;}
