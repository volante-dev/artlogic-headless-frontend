import {describe,expect,it} from "vitest";
import {sectionDefinitions} from "../../page-composer/definitions";
import {catalogEntries,sectionFixture} from "../../.storybook/section-fixtures";

describe("standalone component catalogue",()=>{
  it("covers every registered variant plus long and absent data in both languages",()=>{
    for(const definition of sectionDefinitions){
      for(const variant of definition.variants)expect(catalogEntries).toContainEqual({type:definition.type,variant,state:"normal"});
      for(const state of ["long","empty"])expect(catalogEntries.some(entry=>entry.type===definition.type&&entry.state===state)).toBe(true);
    }
    for(const entry of catalogEntries)for(const locale of ["fr","en"]){
      const fixture=sectionFixture(entry.type,entry.variant,entry.state,locale);
      expect(fixture.section.type).toBe(entry.type);
      expect(fixture.section.schemaVersion).toBe(1);
      expect(JSON.stringify(fixture)).not.toMatch(/https?:\/\//);
    }
  });
  it("declares poster and film failures and reduced motion",()=>{
    for(const state of ["posterError","videoError","reducedMotion"])expect(catalogEntries.some(entry=>entry.type==="heroMedia"&&entry.state===state)).toBe(true);
  });
});
