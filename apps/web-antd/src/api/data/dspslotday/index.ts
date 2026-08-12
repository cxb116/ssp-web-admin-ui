import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DataDspSlotDayApi {
  /** DSP预算广告位日期报信息 */
  export interface DspSlotDay {
    id: number; // 主键
    dspSlotId: number; // 预算位ID
    dspSlotCode: string; // 预算广告位ID
    sspSlotId: number; // 媒体广告ID
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
    date: number; // 时间
    createdAt?: number; // 创建时间戳
    discountClickPv?: number; // 折后点击
    discountShowPv?: number; // 折后展示
    dplsuccPv?: number; // 调起成功
    completePv?: number; // 完成量
    installPv?: number; // 安装量
    activatePv?: number; // 激活量
    companyName?: string; // 公司名称
    productName?: string; // 产品名称
    dspName?: string; // 预算位名称
    fillRate?: number; // 填充率
    displayRate?: number; // 展现率
    clickRate?: number; // 点击率
    ecpm?: number; // ecpm
    mediaEcpm?: number; // 媒体ecpm
    ecprm?: number; // ecprm
    mediaEcprm?: number; // 媒体ecprm
  }
}

/** 查询DSP预算广告位日期报分页 */
export function getDspSlotDayPage(params: PageParam) {
  return requestClient.get<PageResult<DataDspSlotDayApi.DspSlotDay>>(
    '/data/dsp-slot-day/page',
    { params },
  );
}

/** 媒体广告位日报：点击主表展开时加载预算广告位子表（参数取自主表 date、sspSlotId） */
export function getSlotInfoPageSsp(params: {
  date?: number;
  sspSlotId?: number;
  dspSlotId?: number;
}) {
  return requestClient.get<DataDspSlotDayApi.DspSlotDay[]>(
    '/data/dsp-slot-day/dsp_ssp_day',
    { params },
  );
}

/** 查询DSP预算广告位日期报详情 */
export function getDspSlotDay(id: number) {
  return requestClient.get<DataDspSlotDayApi.DspSlotDay>(
    `/data/dsp-slot-day/get?id=${id}`,
  );
}

/** 新增DSP预算广告位日期报 */
export function createDspSlotDay(data: DataDspSlotDayApi.DspSlotDay) {
  return requestClient.post('/data/dsp-slot-day/create', data);
}

/** 修改DSP预算广告位日期报 */
export function updateDspSlotDay(data: DataDspSlotDayApi.DspSlotDay) {
  return requestClient.put('/data/dsp-slot-day/update', data);
}

/** 删除DSP预算广告位日期报 */
export function deleteDspSlotDay(id: number) {
  return requestClient.delete(`/data/dsp-slot-day/delete?id=${id}`);
}

/** 批量删除DSP预算广告位日期报 */
export function deleteDspSlotDayList(ids: number[]) {
  return requestClient.delete(
    `/data/dsp-slot-day/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出DSP预算广告位日期报 */
export function exportDspSlotDay(params: any) {
  return requestClient.download('/data/dsp-slot-day/export-excel', { params });
}


/** 导出预算广告位详情 */
export function exportDspSlotDayDetail(params: any) {
  return requestClient.download('/data/dsp-slot-day/export-excel-detail', { params });
}

/** 获取今日总和 */
export function getDspSlotDaySum(date: number) {
  return requestClient.get<DataDspSlotDayApi.DspSlotDay>(
    '/data/dsp-slot-day/sum',
    { params: { date } },
  );
}