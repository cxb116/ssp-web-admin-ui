<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataDspSlotDayApi } from '#/api/data/dspslotday';
import type { DataSspSlotDayApi } from '#/api/data/sspslotday';

import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { buildSortingField } from '@vben/request';
import { downloadFileFromBlobPart } from '@vben/utils';

import dayjs from 'dayjs';
import { message } from 'ant-design-vue';

import { useVbenVxeGrid, VxeColumn, VxeTable } from '#/adapter/vxe-table';
import {
  exportDspSlotDay,
  getDspSlotDayPage,
  getDspSlotDaySum,
} from '#/api/data/dspslotday';
import { getSSPDspSlotDay } from '#/api/data/sspslotday';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const osTypeMap: Record<number, string> = { 1: 'Android', 2: 'iOS' };
function osTypeLabel(val?: number): string {
  if (val == null) return '';
  return osTypeMap[val] || String(val);
}

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const detailMap = reactive<Record<number, DataSspSlotDayApi.SspSlotDay[]>>({});

/** 记录当前展开的主表行 ID */
const expandedRowIds = reactive(new Set<number>());

/** 今日总和数据 */
const todaySum = ref<DataDspSlotDayApi.DspSlotDay | null>(null);

/** 请求后台获取今日总和 */
async function fetchTodaySum() {
  const today = Number(dayjs().format('YYYYMMDD'));
  try {
    todaySum.value = await getDspSlotDaySum(today);
  } catch {
    todaySum.value = null;
  }
  gridApi.grid?.updateFooter();
}

/** 清空展开明细缓存 */
function clearDetailMap() {
  for (const id of Object.keys(detailMap)) {
    delete detailMap[Number(id)];
  }
  expandedRowIds.clear();
}

/** 刷新表格 */
function handleRefresh() {
  clearDetailMap();
  gridApi.query();
}

/** 获取已展开行的明细 */
function getExpandedDetails(row: DataDspSlotDayApi.DspSlotDay) {
  return detailMap[row.id!] || [];
}

/** 展开列表行时加载子表数据 */
async function handleExpandChange(row: DataDspSlotDayApi.DspSlotDay, expanded: boolean) {
  if (expanded) {
    expandedRowIds.add(row.id!);
  } else {
    expandedRowIds.delete(row.id!);
  }
  if (!expanded) {
    return;
  }
  delete detailMap[row.id!];
  const result = await getSSPDspSlotDay({
    date: row.date,
    dspSlotId: row.dspSlotId,
  });
  detailMap[row.id!] = result || [];
}

/** 导出表格 */
async function handleExport() {
  const data = await exportDspSlotDay(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: 'DSP预算广告位日期报.xls', source: data });
}

function handleSspSlotIdClick(row: DataDspSlotDayApi.DspSlotDay) {
  if (row.sspSlotId) {
    router.push(`/ssp/slot-info/config/${row.sspSlotId}`);
  }
}

function handleDspNameClick(row: DataDspSlotDayApi.DspSlotDay) {
  if (row.dspSlotId) {
    router.push(`/dsp/dspslotinfo/config/${row.dspSlotId}`);
  }
}

/** 收集当前筛选条件 */
async function getFilterQuery() {
  const formValues = await gridApi.formApi.getValues();
  const query: Record<string, string | number> = {};
  if (formValues.companyId) {
    query.companyId = formValues.companyId;
  }
  if (formValues.productId) {
    query.productId = formValues.productId;
  }
  if (formValues.osType) {
    query.osType = formValues.osType;
  }
  if (formValues.dspSlotId) {
    query.dspSlotId = formValues.dspSlotId;
  }
  if (formValues.dspSlotCode) {
    query.dspSlotCode = formValues.dspSlotCode;
  }
  if (formValues.sspSlotId) {
    query.sspSlotId = formValues.sspSlotId;
  }
  return query;
}

/** 当前已在日报表 */
function handleDayReport() {
  // 已在日报表页
}

/** 跳转小时报表，小时页主表加载 getDspSlotHourPage */
async function handleHourReport() {
  router.push({
    name: 'DataDspSlotHour',
    query: await getFilterQuery(),
  });
}

function handleChartReport() {
  message.info('查看折线图功能开发中');
}


