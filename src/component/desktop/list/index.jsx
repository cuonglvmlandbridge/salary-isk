// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, message, Table} from 'antd';
import {getRecords} from '../../../api/list';
import Pagination from '../../common/Pagination';
import FilterList from './filter';
import dayjs from 'dayjs';
import styles from './styles.module.css';
import FormRegister from './formRegister';
import {ID_APP_CUSTOMER} from '../../common/const';
import MainLayout from '../../layout/main';
import CardComponent from '../common/card/CardComponent';
import Cookie from 'js-cookie';
import {formatMoney} from '../../../utils/common';
import ModalAction from '../common/ModalAction';

const DEFAULT_PAGE_SIZE = 10;

const FORMAT_DATE = 'YYYY/MM/DD';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

const staffIdLogin = Cookie.get('staffIdLoginTest');

const FORMAT_DATETIME = 'YYYY/MM/DD HH:mm';

export default function TableList({isAdmin, isMobile}) {

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [record, setRecord] = useState();
  const [params, setParams] = useState({
    app: idApp,
    query: isAdmin ? `limit ${page * DEFAULT_PAGE_SIZE} offset 0` : `id_staff = "${staffIdLogin}" limit ${page * DEFAULT_PAGE_SIZE} offset 0`,
    // fields: ['$id', 'staff', 'date', 'time_in', 'time_out'],
    totalCount: true
  });
  const [fields, setFields] = useState({});

  const fetchRecords = async (payload) => {
    setLoading(true)
    const records = await getRecords(payload);
    const result = records.records.map((val) => {
      let objItem = {};
      for (const item in val) {
        objItem = Object.assign(objItem, {[item]: val[item]['value']});
      }
      return objItem;
    });
    setData(result);
    setTotal(records.totalCount);
    setLoading(false)
  };

  useEffect(() => {
    fetchRecords(params);
  }, [params]);

  useEffect(() => {
    kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': idApp}, function(resp) {
      // success
      setFields(resp.properties);
    }, function(error) {
      // error
    });
  }, []);

  const columns = [
    {
      title: 'No.',
      dataIndex: '$id',
      key: 'No.',
      width: 60,
      align: 'center',
    },
    {
      title: '従業員',
      dataIndex: 'staff',
      key: '従業員',
      width: 120,
      align: 'center',
    },
    {
      title: '月',
      key: '月',
      width: 120,
      dataIndex: 'month',
      align: 'center',
    },
    {
      title: '給与合計',
      key: '給与合計',
      width: 120,
      align: 'center',
      render: (item) => formatMoney(+item.total + +item.total_custom)
    },
    {
      title: '更新者',
      dataIndex: 'user_update',
      key: '更新者',
      width: 120,
      align: 'center',
    },
    {
      title: '更新日時',
      dataIndex: 'Updated_datetime',
      width: 120,
      key: '更新日時',
      align: 'center',
      render: (item) => dayjs(item).format(FORMAT_DATETIME)
    },
    {
      title: '',
      width: 160,
      fixed: 'right',
      key: 'action',
      render: (record) => (
        <div className={styles.btnGroup}>
          <div className={styles.btnTop}>
            <Button type={'text'}
                    onClick={() => {
                      if(isMobile) window.location.href = `${window.location.origin}/k/m/${idApp}/show?record=${record.$id}`
                      else window.location.href = `${window.location.origin}/k/${idApp}/show#record=${record.$id}`
                    }}>
              詳細
            </Button>
            {
              isAdmin &&
              <>
                <Button type={'text'}
                        onClick={() => {
                          if(isMobile) window.location.href = `${window.location.origin}/k/m/${idApp}/show?record=${record.$id}#mode=edit`
                          else window.location.href = `${window.location.origin}/k/${idApp}/show#record=${record.$id}&mode=edit`
                        }
                        }>
                  編集
                </Button>
                <Button type={'text'}
                        onClick={() => {
                          setShowModal(true);
                          setRecord(record)
                        }}>
                  削除
                </Button>
              </>
            }
          </div>
        </div>
      )
    },
  ];

  const handleChangePage = (val) => {
    let queryIndex = params.query.indexOf('limit');
    let newQuery = params.query.substring(0, queryIndex);
    setPage(val);
    setParams({
      ...params,
      query: newQuery + `limit ${DEFAULT_PAGE_SIZE} offset ${(val - 1) * DEFAULT_PAGE_SIZE}`
    });
  };

  const onFinish = (payload) => {
    let queryString = '';

    let arrFilter = [];

    if (payload.staff) {
      arrFilter.push(`staff like "${payload.staff}"`);
    }
    if (payload.month) {
      arrFilter.push(`month = "${dayjs(payload.month).format('YYYY/MM')}"`);
    }
    if (arrFilter?.length > 1) {
      queryString = arrFilter.join('and ');
    } else {
      queryString = arrFilter.join(' ');
    }

    setParams({
      ...params,
      query: queryString + `limit ${page * DEFAULT_PAGE_SIZE} offset 0`
    });
  };

  const handleDelete = (record) => {
    let body = {
      'app': idApp,
      'ids': [record.$id]
    };

    kintone.api(kintone.api.url('/k/v1/records', true), 'DELETE', body, function(resp) {
      fetchRecords(params);
      message.success('削除しました!')
      setShowModal(false)
    }, function(error) {
      // error
      console.log(error);
    });
  }

  return (
    <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
      <CardComponent
        title={'給与計算'}
        btnRight={isAdmin && '新規登録'}
        onClickRight={() => {
          if(isMobile) window.location.href = `${window.location.origin}/k/m/${idApp}/edit`
          else window.location.href = `${window.location.origin}/k/${idApp}/edit`
        } }
      >
        {
          isAdmin && <FilterList onFinish={onFinish} fields={fields}/>
        }
        <Table dataSource={data} columns={columns} pagination={false} loading={loading} scroll={{x: 900}}/>
        {
          isAdmin && <Pagination total={total} page={page} onChangePage={handleChangePage} defaultPageSize={DEFAULT_PAGE_SIZE}/>
        }
      </CardComponent>

      {
        showModal &&
        <ModalAction
          title={'給与を削除する'}
          visible={showModal}
          setVisible={setShowModal}
          width={450}
          handleClickOk={() => handleDelete(record)}
        >
          削除してもよろしいでしょうか。
        </ModalAction>
      }
    </MainLayout>
  );
}