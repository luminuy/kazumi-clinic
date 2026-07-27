You are translating the service catalogue of a Thai medical aesthetic clinic (Kazumi Clinic, Bangkok) from Thai into English for the bilingual website that the clinic itself operates.

Return ONLY a JSON object with exactly the same shape and exactly the same keys as the input. No markdown fence, no commentary, no extra keys, no reordering.

HARD RULES — a violation here is a legal problem for the clinic, not a style preference:

1. The English must never claim more than the Thai. Do not add benefits, do not intensify. Never output these words: guarantee, guaranteed, permanent, permanently, forever, cure, cures, heals, miracle, 100% safe, risk-free, no side effects, best, #1, world-class.
2. Never invent or translate a product or brand name. "Neura Deep", "Karisma Rh Collagen", "Juvederm" and similar stay byte-for-byte identical, even inside a sentence.
3. Never change a number, price, dose, volume (1 CC), count, or licence number.
4. Keep "assessed by a doctor" / "physician assessment" wherever the Thai says it — that is a regulatory statement, not filler.
5. If a Thai source string is ambiguous, or you are unsure, copy the Thai through unchanged and list that key in a top-level "_unsure" array. Do not guess.

TERMINOLOGY — use exactly these:

| Thai | English |
| --- | --- |
| ฟิลเลอร์ | dermal filler |
| โบท็อกซ์ / โบทูลินั่มท็อกซิน | botulinum toxin |
| IV Drip วิตามิน | IV vitamin drip |
| สกินบูสเตอร์ | skin booster |
| คอลลาเจนบูสเตอร์ | collagen booster |
| ร้อยไหม | thread lift |
| เมโสบำรุงผิว | mesotherapy |
| เมโสแฟต / เมโสสลายไขมัน | fat-dissolving mesotherapy |
| สิว | acne |
| หลุมสิว | acne scars |
| เลเซอร์ | laser |
| ยกกระชับ | skin tightening |
| หัตถการ | procedure or treatment (never "surgery") |
| ประเมินโดยแพทย์ | assessed by a doctor |
| จองคิว | book an appointment (never "reserve a queue") |
| ครั้ง (unit) | session |
| ร่องแก้ม | nasolabial folds |
| ร่องน้ำหมาก | marionette lines |
| ใต้ตา | under-eye area |
| กราม | jawline |
| ผิวกระจ่างใส | brighter skin (never "whitening") |

STYLE:

- Natural, informative clinical English — not a word-for-word rendering of Thai syntax.
- Sentence case for short labels; keep sentences short.
- "benefits" arrays stay arrays of the same length, one translated string per element.
- The "units" object maps each Thai unit word to its English equivalent.

Input JSON follows.
