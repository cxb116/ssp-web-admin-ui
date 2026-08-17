<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataSspSlotHourApi } from '#/api/data/sspslothour';

import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid, VxeColumn, VxeTable } from '#/adapter/vxe-table';
import {
  getSspSlotHourPage,
  getSSPDspSlotHour,
} from '#/api/data/sspslothour';

import { useGridColumns, useGridFormSchema } from './data';

const route = useRoute();
const router = useRouter();

/** 操作系统类型映射 */
const osTypeMap: Record<number, string> = { 1: 'Android', 2: 'iOS' };
function osTypeLabel(val?: number): string {
  if (val == null) return '';
  return osTypeMap[val] || String(val);
}

/** 从路由 query 读取初始筛选条件 */
function getInitialFormValues() {
  const query = route.query;
  const formValues: Record<string, any> = {};
  if (query.mediaId) {
    formValues.mediaId = Number(query.mediaId);
  }
  if (query.appId) {
    formValues.appId = Number(query.appId);
  }
  if (query.sspName) {
    formValues.sspName = query.sspName;
  }
  if (query.sspSlotId) {
    formValues.sspSlotId = Number(query.sspSlotId);
  }
  if (query.dspSlotId) {
    formValues.dspSlotId = Number(query.dspSlotId);
  }
  if (query.dspSlotCode) {
    formValues.dspSlotCode = String(query.dspSlotCode);
  }
  if (query.osType) {
    formValues.osType = Number(query.osType);
  }
  return formValues;
}

const initialFormValues = getInitialFormValues();

const detailMap = reactive<Record<number, DataSspSlotHourApi.SspSlotHour[]>>({});

/** 记录当前展开的主表行 ID */
const expandedRowIds = reactive(new Set<number>());

function clearDetailMap() {
  for (const id of Object.keys(detailMap)) {
    delete detailMap[Number(id)];
  }
  expandedRowIds.clear();
}

function getExpandedDetails(row: DataSspSlotHourApi.SspSlotHour) {
  return detailMap[row.id!] || [];
}

/** 展开主表行时，调用 getSSPDspSlotHour 加载子表数据 */
async function handleExpandChange(
  row: DataSspSlotHourApi.SspSlotHour,
  expanded: boolean,
) {
  if (expanded) {
    // 互斥展开：收起其它已展开的行，只保留当前行
    gridApi.grid.clearRowExpand();
    gridApi.grid.setRowExpand(row, true);

    clearDetailMap();
    expandedRowIds.add(row.id!);
  } else {
    expandedRowIds.delete(row.id!);
    return;
  }
  // 主表字段：date + sspSlotId
  const result = await getSSPDspSlotHour({
    date: row.date,
    sspSlotId: row.sspSlotId,
  });
  detailMap[row.id!] = Array.isArray(result)
    ? result
    : ((result as any)?.list || []);
}

/** 收集当前筛选条件 */
async function getFilterQuery() {
  const formValues = await gridApi.formApi.getValues();
  const query: Record<string, string | number> = {};
  if (formValues.mediaId) {
    query.mediaId = formValues.mediaId;
  }
  if (formValues.appId) {
    query.appId = formValues.appId;
  }
  if (formValues.sspName) {
    query.sspName = formValues.sspName;
  }
  if (formValues.sspSlotId) {
    query.sspSlotId = formValues.sspSlotId;
  }
  if (formValues.dspSlotId) {
    query.dspSlotId = formValues.dspSlotId;
  }
  if (formValues.dspSlotCode) {
    query.dspSlotCode = formValues.dspSlotCode;
  }
  if (formValues.osType) {
    query.osType = formValues.osType;
  }
  return query;
}

/** 跳转日报表 */
async function handleDayReport() {
  router.push({
    name: 'DataSspSlotDay',
    query: await getFilterQuery(),
  });
}

/** 当前已在小时报表 */
function handleHourReport() {
  // 已在小时报表页
}

function handleChartReport() {
  message.info('折线报表功能开发中');
}

function handleSspSlotIdClick(row: DataSspSlotHourApi.SspSlotHour) {
  if (row.sspSlotId) {
    router.push(`/ssp/slot-info/config/${row.sspSlotId}`);
  }
}

/** 全量数据总和 */
const allDataSum = ref<Record<string, number>>({});

