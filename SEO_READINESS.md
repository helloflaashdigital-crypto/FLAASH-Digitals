# Google Search Console and SEO handoff

Production website: https://www.flaashdigital.com/
Domain property for Search Console: flaashdigital.com
Audit date: 2026-09-15

## Project and deployment

The frontend is React + Vite with React Router, React Helmet Async 3 / React 19, and an Express/MongoDB API on Render. It is not Next.js. Vercel still builds the client directory with npm run build and publishes dist. Hostinger manages the domain DNS. The apex domain redirects to www; HTTPS is publicly accessible.

The UI, business copy, forms, admin functions and hosting providers are preserved. Metadata is present in generated HTML before JavaScript runs. Main page content remains rendered by the existing React application, so check rendered HTML in Google's live URL test.

## Public routes

Indexable and included in the sitemap (19 URLs):
- /
- /about
- /services
- /services/social-media-marketing
- /services/meta-ads
- /services/google-ads
- /services/seo
- /services/branding
- /services/web-development
- /services/video-marketing
- /services/lead-generation
- /work
- /work/indian-cricket-academy
- /work/eace
- /work/the-trading-hustlers
- /work/tws-the-work-suites
- /contact
- /results
- /results/abc

Existing public routes deliberately excluded:
- /privacy-policy and /terms: existing placeholder text awaits approved business/legal copy. No copy was invented or removed.

Dynamic CMS routes:
- /services/:slug
- /work/:slug
- /results/:slug

Published CMS details are collected during each normal build and receive route-specific static HTML metadata and sitemap entries. New pages can load through SPA routing before the next build, with metadata updated from the API. Run a normal build and redeploy after publishing, removing, renaming or changing indexable CMS content so static metadata and the sitemap stay current. Built-in service and portfolio fallbacks remain public because the original UI still renders them.

Private/non-indexable routes:
- /admin and /admin/login
- /admin/services, /admin/projects, /admin/case-studies, /admin/testimonials, /admin/clients, /admin/team
- /admin/leads, /admin/visitors, /admin/media, /admin/settings, /admin/account
- Admin creation/edit routes /admin/:type/new and /admin/:type/:id/edit
- /404, unknown pages and missing CMS detail pages

## Every created or modified file

| File | Change |
|---|---|
| client/.env.example | Documents the actual production website URL. |
| client/index.html | Marks fallback metadata so React can replace it without duplicates. |
| client/package.json | Adds SEO sync, test and verification commands; sync runs before build. |
| client/public/robots.txt | Allows public crawling, disallows admin crawling, references the custom-domain sitemap. |
| client/public/sitemap.xml | Generated HTTPS sitemap with all 17 indexable public routes and real CMS update dates where available. |
| client/scripts/sync-seo.mjs | Reads only published public CMS data, validates route completeness, and regenerates the route snapshot, sitemap and robots file. |
| client/scripts/seo.test.mjs | Tests unique metadata, canonical URLs, sitemap exclusions, escaping, schema, dynamic routes and Vercel rules. |
| client/scripts/verify-seo.mjs | Audits built files or the deployed website, including HTTP status and private-page headers in live mode. |
| client/src/App.jsx | Assigns one metadata owner per route, including private routes. |
| client/src/pages/Home.jsx | Adds a useful fallback if a portfolio image's name is missing. |
| client/src/pages/PublicPages.jsx | Updates CMS detail SEO, waits for API responses before showing 404, provides retry on transient errors, and removes nested main landmarks. |
| client/src/seo/RouteSeo.jsx | Handles unique browser metadata and React 19's handoff from static tags; adds image accessibility metadata. |
| client/src/seo/seoConfig.js | Central production origin, page metadata, CMS metadata mapping and existing Organization/WebSite/Service/Breadcrumb schema. |
| client/src/seo/publishedContent.json | Public, sanitized snapshot of the published CMS routes used for static metadata; contains no visitor/admin data or credentials. |
| client/src/seo/seoDocuments.js | Shared, safely escaped HTML metadata, XML sitemap and robots generation. |
| client/src/seo/usePublicContent.js | Separates loading, real 404 and transient API failure for detail pages. |
| client/src/styles/global.css | Preserves detail-page styling after replacing nested main elements with divs. |
| client/src/styles/professional.css | Same selector-only landmark correction. |
| client/src/styles/refinements.css | Same selector-only landmark correction. |
| client/vercel.json | Preserves Vite/clean URLs/admin headers; restricts SPA fallbacks to admin and CMS detail routes so unknown routes return a real 404. |
| client/vite.config.js | Generates per-route metadata, a neutral CMS/admin shell and the existing React 404 page. |
| server/src/app.js | Adds the verified custom-domain origins to CORS; preserves other configured origins and authentication. |
| server/scripts/test-seo-cors.mjs | Verifies both custom domains, the existing Vercel origin, preflight and rejection of unrelated origins. |
| README.md | Corrects old Netlify instructions and links to this SEO guide. |
| SEO_READINESS.md | This route inventory, implementation report, tests and Search Console instructions. |

## Local tests (PowerShell)

From the existing workspace:

~~~powershell
Set-Location E:\FLASH\client
npm ci
npm run test:seo
npm run build
npm run seo:verify
npm run preview -- --host localhost --port 5173
~~~

