# Asset housekeeping: `public/images/temp/` and `public/CHDPAS.jpg`

Status: **recommendation only. Nothing was deleted, moved, renamed, compressed or overwritten.** Class hero images, teacher photos and the selected Private Lessons photograph were not touched.

## What they are

| Item | Size | Referenced by the site? | What it looks like |
| --- | --- | --- | --- |
| `public/images/temp/` (42 files) | about 38 MB | **No** (no source, content or script reference) | Raw source material: numbered camera files (`5574.jpg` …), `WhatsApp Image 2026-08-11 …` photos, and Vimeo stills (`VS--Vimeo-DanceMeetsArtsBTS-…`, `VS--Vimeo-MemoryofChina-…`). |
| `public/CHDPAS.jpg` | 1.4 MB | **No** | Not used by any page, content file or script. Looks like a logo master or reference image; nobody has confirmed what it is. |

Four of the temp files are byte-identical to files that **are** used: `5574.jpg` → `classes/yoga/yoga-class.jpg`, `5648.jpg` → `classes/tango/argentine-tango-class.jpg`, `6156.jpg` and `6246.jpg` → the two Chinese Dance images (`docs/classes-pages-implementation.md`). The other 38 files are not referenced anywhere. Whether they are wanted for future use is a decision only you can make.

## Why it matters

Everything under `public/` is **served publicly** at its own address and is part of every deployment. Unreferenced originals are therefore downloadable by anyone who guesses or finds the path, at full size, and they add roughly 40 MB to every build and upload. Several are unedited phone photos (WhatsApp) and video stills, which may carry people who have not agreed to publication.

## Recommendation (needs your approval; none of it is done)

1. **Keep the files, but not inside `public/`.** Treat them as source material: move them (when you approve) to a folder outside the deployed tree, for example `assets-source/` at the project root, and decide separately whether that folder lives in Git.
2. **Do not commit `public/images/temp/` as it is.** Either exclude it (`.gitignore`) while it stays local, or move it to `assets-source/` and keep it out of Git too if the originals are large or personal. Git history keeps every committed copy forever, so the safe default is to commit only what the site uses.
3. **Retain the four used copies** under `public/images/classes/…` (already in use). The four temp duplicates can be removed later once the originals are safely stored elsewhere.
4. **`public/CHDPAS.jpg`:** confirm what it is. If it is a logo master, keep it with the other source assets and not in `public/`. If it is unused, it can go. Existing logos (`public/CHDPAS-*.png`, `header-logo*.png`) are separate and are used.
5. Before anything is published, **check consent** for any photograph of identifiable people that is intended for the website.

## If you approve

A one-time, reversible step: create `assets-source/`, move the 42 files and `CHDPAS.jpg` there, add the folder to `.gitignore`, rebuild and confirm no page changes (the crawl in the audit found no references, so none should). I will not do this without your go-ahead.
