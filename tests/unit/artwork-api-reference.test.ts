import {it,expect} from "vitest";
import {artworkApiReference} from "../../lib/artworks/artwork-api-reference";
it("uses the existing UUID endpoint for a long valid public slug, preserving the public URL elsewhere",()=>{const id="00000000-0000-4000-8000-000000007383",slug="a".repeat(80)+"-"+id.replaceAll("-","");expect(slug.length).toBe(113);expect(artworkApiReference(slug)).toBe(id);});
it("does not invent UUIDs for short references or malformed suffixes",()=>{for(const value of ["test-00000000000040008000000000007383","00000000-0000-4000-8000-000000007383","a".repeat(101),"a".repeat(80)+"-"+"z".repeat(32)])expect(artworkApiReference(value)).toBe(value);});
