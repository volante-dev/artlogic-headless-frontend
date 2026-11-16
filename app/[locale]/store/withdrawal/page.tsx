import {Suspense} from 'react';
import {WithdrawalForm} from '@/components/commerce/WithdrawalForm';
import {HeaderRouteCommit} from '@/components/header/HeaderRouteCommit';
import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
export const metadata={title:'Rétractation | Withdrawal',robots:{index:false,follow:false}};
async function Content(){return <><WithdrawalForm/><HeaderRouteCommit snapshot={await loadHeaderRouteContext()}/></>;}
export default function Page(){return <Suspense><Content/></Suspense>;}
