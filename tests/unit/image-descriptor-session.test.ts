import {it,expect,vi} from 'vitest';
import {ImageDescriptorSession} from '../../lib/media/image-descriptor-session';
import {physicalImageDescriptor} from '../../lib/media/public-image-descriptor';
const resource={resourceKind:'editorial' as const,resourceId:'00000000-0000-4000-8000-000000000001'},descriptor=physicalImageDescriptor(resource,{width:1200,height:800,mimeType:'image/webp'},'source.original')!;
it('shares metadata between background preparation and the displayed image within one article projection',async()=>{
 let finish!:(d:typeof descriptor)=>void;const requestDescriptor=vi.fn(()=>new Promise<typeof descriptor>(resolve=>{finish=resolve;})),session=new ImageDescriptorSession({requestDescriptor});
 const prefetch=session.requestDescriptor(resource),display=session.requestDescriptor(resource,true);expect(prefetch).toBe(display);expect(session.peek(resource)).toBeUndefined();finish(descriptor);await prefetch;expect(session.peek(resource)).toBe(descriptor);expect(await session.requestDescriptor(resource)).toBe(descriptor);expect(requestDescriptor).toHaveBeenCalledTimes(1);
});
it('does not retain unavailable results or reuse metadata in another article projection',async()=>{
 const requestDescriptor=vi.fn().mockResolvedValueOnce(undefined).mockResolvedValue(descriptor),parent={requestDescriptor},session=new ImageDescriptorSession(parent);expect(await session.requestDescriptor(resource)).toBeUndefined();expect(await session.requestDescriptor(resource)).toBe(descriptor);const fresh=new ImageDescriptorSession(parent);expect(fresh.peek(resource)).toBeUndefined();await fresh.requestDescriptor(resource);expect(requestDescriptor).toHaveBeenCalledTimes(3);
});
it('a failed request remains retryable',async()=>{
 const requestDescriptor=vi.fn().mockRejectedValueOnce(Error('offline')).mockResolvedValue(descriptor),session=new ImageDescriptorSession({requestDescriptor});await expect(session.requestDescriptor(resource)).rejects.toThrow('offline');expect(await session.requestDescriptor(resource)).toBe(descriptor);
});
