import type { PageParam, PageResult } from '@vben/request';
import type { Dayjs } from 'dayjs';

import { requestClient } from '#/api/request';

export namespace DataInputExecApi {
  /** DSP数据导入信息 */
  export interface InputExec {
    id: number; // ID
    companyId?: number; // 预算公司id
    companyName?: string; // 公司名称
    tables: number; // 导入条数
    inputTime: string | Dayjs; // 导入时间
    updateTime?: string | Dayjs; // 更新时间
  }
}

/** 查询DSP数据导入分页 */
export function getInputExecPage(params: PageParam) {
  return requestClient.get<PageResult<DataInputExecApi.InputExec>>(
    '/data/input-exec/page',
    { params },
  );
}

/** 查询DSP数据导入详情 */
export function getInputExec(id: number) {
  return requestClient.get<DataInputExecApi.InputExec>(
    `/data/input-exec/get?id=${id}`,
  );
}

/** 新增DSP数据导入 */
export function createInputExec(data: DataInputExecApi.InputExec) {
  return requestClient.post('/data/input-exec/create', data);
}

/** 修改DSP数据导入 */
export function updateInputExec(data: DataInputExecApi.InputExec) {
  return requestClient.put('/data/input-exec/update', data);
}

/** 删除DSP数据导入 */
export function deleteInputExec(id: number) {
  return requestClient.delete(`/data/input-exec/delete?id=${id}`);
}

/** 批量删除DSP数据导入 */
export function deleteInputExecList(ids: number[]) {
  return requestClient.delete(
    `/data/input-exec/delete-list?ids=${ids.join(',')}`,
  );
}
/** 下载DSP预算数据导入模板 */
export function downExcelInputTemplate(params: {
  id: number;
  inputTime: string;
}) {
  return requestClient.download('/data/input-exec/down-excel-input', {
    params,
  });
}


/** 导出DSP数据导入 */
export function exportInputExec(params: any) {
  return requestClient.download('/data/input-exec/export-excel', { params });
}

/** 导入DSP数据 */
export function importInputExec(file: File, id?: number) {
  return requestClient.upload('/data/input-exec/import', {
    file,
    id,
  });
}