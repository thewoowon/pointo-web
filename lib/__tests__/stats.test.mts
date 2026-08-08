import { dailyStats, dateRangeOf, hourlyStats, todaySummary } from "../stats";

const day = (offset: number, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const log = (offset: number, action: string, stamp: number, phone: string, hour = 12) =>
  ({ id: `${offset}-${action}-${phone}-${hour}`, action, phone_number: phone, stamp, note: "", timestamp: day(offset, hour) } as never);

let fail = 0;
const eq = (name: string, actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { fail++; console.log(`❌ ${name}\n   기대 ${e}\n   실제 ${a}`); }
  else console.log(`✅ ${name}`);
};

const logs = [
  log(0, "stamp_saved", 1, "01011112222", 9),
  log(0, "stamp_saved", 2, "01011112222", 15),   // 같은 사람 재방문
  log(0, "stamp_used", 10, "01033334444", 19),
  log(-2, "stamp_saved", 3, "01055556666"),
];

// 스탬프 모드 = 건수
eq("오늘 요약(스탬프)", todaySummary(logs, false), { saved: 2, used: 1, visitors: 2 });
// 포인트 모드 = 값 합산
eq("오늘 요약(포인트)", todaySummary(logs, true), { saved: 3, used: 10, visitors: 2 });

const seven = dailyStats(logs, "7days", false);
eq("7일 = 7칸", seven.length, 7);
eq("마지막 칸이 오늘", seven[6].saved, 2);
eq("이틀 전 칸", seven[4].saved, 1);
eq("빈 날은 0으로 채움", seven[5], { key: seven[5].key, label: seven[5].label, saved: 0, used: 0 });

eq("30일 = 30칸", dailyStats(logs, "30days", false).length, 30);
eq("오늘만 = 1칸", dailyStats(logs, "today", false).length, 1);
eq("이번 달 = 오늘 날짜만큼", dailyStats(logs, "month", false).length, new Date().getDate());

const r = dateRangeOf("7days");
eq("7일 범위 끝 = 오늘", r.end, dailyStats(logs, "today", false)[0].key);

const hours = hourlyStats(logs);
eq("시간대 6구간", hours.length, 6);
eq("아침(6-10) 1건", hours[1].count, 1);
eq("오후(14-18) 1건", hours[3].count, 1);
eq("저녁(18-22) 1건", hours[4].count, 1);
eq("새벽 0건", hours[0].count, 0);

console.log(fail === 0 ? "\n모두 통과" : `\n실패 ${fail}건`);
process.exit(fail ? 1 : 0);
