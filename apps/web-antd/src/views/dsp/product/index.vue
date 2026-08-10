<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DspProductApi } from '#/api/dsp/product';

import { Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteProduct,
  exportProduct,
  getProductPage,
} from '#/api/dsp/product';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import ImportForm from './modules/import-form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ImportModal, importModalApi] = useVbenModal({
  connectedComponent: ImportForm,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建预算产品 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 导入预算产品 */
function handleImport() {
  importModalApi.open();
}

/** 编辑预算产品 */
function handleEdit(row: DspProductApi.Product) {
  formModalApi.setData(row).open();
}

/** 删除预算产品 */
async function handleDelete(row: DspProductApi.Product) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    duration: 0,
  });
  try {
    await deleteProduct(row.id!);
    message.success($t('ui.actionMessage.deleteSuccess', [row.id]));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 导出表格 */
async function handleExport() {
  const data = await exportProduct(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: '预算产品.xls', source: data });
}


const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getProductPage({
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
  } as VxeTableGridOptions<DspProductApi.Product>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <ImportModal @success="handleRefresh" />
    <Grid table-title="预算产品列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['预算应用']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['dsp:product:create'],
              onClick: handleCreate,
            },
            {
              label: '导入',
              type: 'primary',
              icon: ACTION_ICON.UPLOAD,
              auth: ['dsp:product:import'],
              onClick: handleImport,
            },
            {
              label: '导出',
              type: 'primary',
              icon: ACTION_ICON.EXPORT,
              auth: ['dsp:product:export'],
              onClick: handleExport,
            },

          ]"
        />
      </template>
      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['dsp:product:update'],
              onClick: handleEdit.bind(null, row),
            },

          ]"
        />
      </template>
    </Grid>
  </Page>
</template>