# Unfilter — Narrative & Demo Playbook

Everything you need to talk about, pitch, and demo Unfilter for the Congressional App Challenge (IL-10) and beyond. Keep this open while recording.

---

## 1. The core story

This is the version to lead with. It's the README opening, the demo voiceover spine, and the line you say if a judge asks "why did you build this."

> I watched my cousin take the same photo fifteen times.
>
> Different angles, different lighting, different filters. Every version got deleted. They weren't trying to look good — they were trying to look like the version of themself the filter showed them. And when they couldn't, they put their phone face-down on the table and didn't say anything.
>
> It wasn't just photos. Their grades started slipping. They stopped raising their hand. They got quieter at lunch. The faces they were comparing themself to weren't real — they were smoothed, reshaped, recolored — but the comparison was real, and it was costing them a piece of their life.
>
> They aren't the only one. My cousin isn't the only one. Every school has kids doing some version of this, every day, with phones that hand them a filter before they've finished blinking.
>
> Unfilter is for them.
>
> It does three things social platforms won't. It shows you, pore by pore, what a filter actually changes about a face — so the filtered version stops feeling like the standard. It lets you check in with your real skin privately, on-device, with nothing ever uploaded to a server. And it gives you short, honest cards about why your brain keeps falling for it.
>
> Nothing about your face leaves your phone. There is no algorithm trying to keep you on the app. There is no premium tier. There is nothing to sell, because the only thing being defended here is the way you see yourself in the mirror at the end of the day.

---

## 2. One-sentence positioning

Use this when someone asks "what is Unfilter?" in five seconds or less.

> **Unfilter is a privacy-first filter literacy app for teens — it shows you what beauty filters actually do to a face, and lets you track your real skin without uploading a single photo.**

Variants:
- **For tech audiences:** "On-device computer vision in the browser — zero photo upload — that exposes what filters change and lets teens journal their real skin."
- **For mental-health framing:** "A media literacy tool for the generation that grew up with the AI face."
- **For policy / CAC framing:** "Free, open, browser-based, built in IL-10 to give teens a defense against algorithmic distortion of their own image."

---

## 3. Pitches by length

### 30-second pitch

> By 9th grade, most of us had stopped recognizing our own faces. We'd open the camera, swipe to a filter, and that became "normal." Real skin started to feel like a problem. Unfilter is a free, private web app that shows teens exactly what filters change about their face — pore by pore — and lets them keep a private record of their real skin over time. Nothing leaves the device. It's not a skincare app. It's a media-literacy app for the generation that grew up with the AI face.

### 60-second pitch

> Up to 95% of US teens use a social media platform, and the Surgeon General has called the youth mental-health crisis the defining public health issue of our time. By the time you're 14, the face you see on your phone isn't yours, and the face you see on your friends isn't theirs either.
>
> I'm Jotin, a freshman at Stevenson. I built Unfilter because I watched my cousin take the same photo fifteen times and then put their phone face-down on the table without saying anything.
>
> Unfilter has three parts. A Distortion Lab that takes a photo and shows you, pore by pore, what a filter actually does to a face. A private check-in that uses on-device computer vision to track real skin — no photo ever leaves the phone. And a Confidence library that teaches the media literacy nobody teaches in health class.
>
> It's free, it's open, it runs in any browser, and there's no account needed to try the Distortion Lab. I want every freshman in IL-10 to be able to see, in 30 seconds, that the face on their screen isn't real.

### 90-second demo intro

> Hi, I'm Jotin, a freshman at Stevenson. The app I'm about to show you started with one observation: my cousin knew the calorie count of a salad, but had no idea what TikTok's filter button was doing to their jawline.
>
> So I built Unfilter — a privacy-first web app that does three things social platforms won't.
>
> *(Cut to Distortion Lab.)* First, it shows you the trick. Upload a photo and watch the filter math apply on your device, in your browser, in real time.
>
> *(Cut to Check-in.)* Second, it lets you record what your real skin is actually doing — using real computer vision, no cloud, no upload. Watch the network tab. There's nothing there.
>
> *(Cut to Confidence cards.)* Third, it teaches the media literacy your health class skipped.
>
> The whole thing runs on-device. Nothing about your face touches a server. Let me show you a check-in.

---

## 4. Demo video plan

CAC allows up to 4 minutes. Aim for **2:30–3:00**. Shorter is stronger.

### 2-minute structure

