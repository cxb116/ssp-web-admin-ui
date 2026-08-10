<script lang="ts" setup>
import type { FileType } from 'ant-design-vue/es/upload/interface';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { Button, message, Upload } from 'ant-design-vue';

import {
  downExcelInputTemplate,
  importInputExec,
} from '#/api/data/inputexec';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

const fileList = ref<any[]>([]);
const uploadFile = ref<File | null>(null);
const currentRow = ref<{
  id?: number;
  companyId?: number;
  inputTime?: string;
}>({});

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const data = modalApi.getData<{
      id?: number;
      companyId?: number;
      inputTime?: string;
    }>();
    currentRow.value = {
      id: data?.id,
      companyId: data?.companyId,
      inputTime: data?.inputTime ? String(data.inputTime) : undefined,
    };
    fileList.value = [];
    uploadFile.value = null;
  },
  async onConfirm() {
    if (!uploadFile.value) {
      message.warning('请先选择 Excel 文件');
      return;
    }
    modalApi.lock();
    try {
      await importInputExec(uploadFile.value, currentRow.value.id);
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } finally {
      modalApi.unlock();
    }
  },
});

/** 上传前：阻止自动上传，仅保存文件 */
function beforeUpload(file: FileType) {
  uploadFile.value = file as File;
  fileList.value = [file];
  return false;
}

/** 移除文件 */
function handleRemove() {
  uploadFile.value = null;
  fileList.value = [];
}

/** 下载导入模板 */
async function handleDownload() {
  const companyId = currentRow.value.companyId;
  const inputTime = currentRow.value.inputTime;
  if (companyId == null || !inputTime) {
    message.warning('缺少公司ID或导入时间，无法下载模板');
    return;
  }
  try {
    const data = await downExcelInputTemplate({
      id: companyId,
      inputTime,
    });
    downloadFileFromBlobPart({
      fileName: 'DSP数据导入模板.xls',
      source: data,
    });
  } catch (error) {
    console.error(error);
    message.error('下载导入模板失败');
  }
}
</script>

<template>
  <Modal title="导入数据" class="w-1/3" confirm-text="提交" cancel-text="取消">
    <div class="mx-4 py-2">
      <Upload.Dragger
        :max-count="1"
        accept=".xls,.xlsx"
        :file-list="fileList"
        :before-upload="beforeUpload"
        :on-remove="handleRemove"
      >
        <p class="ant-upload-drag-icon text-4xl text-gray-400">
          📄
        </p>
        <p class="ant-upload-text">点击或拖拽 Excel 文件到此区域上传</p>
        <p class="ant-upload-hint text-gray-400">
          仅支持 .xls / .xlsx 格式
        </p>
      </Upload.Dragger>
    </div>
    <template #prepend-footer>
      <div class="flex flex-auto items-center">
        <Button type="link" @click="handleDownload">下载导入模板</Button>
      </div>
    </template>
  </Modal>
</template>
