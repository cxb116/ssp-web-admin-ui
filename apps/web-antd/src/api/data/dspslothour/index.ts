import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

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
  }

// DSP预算广告位小时报 API
export const DspSlotHourApi = {
  // 查询DSP预算广告位小时报分页
  getDspSlotHourPage: async (params: any) => {
    return await request.get({ url: `/data/dsp-slot-hour/page`, params })
  },

  // 查询DSP预算广告位小时报详情
  getDspSlotHour: async (id: number) => {
    return await request.get({ url: `/data/dsp-slot-hour/get?id=` + id })
  },

  // 新增DSP预算广告位小时报
  createDspSlotHour: async (data: DspSlotHour) => {
    return await request.post({ url: `/data/dsp-slot-hour/create`, data })
  },

  // 修改DSP预算广告位小时报
  updateDspSlotHour: async (data: DspSlotHour) => {
    return await request.put({ url: `/data/dsp-slot-hour/update`, data })
  },

  // 删除DSP预算广告位小时报
  deleteDspSlotHour: async (id: number) => {
    return await request.delete({ url: `/data/dsp-slot-hour/delete?id=` + id })
  },

  /** 批量删除DSP预算广告位小时报 */
  deleteDspSlotHourList: async (ids: number[]) => {
    return await request.delete({ url: `/data/dsp-slot-hour/delete-list?ids=${ids.join(',')}` })
  },

  // 导出DSP预算广告位小时报 Excel
  exportDspSlotHour: async (params) => {
    return await request.download({ url: `/data/dsp-slot-hour/export-excel`, params })
  }
}