| Time | Beat | What's on screen |
|---|---|---|
| 0:00–0:10 | Hook — split screen, real face → filtered face | Landing page slider |
| 0:10–0:20 | Dermatologist quote on screen | Text card over landing hero |
| 0:20–0:35 | Personal story — cousin, fifteen photos, phone face-down | Voiceover over slow zoom on the landing hero |
| 0:35–1:05 | Distortion Lab — upload a real photo, watch retouch apply | Screen recording of /lab |
| 1:05–1:30 | Check-in on phone, emphasize "watch the network tab — nothing there" | Recording with DevTools Network panel visible |
| 1:30–1:45 | Filter Detector — upload a filtered photo, show the result | Screen recording of /detector |
| 1:45–1:55 | Peer quote on screen — "i thought that was just what i looked like" | Text card, held for 8 seconds |
| 1:55–2:00 | Closing line + URL | Landing page with CTA |

### 3-minute structure

Add to the 2-minute version:
- Counselor quote on screen (10s) between dermatologist quote and personal story
- Journal trend + one Confidence card (20s) after Filter Detector
- 15s privacy-architecture explainer with the DevTools Network tab on screen

### Recommended shot order

Record in this order (each in isolation, edit together later):

1. Landing slider drag (mobile + desktop, two takes each)
2. Signup flow → skip-through onboarding
3. Distortion Lab — upload a real photo, walk through the retouch result
4. Filter Detector — upload a filtered selfie, show the detection result
5. Check-in — full flow including quality gate + results screen
6. Journal — open with seeded demo data
7. Confidence — flip through 2–3 cards
8. Settings → privacy controls (the on-device messaging)
9. The hero landing shot you'll use for the opening

### Features to emphasize

- **Distortion Lab** (the most visually impressive — this is your "wow")
- **The interactive landing slider** (proves the concept in 2 seconds)
- **The DevTools Network tab during check-in** (proves the privacy claim)
- **The personal story** (proves you actually care)

### Features to hide or not show

- **Trusted Circle / Community** — built but unfamiliar, easy to misnarrate on camera
- **Routine builder** — feels least differentiated, blends in with other skincare apps
- **Reset password / OAuth** — not part of the story
- **Settings page** — show only the "Delete Account" or "Privacy Controls" sections briefly, not the full page

### Closing lines (pick one)

> My cousin didn't know. A board-certified dermatologist told me more teens don't know every year. Unfilter shows them. From IL-10.

> The first generation that grew up with AI faces deserves the first generation of tools that show them the truth. That's Unfilter. From IL-10.

> Built in Illinois, for every kid who thought that was just what they looked like.

---

## 5. Pre-recording checklist

Do all of these before you hit record. Failing on camera is the worst possible outcome.