Open http://localhost:5173/ and direct URLs such as /services/seo and /work/eace. Stop preview with Ctrl+C.

The build sync reads the publicly accessible Render CMS API. If that API is temporarily unavailable, normal builds fail with a clear error rather than publishing an incomplete sitemap. For an explicitly offline test using the saved route snapshot:

~~~powershell
$env:SEO_OFFLINE = '1'
npm run build
Remove-Item Env:SEO_OFFLINE
~~~

An offline build will not discover newly published CMS routes. SEO_API_URL can override the public CMS endpoint if the API host changes. SITE_URL in seoConfig.js is the single source of truth for the canonical origin; an old VITE_SITE_URL environment value will not override it.

Backend checks use isolated test data and do not connect to the live database:

~~~powershell
Set-Location E:\FLASH\server
npm ci
node --test scripts/test-seo-cors.mjs scripts/test-visitor-features.mjs
~~~

Vite preview is for local application checks. The live verification command also checks Vercel's HTTP routing behavior, which Vite preview does not emulate exactly.

## Production verification

Open:
- https://www.flaashdigital.com/sitemap.xml
- https://www.flaashdigital.com/robots.txt

The sitemap must return HTTP 200 and XML, contain only HTTPS www.flaashdigital.com URLs, and exclude admin, error and unfinished pages. Robots must allow / and reference the exact sitemap URL above.

~~~powershell
Set-Location E:\FLASH\client
npm run seo:verify -- --url https://www.flaashdigital.com
curl.exe -I https://www.flaashdigital.com/sitemap.xml
curl.exe -I https://www.flaashdigital.com/robots.txt
curl.exe -I https://www.flaashdigital.com/services/seo
curl.exe -I https://www.flaashdigital.com/admin/login
curl.exe -I https://www.flaashdigital.com/seo-audit-missing-page
~~~

Expected: public pages and crawl files 200; admin login 200 with X-Robots-Tag: noindex; unknown page 404. Missing CMS detail routes receive the neutral SPA shell, then React adds noindex after the API confirms 404, as recommended for JavaScript applications.

Check that API responses allow Origin: https://www.flaashdigital.com. Render must deploy the backend CORS change as well as Vercel deploying the frontend. This fixes an existing issue where the new custom domain could not load CMS content or submit forms.

## Google Search Console: exact next steps

1. Open https://search.google.com/search-console/ and sign in with the Google account that should own the site.
2. Open the property selector and choose Add property.
3. Choose Domain. Enter flaashdigital.com (no https:// and no www), then Continue. This covers the root domain, www, and both protocols.
4. Copy the complete DNS TXT verification value Google provides. Use Google's actual token; there is no token stored or invented in this repository.
5. In Hostinger, open Domains > flaashdigital.com > DNS / Nameservers. Add a new TXT record with Name @, Content equal to the copied Google token, and TTL 300. Keep the existing Vercel A/CNAME and all email records.
6. Save the TXT record. Return to Search Console and click Verify. If it is not detected yet, wait for DNS propagation and retry. Keep the TXT record after verification.
7. Select the verified domain property. Open Sitemaps. Submit https://www.flaashdigital.com/sitemap.xml. Check the processing status and investigate any fetch/parsing error.
8. In the top URL Inspection field, enter https://www.flaashdigital.com/. Review the indexed status separately from the live test.
9. Click Test live URL. In the tested-page details, review rendered HTML/screenshot and confirm the heading/content loaded, crawling is allowed, the page is indexable, and the canonical points to the HTTPS www address.
10. If the live test passes, choose Request indexing. Repeat for /about, /services, /contact and a few priority service/project pages. Use the sitemap for the full set; repeatedly requesting the same URL does not speed indexing.
11. Monitor the Page indexing report and the submitted sitemap. Expected exclusions include private routes and intentionally unfinished pages. Investigate unexpected noindex, soft 404, blocked resources or alternate-canonical results.

Official references:
- Domain verification: https://support.google.com/webmasters/answer/9008080
- Sitemaps report: https://support.google.com/webmasters/answer/7451001
- URL Inspection and indexing requests: https://support.google.com/webmasters/answer/9012289
- JavaScript SEO, canonical tags and SPA errors: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

## Remaining content limitations and indexing status

The project pages are publicly available and technically indexable, but their narratives still contain brief/fallback business copy. Approved project challenges, work performed and outcomes would make them more useful; none were fabricated in this task. Results remain empty, and legal pages remain placeholders.

Publishing new content requires rebuilding/redeploying to refresh static metadata and the sitemap. React still renders page bodies with JavaScript; the live Search Console inspection should confirm that Google can render them. Existing site design and visitor-popup behavior were retained.

Passing these checks, deploying, submitting a sitemap or requesting indexing does not prove that Google indexed any page. Indexing and ranking are Google's decisions. Confirm actual indexed status only in the verified Search Console property; no indexing claim is made here.

## Case-study publication update

The published case study ABC at /results/abc enables indexing of /results after a normal build. Both URLs are now in the sitemap. Its current title and challenge (ABC and BNM) appear to be placeholders; replace them with real approved case-study content before requesting indexing. Short CMS summaries now use a descriptive metadata fallback without inventing business outcomes.
