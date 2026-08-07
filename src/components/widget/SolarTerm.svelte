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

let timer: ReturnType<typeof setInterval>;

onMount(() => {
	refresh();
	// 跨天后自动刷新（每分钟检查一次）
	timer = setInterval(refresh, 60 * 1000);
	return () => clearInterval(timer);
});
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-baseline justify-between">
		<span class="text-sm text-neutral-500 dark:text-neutral-400">
			{i18n(I18nKey.solarTermCurrent)}
		</span>
		<div class="flex items-baseline gap-1.5">
			<span class="text-xl font-bold leading-none text-(--primary)">
				{info.current.name}
			</span>
			<span class="text-xs text-neutral-500 dark:text-neutral-400">
				{info.current.month}月{info.current.day}日
			</span>
		</div>
	</div>
	<div
		class="flex items-center justify-between gap-2 rounded-lg px-3 py-2
			bg-(--btn-plain-bg-hover)"
	>
		<span class="text-sm text-neutral-600 dark:text-neutral-300">
			{i18n(I18nKey.solarTermNext)}
		</span>
		<span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
			{i18n(I18nKey.solarTermDays)
				.replace("{name}", info.next.name)
				.replace("{days}", String(info.daysUntil))}
		</span>
	</div>
</div>
