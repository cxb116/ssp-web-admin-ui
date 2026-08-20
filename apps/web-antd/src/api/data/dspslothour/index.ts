import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace DataDspSlotHourApi {
  /** DSP预算广告位小时报信息 */
  export interface DspSlotHour {
    id: number; // 主键
    dspSlotId?: number; // 预算位ID
    dspSlotCode?: string; // 预算广告位
    sspSlotId?: number; // SSP slot id
    showPv: number; // 展示PV
    showUv: number; // 展示UV
    clickPv: number; // 点击PV
    clickUv: number; // 点击UV
    reqPv: number; // 请求PV
    reqUv: number; // 请求UV
    discard: number; // 丢弃请求
    retPv: number; // 返回PV
    retUv: number; // 返回UV
    spend: number; // 成本(分)
    income: number; // 收入(分)
    discountClickPv: number; // 折后点击
    discountShowPv: number; // 折后展示
    dplsuccPv: number; // 调起成功
    completePv: number; // 完成量
    installPv: number; // 安装量
    activatePv: number; // 激活量
    date: number; // 时间(yyyyMMdd / yyyyMMddHH)
    createdAt: number; // 创建时间戳
    companyName?: string; // 公司名称
    productName?: string; // 产品名称
    dspName?: string; // 预算位名称
    osType?: number; // 操作系统（关联查询）
    fillRate?: number; // 填充率
    displayRate?: number; // 展现率
    clickRate?: number; // 点击率
    ecpm?: number; // ecpm
    mediaEcpm?: number; // 媒体ecpm
    ecprm?: number; // ecprm
    mediaEcprm?: number; // 媒体ecprm
  }
}

/** 兼容旧引用 */
export type DspSlotHour = DataDspSlotHourApi.DspSlotHour;

/**
 * 小时报表主表分页
 * 点击「小时报表」进入后加载此接口
 */
export function getDspSlotHourPage(params: PageParam) {
  return requestClient.get<PageResult<DataDspSlotHourApi.DspSlotHour>>(
    '/data/dsp-slot-hour/page',
    { params },
  );
}

/**
 * 点击主表展开时，加载子表数据
 * 按预算位ID + 时间查询关联的 SSP 小时明细
 */
export function getSSPDspSlotHour(params: {
  dspSlotId?: number;
  date?: number;
}) {
  return requestClient.get('/data/ssp-slot-hour/dsp_ssp_hour', {
    params,
  });
}

/** 查询DSP预算广告位小时报详情 */
export function getDspSlotHour(id: number) {
  return requestClient.get<DataDspSlotHourApi.DspSlotHour>(
    `/data/dsp-slot-hour/get?id=${id}`,
  );
}

/** 导出DSP预算广告位小时报 */
export function exportDspSlotHour(params: any) {
  return requestClient.download('/data/dsp-slot-hour/export-excel', { params });
}

/** 导出预算广告位小时报详情（与表格表头一致） */
export function exportDspSlotHourDetail(params: any) {
  return requestClient.download('/data/dsp-slot-hour/export-excel-detail', { params });
}

/** 兼容旧命名空间引用 */
export const DspSlotHourApi = {
  getDspSlotHourPage,
  getSSPDspSlotHour,
  getDspSlotHour,
  exportDspSlotHour,
  exportDspSlotHourDetail,
};

/** 小时报表折线图（单天0~23点按小时聚合） */
export function getDspSlotHourTrend(params: any) {
  return requestClient.get<any[]>(
    '/data/dsp-slot-hour/trend',
    { params },
  );
}
