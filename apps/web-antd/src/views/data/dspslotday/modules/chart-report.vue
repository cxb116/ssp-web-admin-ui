<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { h, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { DatePicker, Select, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { getDspSlotDayTrend } from '#/api/data/dspslotday';
import { getDspSlotHourTrend } from '#/api/data/dspslothour';

import { useGridFormSchema } from '../data';

defineOptions({ name: 'DataDspSlotDayChartReport' });

const props = defineProps<{
  /** 页面检索条件（companyId/productId/dspSlotId/dspSlotCode/osType 等） */
  filterQuery?: Record<string, any>;
  /** 页面上下文：day=日报表页，hour=小时报表页 */
  context?: 'day' | 'hour';
}>();

const emit = defineEmits<{
  /** 返回报表列表 */
  back: [];
}>();

const router = useRouter();

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

/** 当前报表类型：day=日报折线（按天），hour=小时折线（单天0~23点） */
const reportType = ref<'day' | 'hour'>(
  props.context === 'hour' ? 'hour' : 'day',
);
/** 已选指标 */
const selectedIndicators = ref<string[]>(['reqPv', 'showPv', 'clickPv']);

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

/** 小时可选值（与 dspslothour 一致） */
const hourOptions = [
  { label: '全天', value: -1 },
  ...Array.from({ length: 24 }, (_, i) => ({ label: `${i}`, value: i })),
];

/** 小时报表的时间检索字段（与 dspslothour 一致） */
const hourDateSchema = {
  fieldName: 'date',
  label: '时间',
  component: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    setup(props: any, { emit }: any) {
      const dateVal = ref('');
      const hourVal = ref(-1);

      const parse = (val: any) => {
        const v = String(val ?? dayjs().format('YYYYMMDD'));
        if (v.length >= 10) {
          dateVal.value = v.slice(0, 8);
          hourVal.value = Number.parseInt(v.slice(8), 10) || 0;
        } else {
          dateVal.value = v.slice(0, 8);
          hourVal.value = -1;
        }
      };
      parse(props.modelValue);

      watch(() => props.modelValue, parse);

      const emitValue = () => {
        if (hourVal.value === -1) {
          emit('update:modelValue', dateVal.value);
        } else {
          emit(
            'update:modelValue',
            dateVal.value + String(hourVal.value).padStart(2, '0'),
          );
        }
      };

      return () =>
        h(
          'div',
          { style: { display: 'flex', gap: '4px', width: '100%' } },
          [
            h(DatePicker, {
              value: dayjs(dateVal.value, 'YYYYMMDD'),
              format: 'YYYY-MM-DD',
              style: { flex: '1' },
              onChange: (d: any) => {
                dateVal.value = d
                  ? d.format('YYYYMMDD')
                  : dayjs().format('YYYYMMDD');
                emitValue();
              },
            }),
            h(Select, {
              value: hourVal.value,
              options: hourOptions,
              style: { width: '90px' },
              onChange: (v: number) => {
                hourVal.value = v;
                emitValue();
              },
            }),
          ],
        );
    },
  },
  defaultValue: dayjs().format('YYYYMMDD'),
};

/** 日报表检索字段（含 RangePicker 时间范围） */
const gridSchema = useGridFormSchema();
const dayDateSchema = gridSchema.find((s) => s.fieldName === 'date');

/** 小时报表上下文时，检索栏时间字段默认使用日期+小时 */
const initialSchema =
  props.context === 'hour'
    ? gridSchema.map((s) =>
        s.fieldName === 'date' ? (hourDateSchema as any) : s,
      )
    : gridSchema;

/** 检索栏 */
const [SearchForm, searchFormApi] = useVbenForm({
  schema: initialSchema,
  compact: true,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleReset: async () => {
    await searchFormApi.resetForm();
    await loadChart();
  },
  handleSubmit: async () => {
    await loadChart();
  },
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  ...(props.filterQuery && Object.keys(props.filterQuery).length > 0
    ? { initialValues: props.filterQuery }
    : {}),
});

/** 组装后端趋势查询参数 */
async function buildTrendParams(): Promise<Record<string, any>> {
  const formValues = await searchFormApi.getValues();
  const params: Record<string, any> = {};

  for (const key of Object.keys(formValues)) {
    if (key === 'date' || key === 'dspSlotCode') continue;
    const val = formValues[key];
    if (val === undefined || val === null || val === '') continue;
    params[key] = val;
  }

  // 预算方广告位ID：空格分隔转数组（后端字段名 dspSlotCodes）
  if (formValues.dspSlotCode) {
    const s = String(formValues.dspSlotCode).trim();
    params.dspSlotCodes = s ? s.split(/\s+/) : undefined;
  }

  if (reportType.value === 'day') {
    params.date = Array.isArray(formValues.date) ? formValues.date : undefined;
  } else if (formValues.date) {
    // 与 dspslothour 一致：8位=全天，10位=指定小时
    const dateStr = String(formValues.date);
    if (dateStr.length === 8) {
      const dateNum = Number(dateStr);
      params.date = [dateNum * 100, dateNum * 100 + 23];
    } else {
      params.date = [Number(dateStr)];
    }
  }
  return params;
}

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
  const params = await buildTrendParams();

  let xAxis: string[] = [];
  const rows: any[] = [];

  if (reportType.value === 'day') {
    const data = await getDspSlotDayTrend(params);
    rows.push(...(data as any[]));
    xAxis = rows.map((r) => {
      const str = String(r.date);
      return str.length === 8
        ? `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
        : str;
    });
  } else {
    const data = await getDspSlotHourTrend(params);
    rows.push(...(data as any[]));
    xAxis = rows.map((r) => `${r.hour}点`);
  }

  // 按选中指标生成 series
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

/** 切换折线粒度时，同步检索栏时间字段并重新加载 */
watch(reportType, async (type) => {
  if (type === 'hour') {
    searchFormApi.updateSchema([hourDateSchema as any]);
    await searchFormApi.setFieldValue('date', dayjs().format('YYYYMMDD'));
  } else {
    if (dayDateSchema) {
      searchFormApi.updateSchema([dayDateSchema as any]);
    }
    await searchFormApi.setFieldValue('date', [
      dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD'),
      dayjs().endOf('day').format('YYYY-MM-DD'),
    ]);
  }
  await loadChart();
});

/** 收集当前检索条件（用于跳转日报表/小时报表） */
async function getJumpQuery(): Promise<Record<string, any>> {
  const formValues = await searchFormApi.getValues();
  const query: Record<string, any> = {};
  const fields = [
    'companyId',
    'productId',
    'dspSlotId',
    'dspSlotCode',
    'osType',
  ];
  for (const field of fields) {
    const val = formValues[field];
    if (val !== undefined && val !== null && val !== '') {
      query[field] = val;
    }
  }
  return query;
}

/** 日报表：日报表页回到列表，小时报表页跳转日报表 */
async function handleDayReport() {
  if (props.context === 'hour') {
    router.push({ name: 'DataDspSlotDay', query: await getJumpQuery() });
  } else {
    emit('back');
  }
}

/** 小时报表：日报表页跳转小时报表，小时报表页回到列表 */
async function handleHourReport() {
  if (props.context === 'hour') {
    emit('back');
  } else {
    router.push({ name: 'DataDspSlotHour', query: await getJumpQuery() });
  }
}

/** 当前已在折线报表 */
function handleChartReport() {
  // 已在折线报表页
}

onMounted(() => {
  loadChart();
});
</script>

<template>
  <div class="flex flex-col gap-4 rounded-md bg-white p-4">
    <!-- 检索栏（时间字段随折线粒度切换） -->
    <SearchForm />

    <!-- 标题 + 报表切换 + 折线粒度 -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="text-[1rem] font-bold">预算广告位报表</div>
      <a-button @click="handleDayReport">日报表</a-button>
      <a-button @click="handleHourReport">小时报表</a-button>
      <a-button type="primary" @click="handleChartReport">折线报表</a-button>
      <span class="text-gray-600">折线粒度：</span>
      <a-radio-group v-model:value="reportType">
        <a-radio-button value="day">按天</a-radio-button>
        <a-radio-button value="hour">按小时</a-radio-button>
      </a-radio-group>
    </div>

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
