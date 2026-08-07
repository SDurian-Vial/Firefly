export interface SolarTermDate {
	name: string;
	month: number;
	day: number;
}

export interface SolarTermInfo {
	current: SolarTermDate;
	next: SolarTermDate;
	daysUntil: number;
}

// 二十四节气中文名称（顺序：小寒为每年第一个节气，对应数组下标 0，冬至为下标 23）
export const SOLAR_TERMS = [
	"小寒",
	"大寒",
	"立春",
	"雨水",
	"惊蛰",
	"春分",
	"清明",
	"谷雨",
	"立夏",
	"小满",
	"芒种",
	"夏至",
	"小暑",
	"大暑",
	"立秋",
	"处暑",
	"白露",
	"秋分",
	"寒露",
	"霜降",
	"立冬",
	"小雪",
	"大雪",
	"冬至",
] as const;

// 节气太阳黄经偏移表（单位：分钟，相对 1900 年 1 月 6 日 2 时 5 分 UTC 的修正量）
// 用于近似计算每年各节气对应的公历日期，1900-2100 年精度约为 ±1 天
const TERM_OFFSET_MINUTES = [
	0, 21208, 42467, 63807, 85337, 107014, 128867, 150921, 173149, 195551, 218072,
	240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210,
	440795, 462224, 483532, 504758,
];

// 平均回归年长度（单位：毫秒）
const TROPICAL_YEAR_MS = 31556925974.7;

// 节气下标对应的公历月份（index 0-1 对应 1 月，index 2-3 对应 2 月，以此类推）
export function getTermMonth(index: number): number {
	return Math.floor(index / 2) + 1;
}

// 计算某年第 index 个节气（0=小寒 … 23=冬至）的公历日期
export function getTermDate(year: number, index: number): SolarTermDate {
	const offset =
		TROPICAL_YEAR_MS * (year - 1900) + TERM_OFFSET_MINUTES[index] * 60000;
	const date = new Date(offset + Date.UTC(1900, 0, 6, 2, 5));
	return {
		name: SOLAR_TERMS[index],
		month: getTermMonth(index),
		day: date.getUTCDate(),
	};
}

// 获取指定年份全年 24 个节气
export function getSolarTermsOfYear(year: number): SolarTermDate[] {
	return SOLAR_TERMS.map((_, index) => getTermDate(year, index));
}

// 当前节气信息：当前所处节气、下个节气名称、距离下个节气还有多少天
export function getSolarTermInfo(today: Date): SolarTermInfo {
	const year = today.getFullYear();
	const prevYear = getSolarTermsOfYear(year - 1);
	const thisYear = getSolarTermsOfYear(year);
	const nextYear = getSolarTermsOfYear(year + 1);

	const todayStart = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	).getTime();

	let currentIndex = -1;
	for (let i = 0; i < thisYear.length; i++) {
		const term = thisYear[i];
		const termTime = new Date(year, term.month - 1, term.day).getTime();
		if (todayStart >= termTime) {
			currentIndex = i;
		}
	}

	let current: SolarTermDate;
	let next: SolarTermDate;
	let nextTime: number;

	if (currentIndex === -1) {
		// 当年第一个节气（小寒）还没到，当前处于上一年冬至
		current = prevYear[23];
		next = thisYear[0];
		nextTime = new Date(year, next.month - 1, next.day).getTime();
	} else if (currentIndex === thisYear.length - 1) {
		// 已过当年最后一个节气（冬至），下一个是次年小寒
		current = thisYear[currentIndex];
		next = nextYear[0];
		nextTime = new Date(year + 1, next.month - 1, next.day).getTime();
	} else {
		current = thisYear[currentIndex];
		next = thisYear[currentIndex + 1];
		nextTime = new Date(year, next.month - 1, next.day).getTime();
	}

	const daysUntil = Math.round((nextTime - todayStart) / 86400000);

	return { current, next, daysUntil };
}
