import {message} from 'antd';
import {ID_APP_CUSTOMER_COME, ID_APP_REGISTER, ID_APP_SETTING} from '../component/common/const';

export const getRecords = async (params) => {
  const res = await kintone.api(
    kintone.api.url("/k/v1/records", true),
    "GET", params);
  return res;
};

export const addRecord = async (body, onSuccess, onFail) => {
  kintone.api(kintone.api.url('/k/v1/record', true), 'POST', body, function(resp) {
    // success
    onSuccess && onSuccess(resp)
  }, function(error) {
    // error
    onFail && onFail(error)
  });
};

export const updateRecord = async (body, onSuccess) => {
  kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function(resp) {
    // success
    onSuccess && onSuccess(resp)
  }, function(error) {
    // error
    console.log(error);
  });
};


export function fetchAllRecordsRegister(date, idStaff, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    'app' : ID_APP_REGISTER,
    'query': `date like "${date}" and id_staff = "${idStaff}" limit ${limit} offset ${offset}`,
    'fields': ['time_in', 'time_out', 'date']
  }
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsRegister(date, idStaff,offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

export function fetchAllRecordsWorking(idStaff, month, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    'app' : ID_APP_CUSTOMER_COME,
    'query': `time_start like "${month}" and time_end != "" limit ${limit} offset ${offset}`,
    'fields' : ['id_staff_tip', 'revenue', 'time_start', 'customer']
  }
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsWorking(idStaff, month,offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

export function fetchAllRecordsSetting(month, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    'app' : ID_APP_SETTING,
    'query': `month = "${month}" limit ${limit} offset ${offset}`,
  }
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsSetting(month,offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}
