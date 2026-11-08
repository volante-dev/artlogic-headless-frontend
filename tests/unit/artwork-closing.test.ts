import {it,expect,vi,afterEach} from 'vitest';
import {ArtworkOpening} from '../../components/artworks/artwork-opening';
function surface(){return {style:{opacity:'',willChange:'',backdropFilter:'',filter:''},dataset:{},inert:false,animate:vi.fn(()=>({cancel:vi.fn(),finish:vi.fn()}))} as unknown as HTMLElement;}
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
it('keeps the page blurred through the roll and waits for the reveal before closing',async()=>{
 vi.useFakeTimers();vi.stubGlobal('matchMedia',()=>({matches:false}));
 const opening=new ArtworkOpening(),paper=surface(),background=surface();opening.register('paper',paper);opening.register('background',background);
 const roll=opening.startClosing(),reveal=opening.revealOrigin();expect(opening.returning.phase).toBe('rolling');expect(background.style.filter).toBe('blur(8px)');
 await vi.advanceTimersByTimeAsync(499);expect(opening.isOpen).toBe(true);expect(opening.returning.phase).toBe('rolling');
 await vi.advanceTimersByTimeAsync(1);await expect(roll).resolves.toBe(true);expect(opening.returning.phase).toBe('revealing');
 await vi.advanceTimersByTimeAsync(599);expect(opening.isOpen).toBe(true);
 await vi.advanceTimersByTimeAsync(1);await expect(reveal).resolves.toBe(true);expect(opening.isOpen).toBe(false);expect(background.style.filter).toBe('');expect(paper.inert).toBe(false);
});
it('cancels an old close when another visit starts',async()=>{
 vi.useFakeTimers();vi.stubGlobal('matchMedia',()=>({matches:false}));const opening=new ArtworkOpening();opening.register('paper',surface());const roll=opening.startClosing();opening.begin();await expect(roll).resolves.toBe(false);await vi.advanceTimersByTimeAsync(2000);expect(opening.isOpen).toBe(true);expect(opening.returning.phase).toBe('idle');opening.close();
});
