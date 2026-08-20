<script lang="ts" setup>
import { computed, ref } from 'vue';

import { AnalysisChartCard } from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';

const summary = ref({ showPv: 0, clickPv: 0, income: 0, profit: 0 });

const overviewItems = computed(() => [
  {
    icon: SvgCardIcon,
    title: '广告展现',
    value: summary.value.showPv,
  },
  {
    icon: SvgCakeIcon,
    title: '广告点击',
    value: summary.value.clickPv,
  },
  {
    icon: SvgDownloadIcon,
    title: '预估收益',
    value: summary.value.income,
  },
  {
    icon: SvgBellIcon,
    title: '利润',
    value: summary.value.profit,
  },
]);

function handleSummary(val: {
  showPv: number;
  clickPv: number;
  income: number;
  profit: number;
}) {
  summary.value = val;
}
</script>

<template>
  <div class="p-5">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <a-card
        v-for="item in overviewItems"
        :key="item.title"
        :title="item.title"
        class="w-full"
      >
        <div class="flex items-center justify-between">
          <span class="text-xl">{{ item.value }}</span>
          <component :is="item.icon" class="size-8 shrink-0" />
        </div>
      </a-card>
    </div>

    <AnalyticsTrends class="mt-5" @summary="handleSummary" />

    <div v-if="false" class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
