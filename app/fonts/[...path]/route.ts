/** Existing public files are served before dynamic routes. Unknown font paths
 * must end here instead of entering a page renderer with unsanitized headers. */
export function GET(){return new Response(null,{status:404,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'}});}
export const HEAD=GET;
