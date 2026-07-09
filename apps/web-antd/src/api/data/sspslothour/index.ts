import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DataSspSlotHourApi {
  /** DSP-SSP广告位报信息 */
  export interface SspSlotHour {
    id: number; // 主键
    mediaId?: number; // 媒体用户Id
    appId?: number; // 应用ID
    sspSlotId?: number; // SSP广告位ID
    dspSlotId?: number; // DSP广告位ID
    dspSlotCode?: string; // 预算广告位编号
    showPv: number; // 展示PV
    showUv: number; // 展示UV
    clickPv: number; // 点击PV
    clickUv: number; // 点击UV
    reqPv: number; // 请求PV
    reqCount: number; // 请求数
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
    date: number; // 时间 yyyyMMddHH
    createdAt: number; // 创建时间戳
  }
}

/** 查询DSP-SSP广告位报分页 */
export function getSspSlotHourPage(params: PageParam) {
  return requestClient.get<PageResult<DataSspSlotHourApi.SspSlotHour>>(
    '/data/ssp-slot-hour/page',
    { params },
  );
}

/** 查询DSP-SSP广告位报详情 */
export function getSspSlotHour(id: number) {
  return requestClient.get<DataSspSlotHourApi.SspSlotHour>(
    `/data/ssp-slot-hour/get?id=${id}`,
  );
}

/** 新增DSP-SSP广告位报 */
export function createSspSlotHour(data: DataSspSlotHourApi.SspSlotHour) {
  return requestClient.post('/data/ssp-slot-hour/create', data);
}

/** 修改DSP-SSP广告位报 */
export function updateSspSlotHour(data: DataSspSlotHourApi.SspSlotHour) {
  return requestClient.put('/data/ssp-slot-hour/update', data);
}

/** 删除DSP-SSP广告位报 */
export function deleteSspSlotHour(id: number) {
  return requestClient.delete(`/data/ssp-slot-hour/delete?id=${id}`);
}

/** 批量删除DSP-SSP广告位报 */
export function deleteSspSlotHourList(ids: number[]) {
  return requestClient.delete(
    `/data/ssp-slot-hour/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出DSP-SSP广告位报 */
export function exportSspSlotHour(params: any) {
  return requestClient.download('/data/ssp-slot-hour/export-excel', { params });
}