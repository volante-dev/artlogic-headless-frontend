"use client";
import MuiTextField,{type TextFieldProps} from "@mui/material/TextField";
import styles from "./TextField.module.css";
/** Generic themed field; business state stays in the contact controller. */
export function TextField(props:TextFieldProps){return <MuiTextField variant="outlined" fullWidth {...props} className={[styles.field,props.className].filter(Boolean).join(" ")}/>;}
