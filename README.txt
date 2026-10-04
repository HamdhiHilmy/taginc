TAG INC WEBSITE

Updated 4 October 2026.

This site is deployed on Vercel. Owner sign-in, adding/editing products,
photo uploads and Publish are powered by small serverless functions under
api/ plus Vercel KV (site data + the owner's password hash) and Vercel Blob
(uploaded photos). There is no dependency on claude.ai for any of this.

WHAT IS IN THIS FOLDER

index.html
  The public, read-only storefront: markup, styles and client-side script
  in one file. On load it fetches the latest published data from
  /api/state, falling back to the data embedded in this file if the API is
  unreachable. No owner controls appear here.

admin.html
  The owner's management page, at /admin. Sign in (or create the owner
  sign-in the first time), then add/edit/delete products, upload the logo
  and department photos, and Publish changes. Not linked from the public
  site; go to it directly.

images
  The logo (with and without the @), the name board PDF, and the photos
  originally used on the site. (Photos added through the owner tools after
  deployment are stored in Vercel Blob instead, not in this folder.)

api/
  Serverless functions: state.js (public read), publish.js and upload.js
  (owner-only, need a signed-in session), and auth/setup.js, auth/login.js,
  auth/logout.js, auth/session.js for the owner sign-in.

lib/
  Shared helpers used by the api/ functions: session.js (signs/verifies the
  owner's session cookie) and store.js (reads/writes Vercel KV).

ONE-TIME VERCEL SETUP

1. Project -> Storage -> create a KV database and a Blob store, and attach
   both to this project. Vercel adds the needed environment variables
   automatically.
2. Project -> Settings -> Environment Variables -> add SESSION_SECRET, a
   long random string (e.g. generate one with `openssl rand -hex 32`).
3. Redeploy once so the functions pick up the new environment variables.

After that, go to https://taginc.vercel.app/admin, create the owner
sign-in, and use that page to add products, upload photos and Publish.

PRODUCTS SAVED IN THIS COPY'S FALLBACK DATA

  Linen Shirt | Rs. 4,500 | Men | Shirt

Real edits made through the owner tools live in Vercel KV/Blob, not in this
file, so this folder will not reflect later changes on its own.
