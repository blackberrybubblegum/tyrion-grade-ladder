# Grade Ladder by Tyrion Papers

A GCSE grade boundary calculator. The whole site is one file, `index.html`, which reads live from the Supabase project **GradeGauge**. There is no build step and no server to run.

## Files

- `index.html` — the site. Connection settings are in the `CONFIG` block near the top of the script; brand colours are in the `THEME` block at the top of the CSS.
- `apps-script/Code.gs` — receives the "Report an issue" form and writes each report to a Google Sheet.
- `supabase/schema.sql` — the database structure, what was changed, and one optional hardening step.

## How it connects

The page calls Supabase's REST API directly with the project's publishable key. That key is safe in public code: row-level security only allows reading `grade_boundaries`, so nobody can change data with it.

Requests the page makes:

1. `gb_series` view — the list of boards, qualifications and series (fills the filters).
2. `grade_boundaries` for one board and series — the subjects and papers for that series.
3. `grade_boundaries` for one subject, tier and paper across every series — the trend chart and "same mark in other years".

## Setup

1. **Form:** follow the steps at the top of `apps-script/Code.gs`, then paste the web app URL into `FORM_ENDPOINT` in `index.html`.
2. **Colours:** replace the placeholder values in the `THEME` block with Tyrion Papers' brand colours. The grade gauge reads from the same variables.
3. **Deploy:** host `index.html` anywhere static (GitHub Pages, Netlify, or your own server). On WordPress, either embed it in an iframe or paste it into a Custom HTML block; some WordPress setups strip `<script>` tags from blocks, in which case use the iframe.

## Keeping Supabase awake

Free Supabase projects pause after about a week without traffic, and the page will show "Couldn't reach the grade boundary database" until it's restored. Once the site is live, normal visits keep it awake. Upgrading the project to a paid plan removes pausing entirely.

## Adding data

Insert rows into `grade_boundaries` with the same columns (see `schema.sql`). New boards, qualifications (such as A-level) and grading scales appear automatically; the gauge colours adapt to however many grades a paper has.
