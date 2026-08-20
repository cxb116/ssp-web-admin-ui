<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { getSspSlotDayTrend } from '#/api/data/sspslotday';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

/** 概览汇总（供首页卡片展示） */
interface TrendSummary {
  showPv: number;
  clickPv: number;
  income: number;
  profit: number;
}

const emit = defineEmits<{
  summary: [summary: TrendSummary];
}>();

/** 可选的折线图指标 */
interface IndicatorOption {
  label: string;
  value: string;
}

const indicatorOptions: IndicatorOption[] = [
  { label: '广告请求', value: 'reqPv' },
  { label: '广告返回', value: 'retPv' },
  { label: '广告展现', value: 'showPv' },
  { label: '广告点击', value: 'clickPv' },
  { label: '填充率', value: 'fillRate' },
  { label: '展现率', value: 'displayRate' },
  { label: '点击率', value: 'clickRate' },
  { label: 'eCPM', value: 'ecpm' },
  { label: 'eCPRM', value: 'ecprm' },
  { label: '成本', value: 'spend' },
  { label: '收入', value: 'income' },
];

/** 默认选中指标 */
const selectedIndicators = ref<string[]>([
  'reqPv',
  'showPv',
  'clickPv',
]);

/** 时间检索（仅日报表，按天） */
const [SearchForm, searchFormApi] = useVbenForm({
  schema: [
    {
      fieldName: 'date',
      label: '时间',
      component: 'RangePicker',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        showTime: false,
        allowClear: true,
      },
      defaultValue: [
        dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD'),
        dayjs().endOf('day').format('YYYY-MM-DD'),
      ],
    },
  ],
  compact: true,
  handleReset: async () => {
    await searchFormApi.resetForm();
    await loadChart();
  },
  handleSubmit: async () => {
    await loadChart();
  },
  submitButtonOptions: {
    content: '查询',
  },
});

/** 从趋势数据中提取指标值（成本/收入换算为元） */
function pickValue(row: any, indicator: string): number {
  const raw = Number(row[indicator]) || 0;
  if (indicator === 'spend' || indicator === 'income') {
    return raw / 100;
  }
  return raw;
}

/** 加载并渲染折线图 */
async function loadChart() {
  if (selectedIndicators.value.length === 0) {
    message.warning('请至少选择一个指标');
    return;
  }

  const formValues = await searchFormApi.getValues();
  const params: Record<string, any> = {
    date: Array.isArray(formValues.date) ? formValues.date : undefined,
  };

  const data = await getSspSlotDayTrend(params);
  const rows = data as any[];

  // 汇总概览指标（时间检索范围内全部数据之和）
  const showPv = rows.reduce((sum, r) => sum + (Number(r.showPv) || 0), 0);
  const clickPv = rows.reduce((sum, r) => sum + (Number(r.clickPv) || 0), 0);
  const incomeCents = rows.reduce(
    (sum, r) => sum + (Number(r.income) || 0),
    0,
  );
  const spendCents = rows.reduce((sum, r) => sum + (Number(r.spend) || 0), 0);
  emit('summary', {
    showPv,
    clickPv,
    income: Math.round(incomeCents) / 100,
    profit: Math.round(incomeCents - spendCents) / 100,
  });

  const xAxis = rows.map((r) => {
    const str = String(r.date);
    return str.length === 8
      ? `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
      : str;
  });

  const series = selectedIndicators.value.map((indicator) => {
    const option = indicatorOptions.find((i) => i.value === indicator);
    return {
      name: option?.label || indicator,
      type: 'line',
      smooth: true,
      data: rows.map((r) => pickValue(r, indicator)),
    };
  });

  await renderEcharts({
    grid: { bottom: 40, left: 60, right: 20, top: 20 },
    legend: { bottom: 0, type: 'scroll' },
    series,
    tooltip: { axisPointer: { type: 'cross' }, trigger: 'axis' },
    xAxis: { boundaryGap: false, data: xAxis, type: 'category' },
    yAxis: { minInterval: 1, type: 'value' },
  });
}

function handleIndicatorChange() {
  loadChart();
}

onMounted(() => {
  loadChart();
});
</script>

<template>
  <div class="flex flex-col gap-4 rounded-md bg-white p-4">
    <!-- 时间检索 -->
    <SearchForm />

    <!-- 指标多选 -->
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-gray-600">指标：</span>
      <a-checkbox-group
        v-model:value="selectedIndicators"
        @change="handleIndicatorChange"
      >
        <a-checkbox
          v-for="opt in indicatorOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </a-checkbox>
      </a-checkbox-group>
    </div>

    <!-- 折线图 -->
    <EchartsUI ref="chartRef" height="620px" />
  </div>
</template>