const numericSumFields = ['reqPv', 'discard', 'retPv', 'showPv', 'clickPv', 'fillRate', 'displayRate', 'clickRate', 'discountClickPv', 'discountShowPv', 'dplsuccPv', 'completePv', 'installPv', 'activatePv', 'mediaEcpm', 'ecpm', 'mediaEcprm', 'ecprm', 'spend', 'income'];

async function fetchAllDataSum(formValues: Record<string, any>) {
  const params: Record<string, any> = {
    pageNo: 1,
    pageSize: 1000,
  };
  for (const key of Object.keys(formValues)) {
    if (key === 'date' || key === 'sspSlotId' || key === 'dspSlotId') continue;
    if (!formValues[key]) continue;
    params[key] = formValues[key];
  }
  // 时间：8位=全天(YYYYMMDD)，10位=指定小时(YYYYMMDDHH)
  if (formValues.date) {
    const dateStr = String(formValues.date);
    if (dateStr.length === 8) {
      const dateNum = Number(dateStr);
      params.date = [dateNum * 100, dateNum * 100 + 23];
    } else {
      params.date = [Number(dateStr)];
    }
  }
  const splitNum = (val: any) => {
    const s = String(val ?? '').trim();
    return s ? s.split(/\s+/).map(Number).filter((n) => !isNaN(n)) : undefined;
  };
  if (formValues.sspSlotId) {
    params.sspSlotId = splitNum(formValues.sspSlotId);
  }
  if (formValues.dspSlotId) {
    params.dspSlotId = splitNum(formValues.dspSlotId);
  }
  try {
    const res = await getSspSlotHourPage(params);
    const rows = (res as any).rows || (res as any).list || [];
    const sum: Record<string, number> = {};
    numericSumFields.forEach((f) => { sum[f] = 0; });
    rows.forEach((row: any) => {
      numericSumFields.forEach((f) => {
        sum[f] += Number(row[f]) || 0;
      });
    });
    allDataSum.value = sum;
  } catch {
    // ignore
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    ...(Object.keys(initialFormValues).length > 0
      ? { initialValues: initialFormValues }
      : {}),
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
      remote: false,
      multiple: false,
    },
    proxyConfig: {
      sort: false,
      ajax: {
        query: async ({ page }, formValues) => {
          clearDetailMap();
          const params: Record<string, any> = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
          };
          for (const key of Object.keys(formValues)) {
            if (key === 'date' || key === 'sspSlotId' || key === 'dspSlotId') continue;
            if (!formValues[key]) continue;
            params[key] = formValues[key];
          }
          // 时间：8位=全天(YYYYMMDD)，10位=指定小时(YYYYMMDDHH)
          if (formValues.date) {
            const dateStr = String(formValues.date);
            if (dateStr.length === 8) {
              const dateNum = Number(dateStr);
              params.date = [dateNum * 100, dateNum * 100 + 23];
            } else {
              params.date = [Number(dateStr)];
            }
          }
          // 空格分隔字符串转为数组
          const splitNum = (val: any) => {
            const s = String(val ?? '').trim();
            return s ? s.split(/\s+/).map(Number).filter((n) => !isNaN(n)) : undefined;
          };
          if (formValues.sspSlotId) {
            params.sspSlotId = splitNum(formValues.sspSlotId);
          }
          if (formValues.dspSlotId) {
            params.dspSlotId = splitNum(formValues.dspSlotId);
          }
          // 并行加载分页数据和全量总和，确保 footer 渲染前数据就绪
          const [result] = await Promise.all([
            getSspSlotHourPage(params),
            fetchAllDataSum(formValues),
          ]);
          return result;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    rowClassName({ row }: { row: DataSspSlotHourApi.SspSlotHour }) {
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
      columns.forEach((col, colIndex) => {
        const field = col.field;
        if (field === 'date') {
          sums[colIndex] = '合计';
          return;
        }
        if (allDataSum.value[field] !== undefined) {
          sums[colIndex] = allDataSum.value[field];
        } else {
          sums[colIndex] = '';
        }
      });
      return [sums];
    },
  } as VxeTableGridOptions<DataSspSlotHourApi.SspSlotHour>,
  gridEvents: {
    toggleRowExpand: ({
      expanded,
      row,
    }: {
      expanded: boolean;
      row: DataSspSlotHourApi.SspSlotHour;
    }) => {
      handleExpandChange(row, expanded);
    },
  },
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <div class="flex items-center gap-3">
          <div class="text-[1rem] font-bold">媒体广告位报表</div>
          <a-button @click="handleDayReport">日报表</a-button>
          <a-button type="primary" @click="handleHourReport">小时报表</a-button>
          <a-button @click="handleChartReport">折线报表</a-button>
        </div>
      </template>
      <template #sspSlotId-slot="{ row }">
        <span
          style="cursor: pointer; color: #1890ff"
          @click="handleSspSlotIdClick(row)"
        >
          {{ row.sspSlotId }}
        </span>
      </template>
      <template #spend-slot="{ row }">
        <span>{{ row.spend != null ? (row.spend / 100).toFixed(2) : '-' }}</span>
      </template>
      <template #income-slot="{ row }">
        <span>{{ row.income != null ? (row.income / 100).toFixed(2) : '-' }}</span>
      </template>
      <template #mediaName-slot="{ row }">
        <span>{{ row.mediaName || '-' }}</span>
      </template>
      <template #appName-slot="{ row }">
        <span>{{ row.appName || '-' }}</span>
      </template>
      <template #osType-slot="{ row }">
        <span>{{ osTypeLabel(row.osType) }}</span>
      </template>
      <template #expand_content="{ row }">
        <VxeTable
          :data="getExpandedDetails(row)"
          border
          :show-overflow="true"
          size="small"
          align="center"
        >
          <VxeColumn title="时间" field="date" width="120" :formatter="({ cellValue }: { cellValue: any }) => {
            if (!cellValue) return '';
            const str = String(cellValue);
            // 2026072411 -> 11:00
            if (str.length === 10 && /^\d{10}$/.test(str)) return str.slice(8) + ':00';
            return str;
          }" />
          <VxeColumn title="公司名称" field="companyName" width="120" />
          <VxeColumn title="产品名称" field="productName" width="150" />
          <VxeColumn title="预算位名称" field="dspName" width="150" />
          <VxeColumn title="预算位ID" field="dspSlotId" width="100" />
          <VxeColumn title="预算方广告位ID" field="dspSlotCode" width="150" />
          <VxeColumn title="媒体广告ID" field="sspSlotId" width="120" />
          <VxeColumn title="请求PV" field="reqPv" width="100" />
          <VxeColumn title="丢弃请求" field="discard" width="100" />
          <VxeColumn title="返回PV" field="retPv" width="100" />
          <VxeColumn title="展示PV" field="showPv" width="100" />
          <VxeColumn title="点击PV" field="clickPv" width="100" />
          <VxeColumn title="填充率" field="fillRate" width="100" :formatter="({ cellValue }: { cellValue: any }) => cellValue != null ? `${cellValue}%` : '-'" />
          <VxeColumn title="展现率" field="displayRate" width="100" :formatter="({ cellValue }: { cellValue: any }) => cellValue != null ? `${cellValue}%` : '-'" />
          <VxeColumn title="点击率" field="clickRate" width="100" :formatter="({ cellValue }: { cellValue: any }) => cellValue != null ? `${cellValue}%` : '-'" />
          <VxeColumn title="折后点击" field="discountClickPv" width="100" />
          <VxeColumn title="折后展示" field="discountShowPv" width="100" />
          <VxeColumn title="调起成功" field="dplsuccPv" width="100" />
          <VxeColumn title="完成量" field="completePv" width="100" />
          <VxeColumn title="安装量" field="installPv" width="100" />
          <VxeColumn title="激活量" field="activatePv" width="100" />
          <VxeColumn title="媒体ecpm" field="mediaEcpm" width="100" />
          <VxeColumn title="ecpm" field="ecpm" width="100" />
          <VxeColumn title="媒体ecprm" field="mediaEcprm" width="100" />
          <VxeColumn title="ecprm" field="ecprm" width="100" />
          <VxeColumn title="成本(元)" field="spend" width="100" :formatter="({ cellValue }: { cellValue: any }) => cellValue != null ? (cellValue / 100).toFixed(2) : '-'" />
          <VxeColumn title="收入(元)" field="income" width="100" :formatter="({ cellValue }: { cellValue: any }) => cellValue != null ? (cellValue / 100).toFixed(2) : '-'" />
        </VxeTable>
      </template>
      <template #toolbar-tools>
        <a-button type="primary" disabled> 导出 </a-button>
      </template>
    </Grid>
  </Page>
</template>

<style>
.expanded-row {
  background-color: #E3E6E8 !important;
}
</style>
