import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DspSlotInfoApi {
  /** 预算广告位信息 */
  export interface SlotInfo {
    id: number; // ID
    dspSlotCode?: string; // 预算方广告位
    productId?: number; // 产品ID
    companyId?: number; // 公司ID
    name?: string; // 广告位名称
    osType?: number; // 操作系统
    dspPayType?: number; // 结算方式
    adScene?: number; // 广告场景
    dspAppKey: string; // 预算方APPKEY
    dspAppSecret: string; // 预算方APPSECRET
    dspAppId: string; // 预算方APPID
    dspAppPkg: string; // 应用包名
    dspAppVer: string; // 应用版本号
    dspAppStoreVer: string; // 应用商店版本号
    priceEncryptKey: string; // 价格加密KEY
    dspAppStoreLink: string; // 应用商店地址
  }
}

/** 查询预算广告位分页 */
export function getSlotInfoPage(params: PageParam) {
  return requestClient.get<PageResult<DspSlotInfoApi.SlotInfo>>(
    '/dsp/slot-info/page',
    { params },
  );
}

/** 查询绑定预算条数 */
export function getSlotInfoPageInfo(params: PageParam) {
  return requestClient.get<PageResult<DspSlotInfoApi.SlotInfo>>(
    '/dsp/slot-info/page-info',
    { params },
  );
}


/** 查询预算广告位详情 */
export function getSlotInfo(id: number) {
  return requestClient.get<DspSlotInfoApi.SlotInfo>(
    `/dsp/slot-info/get?id=${id}`,
  );
}

/** 新增预算广告位 */
export function createSlotInfo(data: DspSlotInfoApi.SlotInfo) {
  return requestClient.post('/dsp/slot-info/create', data);
}

/** 修改预算广告位 */
export function updateSlotInfo(data: DspSlotInfoApi.SlotInfo) {
  return requestClient.put('/dsp/slot-info/update', data);
}

/** 删除预算广告位 */
export function deleteSlotInfo(id: number) {
  return requestClient.delete(`/dsp/slot-info/delete?id=${id}`);
}

/** 批量删除预算广告位 */
export function deleteSlotInfoList(ids: number[]) {
  return requestClient.delete(
    `/dsp/slot-info/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出预算广告位 */
export function exportSlotInfo(params: any) {
  return requestClient.download('/dsp/slot-info/export-excel', { params });
}

/** 下载预算广告位导入模板 */
export function importSlotInfoTemplate() {
  return requestClient.download('/dsp/slot-info/get-import-template');
}

/** 导入预算广告位 */
export function importSlotInfo(file: File, updateSupport: boolean) {
  return requestClient.upload('/dsp/slot-info/import', {
    file,
    updateSupport,
  });
}