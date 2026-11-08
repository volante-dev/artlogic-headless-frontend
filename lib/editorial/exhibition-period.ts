export function formatExhibitionPeriod(period:{startsOn:string|null;endsOn:string|null},locale:string):string{
 if(!period.startsOn||!period.endsOn)return "";
 const format=(value:string)=>{const day=new Date(value+"T00:00:00.000Z");return Number.isFinite(day.getTime())?new Intl.DateTimeFormat(locale,{dateStyle:"long",timeZone:"UTC"}).format(day):"";};
 const start=format(period.startsOn),end=format(period.endsOn);return start&&end?start+(period.startsOn===period.endsOn?"":" – "+end):"";
}
