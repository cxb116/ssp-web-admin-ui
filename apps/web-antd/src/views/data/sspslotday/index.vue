<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataSspSlotDayApi } from '#/api/data/sspslotday';

import { reactive } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { useVbenVxeGrid, VxeColumn, VxeTable } from '#/adapter/vxe-table';
import {
  exportSspSlotDay,
  getSspSlotDayPage,
} from '#/api/data/sspslotday';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

interface SspSlotDayDetail {
  id: number;
  fieldName: string;
  fieldValue: string;
}

const detailMap = reactive<Record<number, SspSlotDayDetail[]>>({});

function clearDetailMap() {
  for (const id of Object.keys(detailMap)) {
    delete detailMap[Number(id)];
  }
}

function handleRefresh() {
  clearDetailMap();
  gridApi.query();
}

function getExpandedDetails(row: DataSspSlotDayApi.SspSlotDay) {
  return detailMap[row.id!] || [];
}

async function handleExpandChange(row: DataSspSlotDayApi.SspSlotDay, expanded: boolean) {
  if (!expanded) {
    return;
  }
  delete detailMap[row.id!];
  detailMap[row.id!] = [
    { id: 1, fieldName: '媒体用户Id', fieldValue: String(row.mediaId) },
    { id: 2, fieldName: '应用ID', fieldValue: String(row.appId) },
    { id: 3, fieldName: 'SSP广告位ID', fieldValue: String(row.sspSlotId) },
    { id: 4, fieldName: 'DSP广告位ID', fieldValue: String(row.dspSlotId) },
    { id: 5, fieldName: '预算广告位编号', fieldValue: row.dspSlotCode || '-' },
    { id: 6, fieldName: '展示PV', fieldValue: String(row.showPv) },
    { id: 7, fieldName: '展示UV', fieldValue: String(row.showUv) },
    { id: 8, fieldName: '点击PV', fieldValue: String(row.clickPv) },
    { id: 9, fieldName: '点击UV', fieldValue: String(row.clickUv) },
    { id: 10, fieldName: '请求PV', fieldValue: String(row.reqPv) },
    { id: 11, fieldName: '请求数', fieldValue: String(row.reqCount) },
    { id: 12, fieldName: '请求UV', fieldValue: String(row.reqUv) },
    { id: 13, fieldName: '丢弃请求', fieldValue: String(row.discard) },
    { id: 14, fieldName: '返回PV', fieldValue: String(row.retPv) },
    { id: 15, fieldName: '返回UV', fieldValue: String(row.retUv) },
    { id: 16, fieldName: '成本(分)', fieldValue: String(row.spend) },
    { id: 17, fieldName: '收入(分)', fieldValue: String(row.income) },
    { id: 18, fieldName: '折后点击', fieldValue: String(row.discountClickPv || 0) },
    { id: 19, fieldName: '折后展示', fieldValue: String(row.discountShowPv || 0) },
    { id: 20, fieldName: '调起成功', fieldValue: String(row.dplsuccPv || 0) },
    { id: 21, fieldName: '完成量', fieldValue: String(row.completePv || 0) },
    { id: 22, fieldName: '安装量', fieldValue: String(row.installPv || 0) },
    { id: 23, fieldName: '激活量', fieldValue: String(row.activatePv || 0) },
    { id: 24, fieldName: '创建时间戳', fieldValue: String(row.createdAt || 0) },
  ];
}

async function handleExport() {
  const data = await exportSspSlotDay(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: '媒体广告位报表.xls', source: data });
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
          return await getSspSlotDayPage({
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
  } as VxeTableGridOptions<DataSspSlotDayApi.SspSlotDay>,
  gridEvents: {
    toggleRowExpand: ({
      expanded,
      row,
    }: {
      expanded: boolean;
      row: DataSspSlotDayApi.SspSlotDay;
    }) => {
      handleExpandChange(row, expanded);
    },
  },
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid table-title="媒体广告位报表">
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