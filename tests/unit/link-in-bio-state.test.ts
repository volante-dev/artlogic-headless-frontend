import {it,expect} from 'vitest';
import {createLinkInBioFeedState} from '../../lib/link-in-bio/feed-state';
import {fixtureFeed} from '../fixtures/link-in-bio';
it('appends without duplicates and refuses a changed release before mutating the grid',()=>{const state=createLinkInBioFeedState(fixtureFeed());state.append(fixtureFeed(12));expect(state.read().feed.items).toHaveLength(24);expect(()=>state.append({...fixtureFeed(24),releaseId:'00000000-0000-4000-8000-000000009999'})).toThrow('feed_changed');expect(state.read().feed.items).toHaveLength(24);});
it('suspends only on a confirmed source state and leaves existing content on failure',()=>{const state=createLinkInBioFeedState(fixtureFeed());state.failure('network');expect(state.read().feed.items).toHaveLength(12);state.append({...fixtureFeed(),sourceState:'suspended',items:[],nextCursor:null});expect(state.read().feed.items).toHaveLength(0);});
