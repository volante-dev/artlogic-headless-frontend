"use client";
import {ContactFormView} from '../../components/contact/ContactFormView';
import type {ContactFormViewProps} from '../../lib/contact/types';
/** An explicit client slot replacement shares the protected generic controller. */
export function DemoGalleryContactForm(props:ContactFormViewProps){return <div data-client="demo-gallery-contact"><ContactFormView {...props}/></div>;}
