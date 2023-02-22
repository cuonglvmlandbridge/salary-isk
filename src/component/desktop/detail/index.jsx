// eslint-disable-next-line no-unused-vars
import React, {useMemo, useRef} from 'react';
import MainLayout from '../../layout/main';
import styles from './styles.module.css';
import CardComponent from '../common/card/CardComponent';
import {formatMoney} from '../../../utils/common';
import {Table, Button} from 'antd';
import dayjs from 'dayjs';
import ReactToPrint from "react-to-print";

const FORMAT_DATE = 'YYYY/MM/DD';

const convertData = (arr) => {
  const data = arr.map(val => {
    let objItem = {};
    for (const key in val) {
      objItem = Object.assign(objItem, {
        [key]: val[key]['value']
      });
    }
    return objItem;
  });

  return data;
};

export default function Detail({
  record,
  isAdmin,
  isMobile
}) {

  const detail = JSON.parse(record.detail.value);
  const salary_custom =  record?.salary_custom?.value ? JSON.parse(record.salary_custom.value) : [];
  let componentRef = useRef();

  console.log(salary_custom)

  const renderTableWorking = useMemo(() => {
    const columns = [
      {
        title: '日付',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
      },
      {
        title: '出勤時間',
        dataIndex: 'time_in',
        key: '出勤時間',
        align: 'center',
      },
      {
        title: '退勤時間',
        dataIndex: 'time_out',
        key: '退勤時間',
        align: 'center',
      },
    ];

    const data = convertData(detail.working);
    return !!detail.working.length &&
      (
        <div className={styles.table}>
          <div className={styles.label}>出勤履歴</div>
          <Table dataSource={data} columns={columns} pagination={false}/>
        </div>
      );
  }, [detail]);

  const renderTableTips = useMemo(() => {
    const columns = [
      {
        title: '日付',
        dataIndex: 'time_start',
        key: 'date',
        align: 'center',
        render: (item) => dayjs(item).format(FORMAT_DATE)
      },
      {
        title: 'お客様',
        dataIndex: 'customer',
        key: 'お客様',
        align: 'center',
      },
      {
        title: '売上',
        dataIndex: 'revenue',
        key: '売上',
        align: 'center',
        render: (item) => formatMoney(item)
      },
      {
        title: 'バック金額',
        dataIndex: 'revenue',
        key: 'バック金額',
        align: 'center',
        render: (item) => formatMoney(item * detail.rateTips)
      },
    ];

    const data = convertData(detail.tips);
    return !!detail.tips.length &&
      (
        <div className={styles.table}>
          <div className={styles.label}>担当バック内訳</div>
          <Table dataSource={data} columns={columns} pagination={false}/>
        </div>
      );
  }, [detail]);

  console.log(detail)

  const renderTableBonus = useMemo(() => {

    const data = [...new Set(detail.bonusDay.map(val => JSON.stringify(val)))].map(val2 => JSON.parse(val2))
    const columns = [
      {
        title: '日付',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
      },
      {
        title: '大入り・小入り',
        dataIndex: 'type',
        key: '大入り・小入り',
        align: 'center',
      },
    ];

    return !!detail.bonusDay.length &&
      (
        <div className={styles.table}>
          <div className={styles.label}>大入り・小入り内訳</div>
          <Table dataSource={data} columns={columns} pagination={false}/>
        </div>
      );
  }, [detail]);

  return (
    <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
      <CardComponent
        title={'給与計算詳細'}
        btnLeft={'戻る'}
        onClickLeft={() => window.history.back()}
        btnRight={<ReactToPrint
          trigger={() => <Button   className={styles.btnPrint} type={'primary'}>印刷</Button>}
          content={() => componentRef}
        />}
      >
        <div className={styles.detail} ref={(el) => (componentRef = el)}>
          <div className={styles.month}>
            {record.month.value}
          </div>
          <div className={styles.staff}>
            <div className={styles.item}>
              <span className={styles.label}>従業員名:</span>
              <span className={styles.value}>
                                {record.staff.value}
                            </span>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>時給:</span>
              <span className={styles.value}>
                {
                  formatMoney(detail?.salaryByHour || 0)
                }
                </span>
            </div>
          </div>
          {
            JSON.parse(record.detail_salary.value).map((val, ind) => (
              <div className={styles.item} key={val.text}>
                <span className={styles.label}>{val.text}:</span>
                <span className={styles.value}>{val.value}</span>
              </div>
            ))
          }
          {
            salary_custom.length > 0 && salary_custom.map((val, ind) => (
              <div className={styles.item} key={val.text}>
                <span className={styles.label}>{val.text}:</span>
                <span className={styles.value}>{formatMoney(val.value)}</span>
              </div>
            ))
          }
          <div className={styles.item} style={{'fontWeight' : 'bold', fontSize: '20px'}}>
            <span className={styles.label}>総支給額:</span>
            <span className={styles.value}>
                {formatMoney(+record.total.value + +record.total_custom.value)}
                </span>
          </div>
          {renderTableWorking}
          {renderTableTips}
          {renderTableBonus}
        </div>

      </CardComponent>
    </MainLayout>
  );
}