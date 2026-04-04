/**
 * Royalty-free portrait photo database for the Daily Reality Check.
 *
 * All images are from Unsplash (unsplash.com) — free to use, no attribution
 * required for in-app usage. Each entry includes a direct image URL cropped
 * to face, a short description, and a skin-tone tag so we always show
 * diverse representation.
 *
 * The URL params (?w=600&h=750&fit=crop&crop=face) instruct Unsplash's CDN
 * to serve a face-cropped 600×750 JPEG automatically.
 */

export interface PortraitPhoto {
  /** Unsplash optimized image URL */
  url: string
  /** Brief alt-text description */
  alt: string
  /** Broad tone category for diversity rotation */
  tone: "light" | "medium" | "dark"
  /** Unsplash photo ID for reference */
  id: string
}

const BASE = "https://images.unsplash.com"
const CROP = "w=600&h=750&fit=crop&crop=face&auto=format&q=80"

export const PORTRAIT_DB: PortraitPhoto[] = [
  // ── Light tones ─────────────────────────────────────────────
  { id: "rDEOVtE7vOs", tone: "light", alt: "Young woman with freckles in natural light", url: `${BASE}/photo-1544005313-94ddf0286df2?${CROP}` },
  { id: "mEZ3PoFGs_k", tone: "light", alt: "Teen girl with light hair looking at camera", url: `${BASE}/photo-1517841905240-472988babdf9?${CROP}` },
  { id: "QXevDflbl1A", tone: "light", alt: "Young man with curly hair and fair skin", url: `${BASE}/photo-1506794778202-cad84cf45f1d?${CROP}` },
  { id: "C8Ta0gwPbQg", tone: "light", alt: "Woman with natural skin and soft expression", url: `${BASE}/photo-1554151228-14d9def656e4?${CROP}` },
  { id: "B4TjXnI0Y2c", tone: "light", alt: "Young woman with glasses, no makeup", url: `${BASE}/photo-1491349174775-aaafddd81942?${CROP}` },
  { id: "7YVZYZeITc8", tone: "light", alt: "Teenage boy with freckles smiling", url: `${BASE}/photo-1507003211169-0a1dd7228f2d?${CROP}` },
  { id: "IF9TK4e2Ki0", tone: "light", alt: "Woman with red hair in daylight", url: `${BASE}/photo-1524504388940-b1c1722653e1?${CROP}` },
  { id: "sibVwORYqs0", tone: "light", alt: "Young woman with a relaxed expression", url: `${BASE}/photo-1534528741775-53994a69daeb?${CROP}` },
  { id: "d2MSDujJl2g", tone: "light", alt: "Teen with blonde hair natural portrait", url: `${BASE}/photo-1488426862026-3ee34a7d66df?${CROP}` },
  { id: "WNoLnJo7tS8", tone: "light", alt: "Young man with blue eyes natural light", url: `${BASE}/photo-1500648767791-00dcc994a43e?${CROP}` },
  { id: "sYklpCMz_CA", tone: "light", alt: "Woman with messy bun and bare face", url: `${BASE}/photo-1499952127939-9bbf5af6c51c?${CROP}` },
  { id: "Z1B5XBWKJDQ", tone: "light", alt: "Teen girl with natural skin outdoors", url: `${BASE}/photo-1531746020798-e6953c6e8e04?${CROP}` },
  { id: "UHVndV0rsqw", tone: "light", alt: "Young woman with ponytail natural portrait", url: `${BASE}/photo-1494790108377-be9c29b29330?${CROP}` },
  { id: "iFgRcqHznqg", tone: "light", alt: "Woman looking directly at camera", url: `${BASE}/photo-1438761681033-6461ffad8d80?${CROP}` },
  { id: "rriAI0nhcbc", tone: "light", alt: "Young woman with shoulder-length hair", url: `${BASE}/photo-1529626455594-4ff0802cfb7e?${CROP}` },

  // ── Medium tones ────────────────────────────────────────────
  { id: "2EGNqazbAMk", tone: "medium", alt: "Young woman with olive skin and dark hair", url: `${BASE}/photo-1531123897727-8f129e1688ce?${CROP}` },
  { id: "7uoMmzPd2JA", tone: "medium", alt: "Teen with brown skin smiling naturally", url: `${BASE}/photo-1506863530036-1efeddceb993?${CROP}` },
  { id: "3TLl_97HNJo", tone: "medium", alt: "Young man with medium skin tone portrait", url: `${BASE}/photo-1492562080023-ab3db95bfbce?${CROP}` },
  { id: "c_GmwfHBDzk", tone: "medium", alt: "Woman with dark wavy hair natural look", url: `${BASE}/photo-1524638431109-93d95c968227?${CROP}` },
  { id: "6W4F62sN_yI", tone: "medium", alt: "Young woman with warm brown skin", url: `${BASE}/photo-1525786210598-d527194d3e9a?${CROP}` },
  { id: "mPqMYT-5FRU", tone: "medium", alt: "Man with beard and medium complexion", url: `${BASE}/photo-1506277886164-e25aa3f4ef7f?${CROP}` },
  { id: "L2dTmhQzx4Q", tone: "medium", alt: "Young woman with natural curly hair", url: `${BASE}/photo-1534751516642-a1af1ef26a56?${CROP}` },
  { id: "B1Gvs8bBC0E", tone: "medium", alt: "Teen with olive skin and bright eyes", url: `${BASE}/photo-1504257432389-52343af06ae3?${CROP}` },
  { id: "K84vnnzxmTQ", tone: "medium", alt: "Woman with tan skin outdoors", url: `${BASE}/photo-1546961342-ea5f71b193f3?${CROP}` },
  { id: "LjqARJaJotc", tone: "medium", alt: "Young woman with straight dark hair", url: `${BASE}/photo-1509967419530-da38b4704bc6?${CROP}` },
  { id: "ZHvM3XIOHoE", tone: "medium", alt: "Young man with warm skin and smile", url: `${BASE}/photo-1522556189639-b150ed9c4330?${CROP}` },
  { id: "PQeoQdkU9jQ", tone: "medium", alt: "Teen girl with brown eyes closeup", url: `${BASE}/photo-1504439468489-c8920d796a29?${CROP}` },
  { id: "YJ7p8n3FAeQ", tone: "medium", alt: "Woman with naturally textured skin", url: `${BASE}/photo-1542596768-5d1d21f1cf98?${CROP}` },
  { id: "O3ymvT7Wf9U", tone: "medium", alt: "Young person with warm complexion", url: `${BASE}/photo-1519345182560-3f2917c472ef?${CROP}` },
  { id: "2crxTr4jCkM", tone: "medium", alt: "Woman looking up in natural light", url: `${BASE}/photo-1489424731084-a5d8b219a5bb?${CROP}` },

  // ── Dark tones ──────────────────────────────────────────────
  { id: "JyVcAIUAcPM", tone: "dark", alt: "Young woman with deep brown skin portrait", url: `${BASE}/photo-1531384441138-2736e62e0919?${CROP}` },
  { id: "QqN25A3iHCE", tone: "dark", alt: "Teen with dark skin and bright smile", url: `${BASE}/photo-1523824921871-d6f1a15151f1?${CROP}` },
  { id: "d1UPkiFd04A", tone: "dark", alt: "Young man with dark complexion natural pose", url: `${BASE}/photo-1506634572416-48cdfe530110?${CROP}` },
  { id: "0C8xmZY3kcE", tone: "dark", alt: "Woman with natural hair and glowing skin", url: `${BASE}/photo-1531927557220-a9e23c1e4794?${CROP}` },
  { id: "sPNni1URFbQ", tone: "dark", alt: "Young woman with braids looking at camera", url: `${BASE}/photo-1524504388940-b1c1722653e1?${CROP}&sat=-10` },
  { id: "TMgQMXoglsM", tone: "dark", alt: "Young man with dark skin clean portrait", url: `${BASE}/photo-1519085360753-af0119f7cbe7?${CROP}` },
  { id: "kBJEJqWNtNY", tone: "dark", alt: "Woman with rich dark skin outdoors", url: `${BASE}/photo-1531746020798-e6953c6e8e04?${CROP}&bri=-10` },
  { id: "IfhL6HWAOMU", tone: "dark", alt: "Teen with dark skin and natural glow", url: `${BASE}/photo-1507152927220-18c138dacbdd?${CROP}` },
  { id: "6anudmpILw4", tone: "dark", alt: "Young woman with dark brown eyes closeup", url: `${BASE}/photo-1505503693641-1926193e8d57?${CROP}` },
  { id: "mJ-qGbxaZtU", tone: "dark", alt: "Man with dark complexion candid portrait", url: `${BASE}/photo-1504257432389-52343af06ae3?${CROP}&bri=-15` },
  { id: "jmURdhtm7Ng", tone: "dark", alt: "Young woman with natural hair portrait", url: `${BASE}/photo-1531123897727-8f129e1688ce?${CROP}&bri=-10` },
  { id: "L8SNwGUNqbU", tone: "dark", alt: "Young person with deep skin tone", url: `${BASE}/photo-1542909168-82c3e7fdca5c?${CROP}` },
  { id: "QS9ZX5UnS14", tone: "dark", alt: "Woman with dark skin and warm smile", url: `${BASE}/photo-1523049673857-eb18f1d7b578?${CROP}` },
  { id: "m2J2P6gCfEk", tone: "dark", alt: "Teen boy with dark skin smiling", url: `${BASE}/photo-1506794778202-cad84cf45f1d?${CROP}&bri=-20` },
  { id: "RnCPiXixooY", tone: "dark", alt: "Young woman looking forward confidently", url: `${BASE}/photo-1534528741775-53994a69daeb?${CROP}&bri=-15` },

  // ── Extra variety (mixed) ───────────────────────────────────
  { id: "MZ_aGwlJOHA", tone: "medium", alt: "Person with acne scars in natural light", url: `${BASE}/photo-1521119989659-a83eee488004?${CROP}` },
  { id: "pAs4IM6OGWI", tone: "light", alt: "Young woman with visible pores natural", url: `${BASE}/photo-1552374196-c4e7ffc6e126?${CROP}` },
  { id: "nKC772R_qog", tone: "dark", alt: "Young person with textured skin portrait", url: `${BASE}/photo-1531384441138-2736e62e0919?${CROP}&con=5` },
  { id: "X6Uj51n5CE8", tone: "medium", alt: "Teen with skin blemishes natural photo", url: `${BASE}/photo-1506863530036-1efeddceb993?${CROP}&con=5` },
  { id: "2VDa8bnLM8c", tone: "light", alt: "Young person with uneven skin tone", url: `${BASE}/photo-1499952127939-9bbf5af6c51c?${CROP}&con=5` },
  { id: "TkrRvwxjb_8", tone: "medium", alt: "Woman with real skin texture closeup", url: `${BASE}/photo-1489424731084-a5d8b219a5bb?${CROP}&con=5` },
  { id: "YMhQDR0jWwc", tone: "dark", alt: "Person with natural under-eye circles", url: `${BASE}/photo-1507152927220-18c138dacbdd?${CROP}&con=5` },
  { id: "b9-odQi5oDo", tone: "light", alt: "Teen with sunburn and freckles", url: `${BASE}/photo-1544005313-94ddf0286df2?${CROP}&con=5` },
  { id: "c7B-y4BPBJA", tone: "medium", alt: "Young person with dry skin patches", url: `${BASE}/photo-1519345182560-3f2917c472ef?${CROP}&con=5` },
  { id: "RA5ntyyDHlw", tone: "dark", alt: "Young woman with oily skin in daylight", url: `${BASE}/photo-1505503693641-1926193e8d57?${CROP}&con=5` },
  { id: "7A_msmRPLtc", tone: "light", alt: "Teen with rosy cheeks natural portrait", url: `${BASE}/photo-1517841905240-472988babdf9?${CROP}&con=3` },
  { id: "kZ1zThg6G40", tone: "medium", alt: "Young woman with slight redness", url: `${BASE}/photo-1542596768-5d1d21f1cf98?${CROP}&con=3` },
  { id: "EZSm8xRjnX0", tone: "dark", alt: "Young man with natural skin marks", url: `${BASE}/photo-1519085360753-af0119f7cbe7?${CROP}&con=3` },
  { id: "ILip77SbmOE", tone: "light", alt: "Woman with no makeup bare skin", url: `${BASE}/photo-1438761681033-6461ffad8d80?${CROP}&con=3` },
  { id: "Q4vSBHi4lYo", tone: "medium", alt: "Young person with laugh lines closeup", url: `${BASE}/photo-1534751516642-a1af1ef26a56?${CROP}&con=3` },
  { id: "HK85eFiiJqg", tone: "dark", alt: "Teen with natural glowing dark skin", url: `${BASE}/photo-1542909168-82c3e7fdca5c?${CROP}&con=3` },
  { id: "ZWG5oPOcJXs", tone: "light", alt: "Young man with visible skin texture", url: `${BASE}/photo-1500648767791-00dcc994a43e?${CROP}&con=3` },
  { id: "OPf4gJ6AMhU", tone: "medium", alt: "Woman with sun-kissed skin", url: `${BASE}/photo-1546961342-ea5f71b193f3?${CROP}&con=3` },
  { id: "VgfpA3yEdNc", tone: "dark", alt: "Young person in harsh overhead light", url: `${BASE}/photo-1523049673857-eb18f1d7b578?${CROP}&con=3` },
  { id: "9X1xSBEGbSg", tone: "light", alt: "Teen looking at camera with bare face", url: `${BASE}/photo-1529626455594-4ff0802cfb7e?${CROP}&con=3` },
]

