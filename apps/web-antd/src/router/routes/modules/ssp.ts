import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/ssp/slot-info/config/:id',
    component: () => import('#/views/ssp/sspSlotInfo/config.vue'),
    name: 'SspSlotInfoConfig',
    meta: {
      title: '广告位配置',
      icon: 'ant-design:setting-filled',
      hideInMenu: true,
    },
  },
  {
    path: '/dsp/dspslotinfo/config/:id?',
    component: () => import('#/views/dsp/dspslotinfo/config.vue'),
    name: 'DspSlotInfoConfig',
    meta: {
      title: '预算广告位配置',
      icon: 'ant-design:setting-filled',
      hideInMenu: true,
    },
  },
];

export default routes;