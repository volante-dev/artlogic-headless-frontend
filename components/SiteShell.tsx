import {loadHeaderRouteContext} from '@/lib/header/load-route-context';
import {loadConfig} from '@/lib/config/env';
import {HeaderNavigationProvider} from './header/HeaderNavigationProvider';
import {HeaderShell} from './header/HeaderShell';
export async function SiteShell({children,artwork}:{children:React.ReactNode;artwork?:React.ReactNode}){
 const initial=await loadHeaderRouteContext();
 return <HeaderNavigationProvider initial={initial}><HeaderShell artwork={artwork} immersiveEnabled={loadConfig().EDITORIAL_IMMERSIVE_RENDER_ENABLED!=='false'}>{children}</HeaderShell></HeaderNavigationProvider>;
}
