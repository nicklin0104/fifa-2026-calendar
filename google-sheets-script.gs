/**
 * FIFA 2026 World Cup - 小組賽行事曆產生器
 * ─────────────────────────────────────────────────────────
 * 使用方式：
 *   1. 開啟 Google Spreadsheet
 *   2. 上方選單 → 擴充功能 → Apps Script
 *   3. 將此檔案全部內容貼上（取代原有內容）
 *   4. 按左上方 ▶ 執行（或按 Ctrl+R）
 *   5. 第一次執行需授權，點「審查權限」→「允許」
 * ─────────────────────────────────────────────────────────
 */

function createFIFA2026Calendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 刪除舊工作表（若存在）
  let sheet = ss.getSheetByName('⚽ FIFA 2026 小組賽');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('⚽ FIFA 2026 小組賽', 0);

  // ── 常數設定 ──────────────────────────────────────────────
  const HEADER_BG      = '#0f2a4a';
  const HEADER_FG      = '#ffffff';
  const SEP_BG         = '#0f2a4a';
  const DATE_HAS_BG    = '#dce8f5';
  const DATE_NONE_BG   = '#f2f2f2';
  const DATE_HAS_FG    = '#0f2a4a';
  const DATE_NONE_FG   = '#aaaaaa';
  const EMPTY_BG       = '#fafafa';

  const DAYS = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

  // 各週日期（從 6/7 星期日開始排列）
  const WEEKS = [
    ['6/7', '6/8', '6/9', '6/10','6/11','6/12','6/13'],
    ['6/14','6/15','6/16','6/17','6/18','6/19','6/20'],
    ['6/21','6/22','6/23','6/24','6/25','6/26','6/27'],
    ['6/28','6/29','6/30','7/1', '7/2', '7/3', '7/4' ],
  ];

  // 國旗 Emoji
  const FLAGS = {
    '墨西哥':'🇲🇽','南非':'🇿🇦','南韓':'🇰🇷','捷克':'🇨🇿',
    '加拿大':'🇨🇦','波赫':'🇧🇦','卡達':'🇶🇦','瑞士':'🇨🇭',
    '巴西':'🇧🇷','摩洛哥':'🇲🇦','海地':'🇭🇹','蘇格蘭':'🏴',
    '美國':'🇺🇸','巴拉圭':'🇵🇾','澳洲':'🇦🇺','土耳其':'🇹🇷',
    '德國':'🇩🇪','古拉索':'🇨🇼','象牙海岸':'🇨🇮','厄瓜多':'🇪🇨',
    '荷蘭':'🇳🇱','日本':'🇯🇵','瑞典':'🇸🇪','突尼西亞':'🇹🇳',
    '比利時':'🇧🇪','埃及':'🇪🇬','伊朗':'🇮🇷','紐西蘭':'🇳🇿',
    '西班牙':'🇪🇸','維德角':'🇨🇻','沙烏地阿拉伯':'🇸🇦','烏拉圭':'🇺🇾',
    '法國':'🇫🇷','塞內加爾':'🇸🇳','伊拉克':'🇮🇶','挪威':'🇳🇴',
    '阿根廷':'🇦🇷','阿爾及利亞':'🇩🇿','奧地利':'🇦🇹','約旦':'🇯🇴',
    '葡萄牙':'🇵🇹','剛果民主共和國':'🇨🇩','烏茲別克':'🇺🇿','哥倫比亞':'🇨🇴',
    '英格蘭':'🏴','克羅埃西亞':'🇭🇷','迦納':'🇬🇭','巴拿馬':'🇵🇦',
  };

  // 各組淺色背景（儲存格填色）
  const GROUP_BG = {
    'A':'#ffd7d7','B':'#ffe8cc','C':'#fffacc',
    'D':'#d7f5e7','E':'#ccf5ef','F':'#d0e8ff',
    'G':'#ead7ff','H':'#ffd7ef','I':'#ffe4d7',
    'J':'#dce6ea','K':'#e8ddd9','L':'#ccf5ff',
  };

  // 各組深色字（標籤用）
  const GROUP_FG = {
    'A':'#c0392b','B':'#c0641e','C':'#b8860b',
    'D':'#1a7a44','E':'#0e6b5a','F':'#1a5f9e',
    'G':'#6c2fa0','H':'#9b1a5c','I':'#b83c1a',
    'J':'#4a5f6a','K':'#5d3a30','L':'#006070',
  };

  // ── 比賽資料（台灣時間） ──────────────────────────────────
  const MATCHES = {
    '6/12':[
      {t:'03:00',g:'A',h:'墨西哥',a:'南非'},
      {t:'10:00',g:'A',h:'南韓',  a:'捷克'},
    ],
    '6/13':[
      {t:'03:00',g:'B',h:'加拿大',a:'波赫'},
      {t:'09:00',g:'D',h:'美國',  a:'巴拉圭'},
    ],
    '6/14':[
      {t:'03:00',g:'B',h:'卡達',  a:'瑞士'},
      {t:'06:00',g:'C',h:'巴西',  a:'摩洛哥'},
      {t:'09:00',g:'C',h:'海地',  a:'蘇格蘭'},
      {t:'12:00',g:'D',h:'澳洲',  a:'土耳其'},
    ],
    '6/15':[
      {t:'01:00',g:'E',h:'德國',  a:'古拉索'},
      {t:'04:00',g:'F',h:'荷蘭',  a:'日本'},
      {t:'07:00',g:'E',h:'象牙海岸',a:'厄瓜多'},
      {t:'10:00',g:'F',h:'瑞典',  a:'突尼西亞'},
    ],
    '6/16':[
      {t:'00:00',g:'H',h:'西班牙',a:'維德角'},
      {t:'03:00',g:'G',h:'比利時',a:'埃及'},
      {t:'06:00',g:'H',h:'沙烏地阿拉伯',a:'烏拉圭'},
      {t:'09:00',g:'G',h:'伊朗',  a:'紐西蘭'},
    ],
    '6/17':[
      {t:'03:00',g:'I',h:'法國',  a:'塞內加爾'},
      {t:'06:00',g:'I',h:'伊拉克',a:'挪威'},
      {t:'09:00',g:'J',h:'阿根廷',a:'阿爾及利亞'},
      {t:'12:00',g:'J',h:'奧地利',a:'約旦'},
    ],
    '6/18':[
      {t:'01:00',g:'K',h:'葡萄牙',a:'剛果民主共和國'},
      {t:'04:00',g:'L',h:'英格蘭',a:'克羅埃西亞'},
      {t:'07:00',g:'L',h:'迦納',  a:'巴拿馬'},
      {t:'10:00',g:'K',h:'烏茲別克',a:'哥倫比亞'},
    ],
    '6/19':[
      {t:'00:00',g:'A',h:'捷克',  a:'南非'},
      {t:'03:00',g:'B',h:'瑞士',  a:'波赫'},
      {t:'06:00',g:'B',h:'加拿大',a:'卡達'},
      {t:'09:00',g:'A',h:'墨西哥',a:'南韓'},
    ],
    '6/20':[
      {t:'03:00',g:'D',h:'美國',  a:'澳洲'},
      {t:'06:00',g:'C',h:'蘇格蘭',a:'摩洛哥'},
      {t:'09:00',g:'C',h:'巴西',  a:'海地'},
      {t:'12:00',g:'D',h:'土耳其',a:'巴拉圭'},
    ],
    '6/21':[
      {t:'01:00',g:'F',h:'荷蘭',  a:'瑞典'},
      {t:'04:00',g:'E',h:'德國',  a:'象牙海岸'},
      {t:'08:00',g:'E',h:'厄瓜多',a:'古拉索'},
      {t:'12:00',g:'F',h:'突尼西亞',a:'日本'},
    ],
    '6/22':[
      {t:'00:00',g:'H',h:'西班牙',a:'沙烏地阿拉伯'},
      {t:'03:00',g:'G',h:'比利時',a:'伊朗'},
      {t:'06:00',g:'H',h:'烏拉圭',a:'維德角'},
      {t:'09:00',g:'G',h:'紐西蘭',a:'埃及'},
    ],
    '6/23':[
      {t:'01:00',g:'J',h:'阿根廷',a:'奧地利'},
      {t:'05:00',g:'I',h:'法國',  a:'伊拉克'},
      {t:'08:00',g:'I',h:'挪威',  a:'塞內加爾'},
      {t:'11:00',g:'J',h:'約旦',  a:'阿爾及利亞'},
    ],
    '6/24':[
      {t:'01:00',g:'K',h:'葡萄牙',a:'烏茲別克'},
      {t:'04:00',g:'L',h:'英格蘭',a:'迦納'},
      {t:'07:00',g:'L',h:'巴拿馬',a:'克羅埃西亞'},
      {t:'10:00',g:'K',h:'哥倫比亞',a:'剛果民主共和國'},
    ],
    '6/25':[
      {t:'03:00',g:'B',h:'瑞士',  a:'加拿大'},
      {t:'03:00',g:'B',h:'波赫',  a:'卡達'},
      {t:'06:00',g:'C',h:'蘇格蘭',a:'巴西'},
      {t:'06:00',g:'C',h:'摩洛哥',a:'海地'},
      {t:'09:00',g:'A',h:'捷克',  a:'墨西哥'},
      {t:'09:00',g:'A',h:'南非',  a:'南韓'},
    ],
    '6/26':[
      {t:'04:00',g:'E',h:'厄瓜多',a:'德國'},
      {t:'04:00',g:'E',h:'古拉索',a:'象牙海岸'},
      {t:'07:00',g:'F',h:'日本',  a:'瑞典'},
      {t:'07:00',g:'F',h:'突尼西亞',a:'荷蘭'},
      {t:'10:00',g:'D',h:'土耳其',a:'美國'},
      {t:'10:00',g:'D',h:'巴拉圭',a:'澳洲'},
    ],
    '6/27':[
      {t:'03:00',g:'I',h:'挪威',  a:'法國'},
      {t:'03:00',g:'I',h:'塞內加爾',a:'伊拉克'},
      {t:'08:00',g:'H',h:'維德角',a:'沙烏地阿拉伯'},
      {t:'08:00',g:'H',h:'烏拉圭',a:'西班牙'},
      {t:'11:00',g:'G',h:'紐西蘭',a:'比利時'},
      {t:'11:00',g:'G',h:'埃及',  a:'伊朗'},
    ],
    '6/28':[
      {t:'05:00',g:'L',h:'巴拿馬',a:'英格蘭'},
      {t:'05:00',g:'L',h:'克羅埃西亞',a:'迦納'},
      {t:'07:30',g:'K',h:'哥倫比亞',a:'葡萄牙'},
      {t:'07:30',g:'K',h:'剛果民主共和國',a:'烏茲別克'},
      {t:'10:00',g:'J',h:'約旦',  a:'阿根廷'},
      {t:'10:00',g:'J',h:'阿爾及利亞',a:'奧地利'},
    ],
  };

  // ── 欄位寬度設定 ─────────────────────────────────────────
  for (let c = 1; c <= 7; c++) {
    sheet.setColumnWidth(c, 175);
  }

  // ── 第 1 列：星期標題 ────────────────────────────────────
  const headerRange = sheet.getRange(1, 1, 1, 7);
  headerRange.setValues([DAYS]);
  headerRange.setBackground(HEADER_BG);
  headerRange.setFontColor(HEADER_FG);
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setFontSize(12);
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // ── 逐週繪製 ────────────────────────────────────────────
  let currentRow = 2;

  WEEKS.forEach((week, weekIdx) => {
    // 計算本週最多場數
    let maxMatches = 0;
    week.forEach(date => {
      const cnt = (MATCHES[date] || []).length;
      if (cnt > maxMatches) maxMatches = cnt;
    });
    if (maxMatches === 0) maxMatches = 1;

    // ── 分隔列（深藍橫條）
    const sepRange = sheet.getRange(currentRow, 1, 1, 7);
    sepRange.setBackground(SEP_BG);
    sheet.setRowHeight(currentRow, 6);
    currentRow++;

    // ── 日期列
    const dateRow = currentRow;
    sheet.setRowHeight(dateRow, 26);
    week.forEach((date, dayIdx) => {
      const hasMatch = (MATCHES[date] || []).length > 0;
      const cell = sheet.getRange(dateRow, dayIdx + 1);
      cell.setValue(date);
      cell.setFontWeight('bold');
      cell.setFontSize(10);
      cell.setHorizontalAlignment('right');
      cell.setVerticalAlignment('middle');
      cell.setBackground(hasMatch ? DATE_HAS_BG : DATE_NONE_BG);
      cell.setFontColor(hasMatch ? DATE_HAS_FG : DATE_NONE_FG);
      // 右側留 padding
      cell.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    });
    currentRow++;

    // ── 比賽列
    for (let mi = 0; mi < maxMatches; mi++) {
      const matchRow = currentRow;
      sheet.setRowHeight(matchRow, 26);

      week.forEach((date, dayIdx) => {
        const dayMatches = MATCHES[date] || [];
        const cell = sheet.getRange(matchRow, dayIdx + 1);
        cell.setVerticalAlignment('middle');
        cell.setFontSize(9);
        cell.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

        if (mi < dayMatches.length) {
          const m = dayMatches[mi];
          const hF = FLAGS[m.h] || '';
          const aF = FLAGS[m.a] || '';
          const text = `[${m.g}] ${m.t}  ${hF}${m.h} vs ${aF}${m.a}`;
          cell.setValue(text);
          cell.setBackground(GROUP_BG[m.g] || '#ffffff');
          cell.setFontColor(GROUP_FG[m.g] || '#333333');
          cell.setFontWeight('bold');
        } else {
          const hasAny = (MATCHES[date] || []).length > 0;
          cell.setBackground(hasAny ? '#eef4fb' : EMPTY_BG);
          cell.setFontColor('#cccccc');
        }
      });
      currentRow++;
    }
  });

  // ── 最後補一列分隔
  const finalSep = sheet.getRange(currentRow, 1, 1, 7);
  finalSep.setBackground(SEP_BG);
  sheet.setRowHeight(currentRow, 6);

  // ── 全域框線
  const allRange = sheet.getRange(1, 1, currentRow, 7);
  allRange.setBorder(
    true, true, true, true, true, true,
    '#bdd1e8', SpreadsheetApp.BorderStyle.SOLID
  );

  // ── 圖例工作表 ──────────────────────────────────────────
  let legend = ss.getSheetByName('分組圖例');
  if (legend) ss.deleteSheet(legend);
  legend = ss.insertSheet('分組圖例');

  const GROUP_TEAMS = {
    'A':['墨西哥','南非','南韓','捷克'],
    'B':['加拿大','波赫','卡達','瑞士'],
    'C':['巴西','摩洛哥','海地','蘇格蘭'],
    'D':['美國','巴拉圭','澳洲','土耳其'],
    'E':['德國','古拉索','象牙海岸','厄瓜多'],
    'F':['荷蘭','日本','瑞典','突尼西亞'],
    'G':['比利時','埃及','伊朗','紐西蘭'],
    'H':['西班牙','維德角','沙烏地阿拉伯','烏拉圭'],
    'I':['法國','塞內加爾','伊拉克','挪威'],
    'J':['阿根廷','阿爾及利亞','奧地利','約旦'],
    'K':['葡萄牙','剛果民主共和國','烏茲別克','哥倫比亞'],
    'L':['英格蘭','克羅埃西亞','迦納','巴拿馬'],
  };

  legend.getRange(1,1,1,2).setValues([['組別','參賽隊伍']]);
  legend.getRange(1,1,1,2).setBackground(HEADER_BG).setFontColor(HEADER_FG).setFontWeight('bold').setHorizontalAlignment('center');
  legend.setColumnWidth(1, 60);
  legend.setColumnWidth(2, 400);

  let lr = 2;
  Object.entries(GROUP_TEAMS).forEach(([g, teams]) => {
    const teamsText = teams.map(t => `${FLAGS[t] || ''}${t}`).join('　　');
    legend.getRange(lr, 1).setValue(`${g} 組`).setBackground(GROUP_BG[g]).setFontColor(GROUP_FG[g]).setFontWeight('bold').setHorizontalAlignment('center');
    legend.getRange(lr, 2).setValue(teamsText).setBackground(GROUP_BG[g]).setFontColor(GROUP_FG[g]);
    legend.setRowHeight(lr, 28);
    lr++;
  });

  legend.getRange(2,1,12,2).setBorder(true,true,true,true,true,true,'#cccccc',SpreadsheetApp.BorderStyle.SOLID);
  legend.setTabColor('#1e6f9e');

  // ── 完成 ────────────────────────────────────────────────
  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('✅ FIFA 2026 小組賽行事曆已建立完成！\n\n📅 行事曆：⚽ FIFA 2026 小組賽\n📋 分組資訊：分組圖例');
}
