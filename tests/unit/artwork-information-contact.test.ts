import {it,expect} from 'vitest';
import {createElement} from 'react';
import {jsx} from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {ArtworkInformation,ArtworkInquiryLink} from '../../components/artworks/ArtworkInformation';
import {SiteContentProvider} from '../../components/SiteContentProvider';
import {initialMessages} from '../../lib/i18n/messages.generated';
import {mobileGalleryContent} from '../../.storybook/gallery-mobile-fixtures';
it('keeps the default identity/contact, supports shared composition and disables preview inquiry',()=>{
 const content=mobileGalleryContent();
 const normal=renderToStaticMarkup(createElement(ArtworkInformation,{content}));expect(normal.match(/<h1/g)).toHaveLength(1);expect(normal.match(/href="\/contact\?artwork=/g)).toHaveLength(1);
 const split=renderToStaticMarkup(createElement(ArtworkInformation,{content,showIdentity:false,showContact:false}));expect(split).not.toContain('<h1');expect(split).not.toContain('href="/contact');expect(split).toContain(content.description);
 const preview=renderToStaticMarkup(jsx(SiteContentProvider,{scope:'preview',locale:'en',defaultLocale:'fr',messages:initialMessages('en'),children:createElement(ArtworkInquiryLink,{id:content.artwork.id,locale:'en'})}));expect(preview).toContain('aria-disabled="true"');expect(preview).toContain('/preview/render/en/contact?artwork='+content.artwork.id);
});
