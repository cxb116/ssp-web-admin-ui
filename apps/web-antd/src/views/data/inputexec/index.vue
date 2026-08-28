<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DataInputExecApi } from '#/api/data/inputexec';

import { Page, useVbenModal } from '@vben/common-ui';
import { useRouter } from 'vue-router';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getInputExecPage } from '#/api/data/inputexec';

import { useGridColumns, useGridFormSchema } from './data';
import ImportForm from './modules/import-form.vue';
const router = useRouter();

const [ImportModal, importModalApi] = useVbenModal({
  connectedComponent: ImportForm,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh(result?: unknown) {
  gridApi.query();
  const payload = (result as any)?.result ?? result ?? [];
  const fileName = (result as any)?.fileName || '导入结果';
  const inputExecId = (result as any)?.inputExecId;
  sessionStorage.setItem(
    'input-exec-import-result',
    JSON.stringify({ data: payload, fileName, inputExecId }),
  );
  router.push('/data/input-exec-result');
}

/** 导入数据 */
function handleImport(row: DataInputExecApi.InputExec) {
  importModalApi
    .setData({
      id: row.id,
      companyId: row.companyId,
      companyName: row.companyName,
      inputTime: row.inputTime,
    })
    .open();
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: 10,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getInputExecPage({
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
  } as VxeTableGridOptions<DataInputExecApi.InputExec>,
});
</script>

<template>
  <Page auto-content-height>
    <ImportModal @success="handleRefresh" />
    <Grid table-title="预算数据导入列表">
      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: '导入数据',
              type: 'link',
              icon: ACTION_ICON.UPLOAD,
              onClick: handleImport.bind(null, row),
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