const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useGridColumns(),
    expandConfig: {
      padding: true,
    },
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: 10,
    },
    sortConfig: {
      remote: true,
      multiple: false,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) => {
          const params: Record<string, any> = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...buildSortingField(sorts),
          };
          for (const key of Object.keys(formValues)) {
            if (key === 'sspSlotId') continue;
            if (!formValues[key]) continue;
            params[key] = formValues[key];
          }
          // 空格分隔字符串转为数组
          const splitStr = (val: any) => {
            const s = String(val ?? '').trim();
            return s ? s.split(/\s+/) : undefined;
          };
          if (formValues.sspSlotId) {
            params.sspSlotId = splitStr(formValues.sspSlotId);
          }
          return await getDspSlotDayPage(params);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    rowClassName({ row }: { row: DataDspSlotDayApi.DspSlotDay }) {
      return expandedRowIds.has(row.id!) ? 'expanded-row' : '';
    },
    toolbarConfig: {
      refresh: true,
      search: true,
    },
    showFooter: true,
    footerConfig: {},
    footerMethod({ columns }: { columns: any[]; data: any[] }) {
      const sums: any[] = [];
      const sum = todaySum.value;
      columns.forEach((col, colIndex) => {
        const field = col.field;
        if (field === 'dspName') {
          sums[colIndex] = '今日总和';
          return;
        }
        if (!field || !['reqPv', 'discard', 'retPv', 'showPv', 'clickPv', 'discountClickPv', 'discountShowPv', 'dplsuccPv', 'completePv', 'installPv', 'activatePv', 'spend', 'income'].includes(field)) {
          sums[colIndex] = '';
          return;
        }
        sums[colIndex] = sum ? (sum as any)[field] ?? 0 : 0;
      });
      return [sums];
    },
  } as VxeTableGridOptions<DataDspSlotDayApi.DspSlotDay>,
  gridEvents: {
    toggleRowExpand: ({
      expanded,
      row,
    }: {
      expanded: boolean;
      row: DataDspSlotDayApi.DspSlotDay;
    }) => {
      handleExpandChange(row, expanded);
    },
  },
});

onMounted(() => {
  fetchTodaySum();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid>
      <template #toolbar-actions>
        <div class="flex items-center gap-3">
          <div class="text-[1rem] font-bold">预算广告位报表</div>
          <a-button type="primary" @click="handleDayReport">日报表</a-button>
          <a-button @click="handleHourReport">小时报表</a-button>
          <a-button @click="handleChartReport">查看折线图</a-button>
        </div>
      </template>
      <template #sspSlotId-slot="{ row }">
        <span style="cursor: pointer; color: #1890ff" @click="handleSspSlotIdClick(row)">
          {{ row.sspSlotId }}
        </span>
      </template>
      <template #dspName-slot="{ row }">
        <span style="cursor: pointer; color: #1890ff" @click="handleDspNameClick(row)">
          {{ row.dspName }}
        </span>
      </template>
      <template #osType-slot="{ row }">
        <span>{{ osTypeLabel(row.osType) }}</span>
      </template>
      <template #spend-slot="{ row }">
        <span>{{ row.spend != null ? (row.spend / 100).toFixed(2) : '-' }}</span>
      </template>
      <template #income-slot="{ row }">
        <span>{{ row.income != null ? (row.income / 100).toFixed(2) : '-' }}</span>
      </template>
      <template #expand_content="{ row }">
        <VxeTable
          :data="getExpandedDetails(row)"
          border
          :show-overflow="true"
          size="small"
          align="center"
        >
          <VxeColumn title="日期" field="date" width="120" />
          <VxeColumn title="媒体简称" field="sspName" width="150" />
          <VxeColumn title="应用名称" field="appName" width="120" />
          <VxeColumn title="操作系统" width="100">
            <template #default="{ row }">
              <span>{{ osTypeLabel(row.osType) }}</span>
            </template>
          </VxeColumn>
          <VxeColumn title="媒体广告位名称" field="sspSlotId" width="150" />
          <VxeColumn title="预算位ID" field="dspSlotId" width="100" />
          <VxeColumn title="预算广告位ID" field="dspSlotCode" width="150" />
          <VxeColumn title="媒体广告ID" field="sspSlotId" width="120" />
          <VxeColumn title="请求数" field="reqCount" width="100" />
          <VxeColumn title="请求PV" field="reqPv" width="100" />
          <VxeColumn title="丢弃请求" field="discard" width="100" />
          <VxeColumn title="返回PV" field="retPv" width="100" />
          <VxeColumn title="展示PV" field="showPv" width="100" />
          <VxeColumn title="点击PV" field="clickPv" width="100" />
          <VxeColumn title="成本(分)" field="spend" width="100" />
          <VxeColumn title="收入(分)" field="income" width="100" />
          <VxeColumn title="折后点击" field="discountClickPv" width="100" />
          <VxeColumn title="折后展示" field="discountShowPv" width="100" />
          <VxeColumn title="调起成功" field="dplsuccPv" width="100" />
          <VxeColumn title="完成量" field="completePv" width="100" />
          <VxeColumn title="安装量" field="installPv" width="100" />
          <VxeColumn title="激活量" field="activatePv" width="100" />
        </VxeTable>
      </template>
      <template #toolbar-tools>
        <a-button type="primary" @click="handleExport">
          导出
        </a-button>
      </template>
    </Grid>
  </Page>
</template>

<style>
.expanded-row {
  background-color: #E3E6E8 !important;
}
</style>