"use client";
import {Typography} from "../ui/Typography";
import {TextField} from "../ui/TextField";
import {Button} from "../ui/Button";
import {useSiteContent} from "../SiteContentProvider";
import {ContactArtworkContext} from "./ContactArtworkContext";
import {ContactReceipt} from "./ContactReceipt";
import type {ContactFormViewProps} from "../../lib/contact/types";
import styles from "./ContactForm.module.css";
/** Replaceable view: all network, proof and authorization rules remain in the controller. */
export function ContactFormView({configuration,mode,headingLevel="h1",values,selected,contextRejected,website,pending,restoring,receipt,notice,errors,retryAfter,hasProof,errorRef,onSubmit,onNew,onRecover,onGeneral,onField,onWebsite}:ContactFormViewProps){
 const {messages:m}=useSiteContent();
 const title=m["page.contact.title"];
 return <section className={styles.section} aria-label={title}><div className={styles.inner}><Typography variant={headingLevel}>{title}</Typography>
  {receipt?<ContactReceipt receipt={receipt} onNew={onNew}/>:<>
   {mode==="inert"&&<p role="status">{m["contact.demonstration"]}</p>}
   {restoring?<p role="status">{m["contact.recovering"]}</p>:<>
    {(selected||contextRejected)&&<aside className={styles.context}><ContactArtworkContext artwork={selected} unavailable={contextRejected} onGeneral={onGeneral}/></aside>}
    {notice&&<div className={styles.feedback} ref={errorRef} tabIndex={-1} data-testid="contact-errors" role="alert"><p>{m[("contact."+notice)as keyof typeof m]}</p>{Object.entries(errors).map(([field,error])=><p key={field}><a href={"#contact-"+field}>{m[("contact."+field)as keyof typeof m]}: {error}</a></p>)}{retryAfter&&<p>{m["contact.retryAfter"]}: {retryAfter}</p>}{hasProof&&<div className={styles.actions}><Button variant="outlined" disabled={pending} onClick={onRecover}>{m["contact.recover"]}</Button><Button variant="text" disabled={pending} onClick={onNew}>{m["contact.newEnquiry"]}</Button></div>}</div>}
    {!configuration?.enabled&&mode!=="inert"?<p role="status">{m["contact.disabled"]}</p>:<form noValidate onSubmit={onSubmit} className={styles.form}>
     <div className={styles.instructions}><p id="contact-required">{m["contact.required"]}</p><p id="contact-limits">{m["contact.limits"]}</p></div>
     <div className={styles.fields}>{(["name","email","subject","message"]as const).map(field=><div key={field} className={field==="subject"||field==="message"?styles.full:undefined}><TextField id={"contact-"+field} name={field} label={m[("contact."+field)as keyof typeof m]} type={field==="email"?"email":"text"} autoComplete={field==="name"?"name":field==="email"?"email":"off"} value={values[field]} onChange={e=>onField(field,e.target.value)} disabled={pending} multiline={field==="message"} minRows={field==="message"?6:undefined} error={Boolean(errors[field])} helperText={errors[field]} slotProps={{htmlInput:{"aria-required":true,"aria-describedby":"contact-required contact-limits"+(errors[field]?" contact-"+field+"-helper-text":"")}}}/></div>)}</div>
     <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e=>onWebsite(e.target.value)}/></div>
     <div className={styles.privacy}><p>{m["contact.privacy"]}</p>{configuration?.privacyUrl&&<a href={configuration.privacyUrl} target="_blank" rel="noopener noreferrer">{m["contact.privacyLink"]}</a>}</div>
     <div className={styles.actions}><Button type="submit" disabled={pending||contextRejected||mode==="inert"}>{pending?m["contact.sending"]:m["contact.submit"]}</Button><span role="status" className={styles.status}>{pending?m["contact.sending"]:""}</span></div>
    </form>}
   </>}
  </>}
 </div></section>;
}
