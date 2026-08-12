<script lang="ts" setup>
import type { DspSlotInfoApi } from '#/api/dsp/dspslotinfo';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createSlotInfo, getSlotInfo, updateSlotInfo } from '#/api/dsp/dspslotinfo';
import { $t } from '#/locales';
import { getCompanyPage } from '#/api/dsp/company';
import { getProduct } from '#/api/dsp/product';
import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<DspSlotInfoApi.SlotInfo>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['预算广告位'])
    : $t('ui.actionTitle.create', ['预算广告位']);
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
    labelWidth: 80,
  },
  layout: 'horizontal',
  schema: useFormSchema(),
  showDefaultActions: false,
});

// 监听表单值变化，自动生成预算位名称
watch(
  () => {
    const vals = formApi.form?.values;
    if (!vals) return null;
    return {
      id: vals.id,
      companyId: vals.companyId,
      productId: vals.productId,
      adScene: vals.adScene,
    };
  },
  async (vals) => {
    if (!vals || vals.id || !vals.companyId || !vals.productId || vals.adScene === undefined) return;
    let companyLabel = '';
    try {
      const companies = await getCompanyPage({ pageNo: 1, pageSize: 1000 });
      const company = (companies.list || []).find((c: any) => c.id === vals.companyId);
      companyLabel = company?.name || '';
    } catch { /* ignore */ }
    let productLabel = '';
    let osTypeLabel = '';
    try {
      const product = await getProduct(vals.productId);
      productLabel = product.name || '';
      const osOpts = getDictOptions(DICT_TYPE.SSP_OS_TYPE, 'number');
      const osItem = osOpts.find((o: any) => o.value === product.osType);
      osTypeLabel = osItem?.label || '';
    } catch { /* ignore */ }
    const adOpts = getDictOptions(DICT_TYPE.SSP_AD_SCENE, 'number');
    const adItem = adOpts.find((o: any) => o.value === vals.adScene);
    const adSceneLabel = adItem?.label || '';
    const newName = [companyLabel, productLabel, osTypeLabel, adSceneLabel]
      .filter(Boolean)
      .join('-');
    if (newName) {
      formApi.setFieldValue('name', newName);
    }
  },
  { deep: true, immediate: false },
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    // 提交表单
    const data = (await formApi.getValues()) as DspSlotInfoApi.SlotInfo;
    try {
      await (formData.value?.id ? updateSlotInfo(data) : createSlotInfo(data));
      // 关闭并提示
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }
    // 加载数据
    const data = modalApi.getData<DspSlotInfoApi.SlotInfo>();
    if (!data || !data.id) {
      return;
    }
    modalApi.lock();
    try {
      formData.value = await getSlotInfo(data.id);
      // 设置到 values
      await formApi.setValues(formData.value);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
  </Modal>
</template>