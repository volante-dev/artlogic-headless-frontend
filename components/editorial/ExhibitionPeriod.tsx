import{formatExhibitionPeriod}from"../../lib/editorial/exhibition-period";
export function ExhibitionPeriod({value,locale,className}:{value:{startsOn:string|null;endsOn:string|null};locale:string;className?:string}){
 const {startsOn,endsOn}=value;if(!startsOn||!endsOn)return null;
 return <p className={className} data-exhibition-period><time dateTime={startsOn}>{formatExhibitionPeriod({startsOn,endsOn:startsOn},locale)}</time>{startsOn!==endsOn&&<> – <time dateTime={endsOn}>{formatExhibitionPeriod({startsOn:endsOn,endsOn},locale)}</time></>}</p>;
}
