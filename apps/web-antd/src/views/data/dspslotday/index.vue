<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataDspSlotDayApi } from '#/api/data/dspslotday';

import { reactive, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid, VxeColumn, VxeTable } from '#/adapter/vxe-table';
import {
  exportDspSlotDay,
  getDspSlotDayPage,
} from '#/api/data/dspslotday';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

interface DspSlotDayDetail {
  id: number;
  fieldName: string;
  fieldValue: string;
}

const detailMap = reactive<Record<number, DspSlotDayDetail[]>>({});

/** 清空展开明细缓存 */
function clearDetailMap() {
  for (const id of Object.keys(detailMap)) {
    delete detailMap[Number(id)];
  }
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
  if (!expanded) {
    return;
  }
  delete detailMap[row.id!];
  detailMap[row.id!] = [
    { id: 1, fieldName: '预算位ID', fieldValue: String(row.dspSlotId) },
    { id: 2, fieldName: '预算广告位ID', fieldValue: row.dspSlotCode || '-' },
    { id: 3, fieldName: '媒体广告ID', fieldValue: String(row.sspSlotId) },
    { id: 4, fieldName: '展示PV', fieldValue: String(row.showPv) },
    { id: 5, fieldName: '展示UV', fieldValue: String(row.showUv) },
    { id: 6, fieldName: '点击PV', fieldValue: String(row.clickPv) },
    { id: 7, fieldName: '点击UV', fieldValue: String(row.clickUv) },
    { id: 8, fieldName: '请求PV', fieldValue: String(row.reqPv) },
    { id: 9, fieldName: '请求UV', fieldValue: String(row.reqUv) },
    { id: 10, fieldName: '丢弃请求', fieldValue: String(row.discard) },
    { id: 11, fieldName: '返回PV', fieldValue: String(row.retPv) },
    { id: 12, fieldName: '返回UV', fieldValue: String(row.retUv) },
    { id: 13, fieldName: '成本(分)', fieldValue: String(row.spend) },
    { id: 14, fieldName: '收入(分)', fieldValue: String(row.income) },
    { id: 15, fieldName: '折后点击', fieldValue: String(row.discountClickPv || 0) },
    { id: 16, fieldName: '折后展示', fieldValue: String(row.discountShowPv || 0) },
    { id: 17, fieldName: '调起成功', fieldValue: String(row.dplsuccPv || 0) },
    { id: 18, fieldName: '完成量', fieldValue: String(row.completePv || 0) },
    { id: 19, fieldName: '安装量', fieldValue: String(row.installPv || 0) },
    { id: 20, fieldName: '激活量', fieldValue: String(row.activatePv || 0) },
  ];
}

/** 导出表格 */
async function handleExport() {
  const data = await exportDspSlotDay(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: 'DSP预算广告位日期报.xls', source: data });
}


const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    expandConfig: {
      padding: true,
    },
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDspSlotDayPage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: true,
      search: true,
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
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid table-title="DSP预算广告位日期报列表">
      <template #expand-cell>
        <span style="cursor: pointer; color: #1890ff">子表数据</span>
      </template>
      <template #expand_content="{ row }">
        <VxeTable
          :data="getExpandedDetails(row)"
          border
          :show-overflow="true"
          size="small"
        >
          <VxeColumn title="字段名称" field="fieldName" width="150" />
          <VxeColumn title="字段值" field="fieldValue" min-width="200" />
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