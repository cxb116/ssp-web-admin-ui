import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace DspLaunchApi {
  /** 媒体预算绑定信息 */
  export interface Launch {
    id: number; // ID
    sspSlotId: number; // 流量广告位Id
    dspSlotId: number; // 预算广告位id
    trafficWeight: number; // 流量权重（最大值100）
    trafficGroup: number; // 流量组，流量1，流量2
    floorPrice: number; // 底价
    dspPayRatio: number; // 预算rtb时的分成系数
    launchTime: number; // 投放时段 1全时段 2 自定义
    launchHour: string; // 投放时间段的时间字符串
    logTime: number; // 日志捕获
    req: number; // 请求次数
    ims: number; // 展现次数
    clk: number; // 点击次数
    pkgTrans: number; // 包透传 1 透传 2 不透传
    createTime?: string; // 创建时间
    updateTime?: string; // 更新时间
  }

  /** 流量组信息 */
  export interface TrafficGroup {
    trafficGroup: number; // 流量组名称（如：流量1=1，流量2=2）
    trafficWeight: number; // 流量权重
    floorPrice: number; // 底价
    dspPayRatio: number; // 预算rtb时的分成系数
    launchTime: number; // 投放时段 1全时段 2 自定义
    launchHour: string; // 投放时间段的时间字符串
    dspSlotIds: number[]; // 绑定的预算广告位ID列表
  }

  /** 流量组预算广告位信息 */
  export interface GroupSlotInfo {
    id: number; // Launch ID
    dspSlotId: number; // 预算广告位id
    dspSlotName?: string; // 预算广告位名称
    dspSlotCode?: string; // 预算方广告位
  }
}

/** 查询媒体预算绑定分页 */
export function getLaunchPage(params: PageParam) {
  return requestClient.get<PageResult<DspLaunchApi.Launch>>(
    '/dsp/launch/page',
    { params },
  );
}

/** 查询媒体预算绑定详情 */
export function getLaunch(id: number) {
  return requestClient.get<DspLaunchApi.Launch>(
    `/dsp/launch/get?id=${id}`,
  );
}

/** 查询媒体sspSlotId 查询 dspLaunch 绑定预算数据 */
export function getLaunchSspSlotIdQuery(sspSlotId: number) {
  return requestClient.get<DspLaunchApi.Launch[]>(
    `/dsp/launch/sspslotid/${sspSlotId}`,
  );
}
/** 查询预算dspSlotInfo查询dspLaunch 绑定媒体数据 */
export function getLaunchDspSlotIdQuery(dspSlotId: number) {
  return requestClient.get<DspLaunchApi.Launch[]>(
    `/dsp/launch/dspslotid/${dspSlotId}`,
  );
}

/** 根据sspSlotId 去dspLaunch 查询绑定的媒体数据 */
export function getLaunchSspSlotList(sspSlotId: number) {
  return requestClient.get<DspLaunchApi.Launch[]>(
    `/dsp/launch/sspslotid_group/${sspSlotId}`,
  );
}

/** 新增媒体预算绑定 */
export function createLaunch(data: DspLaunchApi.Launch) {
  return requestClient.post('/dsp/launch/create', data);
}

/** 修改媒体预算绑定 */
export function updateLaunch(data: DspLaunchApi.Launch) {
  return requestClient.put('/dsp/launch/update', data);
}

/** 删除媒体预算绑定 */
export function deleteLaunch(id: number) {
  return requestClient.delete(`/dsp/launch/delete?id=${id}`);
}

/** 批量删除媒体预算绑定 */
export function deleteLaunchList(ids: number[]) {
  return requestClient.delete(
    `/dsp/launch/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出媒体预算绑定 */
export function exportLaunch(params: any) {
  return requestClient.download('/dsp/launch/export-excel', { params });
}

/** 根据SSP广告位ID查询流量组列表 */
export function getTrafficGroups(sspSlotId: number) {
  return requestClient.get<DspLaunchApi.TrafficGroup[]>(
    `/dsp/launch/traffic-groups/${sspSlotId}`,
  );
}

/** 保存流量组配置 */
export function saveTrafficGroups(sspSlotId: number, data: DspLaunchApi.TrafficGroup[]) {
  return requestClient.post(`/dsp/launch/save-traffic-groups/${sspSlotId}`, data);
}

/** 根据流量组查询绑定的预算广告位列表 */
export function getGroupSlotInfo(sspSlotId: number, trafficGroup: number) {
  return requestClient.get<DspLaunchApi.GroupSlotInfo[]>(
    `/dsp/launch/group-slots/${sspSlotId}/${trafficGroup}`,
  );
}

/** 添加流量组预算广告位 */
export function addGroupSlot(sspSlotId: number, trafficGroup: number, dspSlotId: number) {
  return requestClient.post(`/dsp/launch/add-slot/${sspSlotId}/${trafficGroup}/${dspSlotId}`);
}

/** 移除流量组预算广告位 */
export function removeGroupSlot(id: number) {
  return requestClient.delete(`/dsp/launch/remove-slot/${id}`);
}