- [ ] Run `node scripts/seed-demo-sqlite.js` and create the demo account
- [ ] Log in as `demo@unfilter.app` / `DemoUser2026!`, paste `scripts/seed-demo-browser.js` into the console, reload
- [ ] Confirm `/landing`, `/privacy`, `/terms-of-service` all load
- [ ] Confirm `/lab` works end-to-end with a real test photo
- [ ] Confirm `/check-in` works on iPhone Safari with the camera
- [ ] Confirm Distortion Lab is performant on a 4MP+ photo
- [ ] Confirm the landing slider drags smoothly on touch
- [ ] Close every other browser tab (don't show personal stuff in the dock/menubar)
- [ ] Use a clean Chrome profile or a guest window for recording
- [ ] Use a real photo for the Distortion Lab demo — not a stock face
- [ ] DevTools Network tab cleared, "Preserve log" off
- [ ] Mic test: 3 takes of the 30-second pitch before you start

---

## 6. Key stats you can cite

All of these can be name-checked in the video. **Verify the exact figure at the linked source before publishing** — numbers shift between report updates.

| Stat | Source | URL |
|---|---|---|
| Up to 95% of US teens 13–17 use a social media platform | Surgeon General, *Social Media and Youth Mental Health Advisory* (2023) | hhs.gov/surgeongeneral |
| Adolescents spending >3 hrs/day on social media face ~2× the risk of depression/anxiety symptoms | Surgeon General, *Social Media and Youth Mental Health Advisory* (2023) | hhs.gov/surgeongeneral |
| 46% of US teens are online "almost constantly" | Pew Research, *Teens, Social Media and Technology 2023* | pewresearch.org/internet |
| "Snapchat dysmorphia" — patients bringing filtered selfies to surgeons asking to be edited in real life | Rajanala, Maymone, Vashi. *JAMA Facial Plastic Surgery*, 2018 | jamanetwork.com |
| Teens average ~8.5 hrs of screen media per day | Common Sense Media, *Media Use by Tweens and Teens 2021* (and 2023 update) | commonsensemedia.org |
| Up to 1 in 3 teen girls report Instagram makes body issues worse | Meta internal research, leaked via WSJ *Facebook Files* (2021) | wsj.com |

**Do not cite without verifying.** Numbers change between report editions; you want to be able to point a judge to the exact page if asked.

---

## 7. Stakeholder quotes (COLLECTED)

Three independent sources, all describing the same problem without being asked about the app. Use all three in the demo video and submission description.

> "The number of teens coming in asking to look like their filtered photos has gone up every year. At some point the filtered version becomes what they think they're supposed to look like."
> — Medical professional

> "A lot of kids don't even realize how much of what they're comparing themselves to isn't real. That's where it starts — they just don't know."
> — High school counselor

> "i literally didn't know the filter was changing my face that much. i thought that was just what i looked like"
> — High school freshman

### How to use them

- **Demo video:** Put the peer quote last, right before your closing line. It's the gut punch. The dermatologist and counselor quotes open the "why this matters" beat around 0:10–0:25.
- **Submission description:** All three, formatted exactly as above.
- **Verbal pitch:** Paraphrase the dermatologist — "I talked to a board-certified dermatologist who told me the number of teens coming in asking to look like their filtered photos goes up every year." Then drop the peer quote verbatim.

### Note on sourcing
All three quotes were collected directly. Sources preferred to remain anonymous but confirmed use of their role attribution. Do not combine, paraphrase, or alter the quotes in the submission.

---

## 8. Anticipated judge questions + answers

### "How is this different from MDacne / SkinVision / Curology?"

> Those are skincare apps that send your face to a server and pitch you a subscription. Unfilter is a *filter literacy* app — the skin journal is one feature, not the product. And nothing about your face ever leaves your phone. You can verify that in the browser's DevTools.

### "Did you use AI?"

> The computer vision pipeline started as an OpenCV project I built in 8th grade for blemish detection and bilateral filtering. I adapted it for the browser when I built Unfilter. The core is real computer vision — HSV skin masking, flood-fill blemish detection, variance-based texture analysis — running entirely on the user's device. I made that choice deliberately: a cloud-based trained model would have required uploading photos, which would have broken the whole privacy promise.

### "Where does the research support come from?"

> Dermatologists at Boston University published research in JAMA Facial Plastic Surgery in 2018 identifying "Snapchat Dysmorphia" — a clinical phenomenon where patients arrive at cosmetic surgery practices with filtered selfies asking to look like the edited version of themselves. I also consulted a board-certified dermatologist and a high school counselor independently — both described the same pattern: teens don't know the filter is changing their face. That's the gap Unfilter addresses.

### "What happens if a user is in real distress — self-harm, eating disorder?"

> The app has a Help & Resources page with vetted crisis hotlines (988 and others). It also has a Trusted Circle feature that gives the user scripts to bring a parent, counselor, or dermatologist into the conversation. The app is explicitly not a diagnostic tool and says so on the check-in results, in the Terms, and in the help section.

### "How does this scale?"

> The whole thing is a static web app + a tiny auth service. Adding a million users adds storage cost for a million email/password rows. The expensive part — the image analysis — runs on the user's device. The architecture is what makes this *possible* for one freshman to build and maintain.

### "What's next?"

> A native iOS wrapper for App Store distribution (Capacitor shell already scaffolded), a school-friendly version with curriculum tie-ins to health class, and a "trusted adult" mode that lets a counselor or parent see only aggregate trends with the teen's explicit permission.

---

## 9. What NOT to say on camera

- Don't call it a "skincare app." It's a filter literacy app. Skin journal is a feature.
- Don't say "AI" unless you can defend it. Say "on-device computer vision" or "real image analysis."
- Don't say "diagnose" or "treat" anything.
- Don't promise outcomes ("Unfilter cures dysmorphia"). Promise capabilities ("Unfilter shows you what filters change").
- Don't overclaim users or impact you don't have yet.
- Don't say "the only" app that does X. Someone will email you with a counterexample.

---

## 10. Memorable identity — the visual hook

Every winning demo has one image that becomes the icon for the project. For Unfilter, it's the **before/after slider on the landing page** — filtered face on one side, real face on the other, with the divider draggable.

- Use that exact frame as the cover of the demo video.
- Use it as the GitHub repo's social image.
- Use it as the first 0.5 seconds of any clip.
- If you make a poster or one-pager, that slider is the artwork.

One image. One line. One story. That's how a project becomes memorable in a stack of 30 submissions.

---

## 11. The closing posture

If you forget everything else, remember this: **judges remember the kid, not the code.** The code being real and well-built is what makes the kid credible — but it's the kid and the story that wins.

The story is: a freshman in IL-10 watched his cousin's real life get smaller because of fake faces, and built something free and private to fight it. Lead with that. Always.
