/** Shared elevation for light controls; uses the active client's text color. */
export const lightControlShadow="0 2px 10px color-mix(in srgb,var(--site-color-text) 12%,transparent)";
export const lightControlElevation={
 boxShadow:"var(--site-control-shadow-light)",
 transition:"box-shadow 360ms ease,background-color 360ms ease,color 360ms ease",
 "&:disabled,&.Mui-disabled":{boxShadow:"none"},
 "@media(prefers-reduced-motion:reduce)":{transition:"none"},
} as const;
