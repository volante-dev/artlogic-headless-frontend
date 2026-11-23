'use client';
import {use,type ReactNode} from 'react';
import type {HeaderCommerceAvailability} from '../../lib/header/navigation-state';
/** Read only inside the small Suspense boundaries for secondary links. */
export function HeaderCommerceBoundary({availability,render}:{availability:Promise<HeaderCommerceAvailability>;render:(value:HeaderCommerceAvailability)=>ReactNode}){return render(use(availability));}
