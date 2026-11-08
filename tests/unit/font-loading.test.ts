import {it,expect} from 'vitest';
import {builtinFonts,builtinFontUrl,orderedBuiltinFaces} from '../../branding/font-catalog';
import {fontFaces,criticalBuiltinFontUrls} from '../../branding/font-faces';
import projection from '../../clients/default/projection.json';
import type {PresentationTheme} from '../../lib/presentation/types';
it('prefers common Latin for overlapping glyphs and versions both CSS and preloads',()=>{
 const theme=projection as PresentationTheme,css=fontFaces(theme,[]),urls=criticalBuiltinFontUrls(theme);
 expect(urls.length).toBeGreaterThan(0);expect(urls.length).toBeLessThanOrEqual(2);
 for(const url of urls){expect(url).toMatch(/^\/fonts\/.*-latin-.*\.woff2\?v=[a-f0-9]{16}$/);expect(css).toContain(url);}
 for(const font of builtinFonts){const ordered=orderedBuiltinFaces(font.faces.filter(f=>f.weight===500&&f.style==='normal')),extended=ordered.find(f=>f.path.includes('-latin-ext-')),latin=ordered.find(f=>f.path.includes('-latin-')&&!f.path.includes('-latin-ext-'));
  if(extended&&latin){expect(ordered.indexOf(extended)).toBeLessThan(ordered.indexOf(latin));expect(builtinFontUrl(latin)).toContain(latin.sha256.slice(0,16));}
 }
});
