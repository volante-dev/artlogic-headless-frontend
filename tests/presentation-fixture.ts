import {fixture} from "./helpers";

/** Populated by backend test:public:browser in the isolated test/mock deployment. */
export interface PresentationFixture {
  heading:{fr:string;en:string};
  discoverLabel:{fr:string;en:string};
  background:string;
  assets:{poster:string;video:string;mobileVideo:string};
  privateMarkers:string[];
  deliveryStorageKeys:string[];
}
export function presentationFixture():PresentationFixture{
  const data=fixture() as ReturnType<typeof fixture>&{presentation?:PresentationFixture};
  if(!data.presentation)throw new Error("The isolated browser harness must seed presentation fixtures (003/T041)");
  return data.presentation;
}