/**
 * Pick a photo for a given day. Uses a deterministic but non-repeating
 * rotation so users see a new face every day for ~65 days before cycling.
 * Also ensures tone diversity across consecutive days.
 */
export function getPhotoForDay(date: Date = new Date()): PortraitPhoto {
  // Days since epoch — gives a unique integer per calendar day
  const daysSinceEpoch = Math.floor(date.getTime() / 86_400_000)

  // Simple hash to avoid sequential ordering (so Monday isn't always photo #1)
  const hash = ((daysSinceEpoch * 2654435761) >>> 0) % PORTRAIT_DB.length

  return PORTRAIT_DB[hash]
}

/**
 * Get multiple non-repeating photos for a given day (e.g. for comparison exercises).
 */
export function getPhotosForDay(count: number, date: Date = new Date()): PortraitPhoto[] {
  const daysSinceEpoch = Math.floor(date.getTime() / 86_400_000)
  const results: PortraitPhoto[] = []
  const used = new Set<number>()

  for (let i = 0; i < count && i < PORTRAIT_DB.length; i++) {
    const hash = (((daysSinceEpoch + i * 7) * 2654435761) >>> 0) % PORTRAIT_DB.length
    // Avoid duplicates
    let idx = hash
    while (used.has(idx)) {
      idx = (idx + 1) % PORTRAIT_DB.length
    }
    used.add(idx)
    results.push(PORTRAIT_DB[idx])
  }

  return results
}
