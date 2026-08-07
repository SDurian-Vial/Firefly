<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { onMount } from "svelte";
import type { SolarTermInfo } from "@/utils/solar-term-utils";
import { getSolarTermInfo } from "@/utils/solar-term-utils";

interface Props {
	initial: SolarTermInfo;
}

let { initial }: Props = $props();

let info = $state<SolarTermInfo>(initial);

function refresh() {
	info = getSolarTermInfo(new Date());
}

// 跨年份的节气显示带年份，如 "2027年1月5日"
function formatDate(term: {
	year: number;
	month: number;
	day: number;
}): string {
	if (term.year === new Date().getFullYear()) {
		return `${term.month}月${term.day}日`;
	}
	return `${term.year}年${term.month}月${term.day}日`;
}

let timer: ReturnType<typeof setInterval>;

onMount(() => {
	refresh();
	// 跨天后自动刷新（每分钟检查一次）
	timer = setInterval(refresh, 60 * 1000);
	return () => clearInterval(timer);
});
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-col items-center gap-1 py-1">
		<span class="text-3xl font-bold leading-none text-(--primary)">
			{info.current.name}
		</span>
		<span class="text-xs text-neutral-500 dark:text-neutral-400">
			{formatDate(info.current)}
		</span>
	</div>
	{#each info.upcoming as term (term.name)}
		<div
			class="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5
				bg-(--btn-plain-bg-hover)"
		>
			<span
				class="flex items-baseline gap-1.5 text-sm font-medium text-neutral-900 dark:text-neutral-100"
			>
				<span>{term.name}</span>
				<span class="text-xs text-neutral-500 dark:text-neutral-400">
					{formatDate(term)}
				</span>
			</span>
			<span class="shrink-0 text-sm font-medium text-(--primary)">
				{i18n(I18nKey.solarTermDaysCount).replace(
					"{days}",
					String(term.daysUntil),
				)}
			</span>
		</div>
	{/each}
</div>
