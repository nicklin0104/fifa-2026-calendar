/**
 * update-scores.js
 * ────────────────────────────────────────────
 * 自動更新 index.html 中的比分資料。
 *
 * 輸入格式：
 *   node update-scores.js "M1 2-1"
 *   node update-scores.js "M1 2-1; M2 0-0; M7 3-1"
 *   node update-scores.js "M73 1-1 (4-3)"        ← PK 戰
 *
 * 技術說明：
 *   - 小組賽：在 GROUP_MATCHES 陣列中，找到對應 matchNum 的行，
 *     在陣列末端插入或更新第 7 個元素（score）。
 *   - 淘汰賽：在 KNOCKOUT_DAYS 中，找到 num:'Mxx' 的行，
 *     插入或更新 score:'x-x' 屬性。
 */

const fs = require('fs');
const path = require('path');

// ─── Parse Input ──────────────────────────────────────────────────────────────
const input = process.argv[2];
if (!input) {
  console.error('❌ 請提供比分資料');
  console.error('   格式：node update-scores.js "M1 2-1; M2 0-0"');
  process.exit(1);
}

const updates = input.split(';').map(s => {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const firstSpace = trimmed.indexOf(' ');
  if (firstSpace === -1) {
    console.error(`❌ 格式錯誤：「${trimmed}」，應為「賽事編號 比分」，例如 M1 2-1`);
    return null;
  }
  return {
    matchNum: trimmed.substring(0, firstSpace).toUpperCase(),
    score: trimmed.substring(firstSpace + 1).trim()
  };
}).filter(Boolean);

if (updates.length === 0) {
  console.error('❌ 沒有有效的更新資料');
  process.exit(1);
}

console.log(`📋 準備更新 ${updates.length} 場比分...\n`);

// ─── Read File ────────────────────────────────────────────────────────────────
const filePath = path.resolve(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf-8');
let lines = content.split('\n');
let updatedCount = 0;

// ─── Process Updates ──────────────────────────────────────────────────────────
for (const { matchNum, score } of updates) {
  let found = false;
  const escapedNum = matchNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── 小組賽 ──
    // 格式：['0612','03:00','墨西哥','南非','🇲🇽 阿茲特克體育場','M1'],
    // 含分：['0612','03:00','墨西哥','南非','🇲🇽 阿茲特克體育場','M1', '2-1'],
    if (line.trim().startsWith('[') && line.includes(`'${matchNum}'`)) {
      const withScoreRegex = new RegExp(`'${escapedNum}',\\s*'[^']*'(\\s*\\])`);
      const withoutScoreRegex = new RegExp(`'${escapedNum}'(\\s*\\])`);

      if (withScoreRegex.test(line)) {
        lines[i] = line.replace(withScoreRegex, `'${matchNum}', '${score}'$1`);
      } else if (withoutScoreRegex.test(line)) {
        lines[i] = line.replace(withoutScoreRegex, `'${matchNum}', '${score}'$1`);
      }
      found = true;
      updatedCount++;
      console.log(`  ✅ 小組賽 ${matchNum} → ${score}`);
      break;
    }

    // ── 淘汰賽 ──
    // 格式：{ num:'M73', time:'03:00',
    // 含分：{ num:'M73', score:'1-0', time:'03:00',
    if (line.includes(`num:'${matchNum}'`)) {
      if (/score:'[^']*'/.test(line)) {
        lines[i] = line.replace(/score:'[^']*'/, `score:'${score}'`);
      } else {
        lines[i] = line.replace(
          `num:'${matchNum}',`,
          `num:'${matchNum}', score:'${score}',`
        );
      }
      found = true;
      updatedCount++;
      console.log(`  ✅ 淘汰賽 ${matchNum} → ${score}`);
      break;
    }
  }

  if (!found) {
    console.warn(`  ⚠️ 找不到賽事 ${matchNum}，請確認編號是否正確`);
  }
}

// ─── Write File ───────────────────────────────────────────────────────────────
fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
console.log(`\n🏁 完成！成功更新 ${updatedCount}/${updates.length} 場比分。`);

if (updatedCount === 0) {
  process.exit(1);
}
