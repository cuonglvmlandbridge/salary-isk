// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Spin} from 'antd';
import {MinusCircleTwoTone, PlusCircleTwoTone, SaveOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import {convertHour, fetchAllRecordsCustomer, formatMoney} from '../../../../utils/common';
import MainLayout from '../../../layout/main';
import {addRecord, fetchAllRecordsRegister, fetchAllRecordsSetting, fetchAllRecordsWorking, updateRecord} from '../../../../api/list';
import CardComponent from '../../common/card/CardComponent';
import {ID_APP_STAFF} from '../../../common/const';

import styles from './styles.module.css';
import Cookie from 'js-cookie';

const idStaffApp = '6';

const FORMAT_DATE_TIME = 'YYYY/MM/DD';
const FORMAT_MONTH = 'YYYY/MM';
const FORMAT_TIME = 'HH:mm';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

const userISK = Cookie.get('nameUserLogin');

function totalRevenueByDay(arr) {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i];
    if (!result[obj.key]) {
      result[obj.key] = +obj.value;
    } else {
      result[obj.key] += +obj.value;
    }
  }
  return result;
}

export default function FormRegister({
  type,
  event,
  isAdmin,
  isMobile
}) {

  const [form] = Form.useForm();
  const [staff, setStaff] = useState([]);
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSalary, setTotalSalary] = useState(0);
  const [customs, setCustoms] = useState([]);
  const [detail, setDetail] = useState({});

  const renderModalContentDetail = (data) => {
    return (
      <Row gutter={50} className={styles.formItem}>
        {data.map((el, index2) => (
          <Col className="gutter-row" span={24} key={`${el?.formItemProps?.name}-${index2}`}>
            <Form.Item {...el.formItemProps}>
              {el.renderInput()}
            </Form.Item>
          </Col>
        ))}
      </Row>
    );
  };

  const onFinish = (payload) => {
    const staffInfo = JSON.parse(payload.staff);
    const totalCustom = customs.map(val => +val.value).reduce((a, b) => a + b, 0);
    let body = {
      'app': idApp,
      // 'id': event.record.$id.value,
      'record': {
        'month': {
          'value': dayjs(payload.month).format(FORMAT_MONTH)
        },
        'staff': {
          'value': staffInfo.name
        },
        'id_staff': {
          'value': staffInfo.id
        },
        'detail_salary': {
          'value': JSON.stringify(salary)
        },
        'total': {
          'value': totalSalary
        },
        'total_custom': {
          'value': totalCustom
        },
        'salary_custom': {
          'value': customs?.length > 0 ? JSON.stringify(customs) : ''
        },
        'user_update' : {
          'value': userISK
        }
      }
    };

    if (detail) {
      body.record = {
        ...body.record,
        ...{
          'detail': {
            'value': JSON.stringify(detail)
          }
        }
      };
    }

    if (type === 'edit') {
      body.id = event.record.$id.value;
      updateRecord(body, () => {
        window.location.href = window.location.origin + `/k/${idApp}`;
      });
    } else {
      addRecord(body, () => {
        window.location.href = `${window.location.origin}/k/${idApp}`;
      });
    }
  };

  const registerEdit = [
    {
      formItemProps: {
        label: '計算月',
        name: 'month',
        labelAlign: 'left',
        rules: [{
          required: true,
          message: 'Required'
        }]
      },
      renderInput: () =>
        <DatePicker
          format="YYYY/MM"
          placeholder={''}
          picker={'month'}
          allowClear={false}
        />,
    },
    {
      formItemProps: {
        label: '担当者',
        name: 'staff',
        labelAlign: 'left',
        rules: [{
          required: true,
          message: 'Required'
        }]
      },
      renderInput: () => <Select
        style={{width: 250}}
        options={staff}
        showSearch
      />,
    },
  ];

  const handleAdd = () => {
    let temp = [...customs];
    temp.push({
      text: '',
      value: ''
    });
    setCustoms(temp);
  };

  const handleDelete = (index) => {
    let temp = [...customs];
    form.setFields(
      ['text', 'value']?.map((val) => ({
        name: `field_${temp.length - 1}_${val}`,
        value: '',
      }))
    );
    const newCustoms = temp.filter((val, ind) => ind !== index);
    setCustoms(newCustoms);
    newCustoms.map((x, indexSet) => {
      form.setFields(
        ['text', 'value']?.map((val) => ({
          name: `field_${indexSet}_${val}`,
          value: x[val],
        }))
      );
      return true;
    });
  };

  const handleChange = (data, index, key) => {
    let temp = [...customs];
    temp[index][key] = data;
    setCustoms(temp);
  };

  const renderFormCustom = (index) => {
    const data = [
      {
        formItemProps: {
          label: '項目名',
          name: `field_${index}_text`,
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () => (
          <Input onChange={(e) => handleChange(e.target.value, index, 'text')}/>
        ),
      },
      {
        formItemProps: {
          label: '金額',
          name: `field_${index}_value`,
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () => (
          <InputNumber
            min={1}
            addonAfter="円"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            onChange={(e) => handleChange(e, index, 'value')}
          />
        ),
      },

    ];
    return (
      <Row gutter={50} className={styles.formItem}>
        {data.map((el, index2) => (
          <Col className="gutter-row" span={6} xs={21} sm={10} lg={6} key={`${el?.formItemProps?.name}-${index2}`}>
            <Form.Item {...el.formItemProps} className={styles.contentFormItem}>
              {el.renderInput()}
            </Form.Item>
          </Col>
        ))}

        <MinusCircleTwoTone className={styles.iconDelete} onClick={() => handleDelete(index)}/>
      </Row>
    );
  };

  const onValuesChange = async (item, payload) => {
    if (item.staff || item.month) {
      setLoading(true);
      //lấy info staff được chọn
      let staffInfo = JSON.parse(payload.staff);
      let idStaff = staffInfo.id;
      let month = dayjs(payload.month).format('YYYY/MM');

      // lấy info user, list đăng ký làm việc, list khách đến, và setting thưởng
      const [info, register, customerComes, setting] = await Promise.all([
        await kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
          'app': ID_APP_STAFF,
          'id': idStaff
        }),
        await fetchAllRecordsRegister(month, idStaff),
        await fetchAllRecordsWorking(idStaff, month),
        await fetchAllRecordsSetting(month)
      ]);

      // tổng ngày user làm
      const totalDay = [...new Set(register.map(val => val.date.value))].length;
      // tổng giờ user làm
      const times = register.map(val => {
        const dateExp1 = dayjs(`2000-01-01 ${val.time_in.value}`);
        let dateExp2 = dayjs(`2000-01-01 ${val.time_out.value}`);
        dateExp2 = dateExp1.diff(dateExp2) > 0 ? dayjs(dayjs(dateExp2).add(1, 'day')) : dateExp2;
        const timeDiff = dateExp2.diff(dateExp1);
        return timeDiff;
      });

      console.log(times)
      const hours = convertHour(times.reduce((a, b) => a + b, 0) / 1000);
      const totalTime = hours.time;
      // fee trip
      const feeTrip = info.record.fee_trip.value;
      // total fee trip
      const totalFeeTrip = feeTrip * totalDay;
      // lấy tỉ lệ rate tips của user
      const rate_tips = info.record.rate_tips.value;
      // convert ngày làm việc trong tháng và doanh thu để tính tổng doanh thu thưởng theo ngày cho user
      const daysRevenue = customerComes.map(val => (
        {
          key: [dayjs(val.time_start.value).format(FORMAT_DATE_TIME)],
          value: val.revenue.value
        }
      ));
      // tổng danh thu theo ngày
      const totalRevenue = totalRevenueByDay(daysRevenue);

      // lấy data setting thưởng
      let minVal = 0;
      let maxVal = 0;
      let bonus1 = 0;
      let bonus2 = 0;
      if (setting.length > 0) {
        minVal = +setting[0].min.value;
        maxVal = +setting[0].max.value;
        bonus1 = +setting[0].bonus1.value;
        bonus2 = +setting[0].bonus2.value;
      }

      let totalBonus1 = 0;
      let totalBonus2 = 0;
      // lấy những bản ghi khách đến àm user đi làm trong tháng đó
      const tipsUser = customerComes.filter(val => val.id_staff_tip.value === idStaff);

      // lấy tổng tips
      const totalTip = tipsUser.map(val => +val?.revenue?.value).reduce((a, b) => a + b, 0) * rate_tips / 100;

      //tính tổng thưởng doanh thu theo từng mức
      const arrBonus = [];
      const registerDate = [... new Set(register.map(val => val.date.value))]
      registerDate.forEach((val, ind) => {
        const total = totalRevenue[val] || 0;
        if (total >= minVal && total < maxVal) {
          totalBonus1 += bonus1;
          arrBonus.push({
            date: val,
            type: '小入り'
          });
        } else if (total >= maxVal) {
          totalBonus2 += bonus2;
          arrBonus.push({
            date: val,
            type: '大入り'
          });
        }
      });

      // tổng lương theo cơ bản
      const salaryBase = +((hours.hh + (hours.mm / 60)) * info.record.salary.value).toFixed(0);

      const totalSalaryFinal = salaryBase + totalFeeTrip + totalTip + totalBonus1 + totalBonus2;

      const boardSalary = [
        {
          text: '出勤数',
          value: totalDay
        },
        {
          text: '稼働時間',
          value: totalTime
        },
        {
          text: '時間報酬',
          value: formatMoney(salaryBase || 0)
        },
        {
          text: '往復交通費',
          value: formatMoney(feeTrip || 0)
        },
        {
          text: '月額交通費',
          value: formatMoney(totalFeeTrip || 0)
        },
        {
          text: '担当バック',
          value: formatMoney(totalTip || 0)
        },
        {
          text: '小入り',
          value: formatMoney(totalBonus1 || 0)
        },
        {
          text: '大入り',
          value: formatMoney(totalBonus2 || 0)
        },

      ];

      const detailTable = {
        working: register,
        tips: tipsUser,
        bonusDay: arrBonus,
        rateTips: rate_tips / 100,
        salaryByHour: info.record.salary.value
      };

      setDetail(detailTable);
      setSalary(boardSalary);
      setTotalSalary(totalSalaryFinal);
      setLoading(false);

    }
  };

  useEffect(() => {
    fetchAllRecordsCustomer(idStaffApp).then(function(records) {
      const data = records.map((val) => ({
        value: JSON.stringify({
          name: val.name.value,
          id: val.$id.value
        }),
        label: val.name.value
      }));
      setStaff(data);
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      month: dayjs(),
    });
    if (type === 'edit') {
      const data = event.record;
      form.setFieldsValue({
        month: data?.month.value && dayjs(data?.month?.value),
        staff: data.staff.value && JSON.stringify({
          name: data.staff.value,
          id: data.id_staff.value
        })
      });
      setSalary(JSON.parse(data.detail_salary.value));
      setTotalSalary(data.total.value);
      if (data.salary_custom.value) {
        const salaryCustom = JSON.parse(data.salary_custom.value);
        setCustoms(salaryCustom);
        salaryCustom.forEach((val, ind) => {
          ['text', 'value'].forEach((val2) => {
            let field = `field_${ind}_${val2}`;
            form.setFieldValue(field, val[val2]);
          });
        });
      }

    }
  }, [event, type]);

  return (
    <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
      <CardComponent
        title={'給与計算新規登録'}
        btnLeft={'戻る'}
        onClickLeft={() => window.history.back()}
      >
        <div className={'mainAppCustom'}>
          <div className={styles.formRegister}>
            <Form form={form} layout="vertical" scrollToFirstError autoComplete="off" onFinish={onFinish} onValuesChange={onValuesChange}>
              {renderModalContentDetail(registerEdit)}
              <div className={styles.info}>
                {
                  loading ? <Spin/> : !!salary?.length && salary.map(val => (
                    <div className={styles.item} key={val.text}>
                      <span className={styles.label}>{val.text}:</span>
                      <span className={styles.value}>{val.value}</span>
                    </div>
                  ))
                }
              </div>
              <div className={styles.customForm}>
                {
                  customs?.map((val, ind) => renderFormCustom(ind))
                }
              </div>
              <PlusCircleTwoTone className={styles.iconAdd} onClick={handleAdd}/>
              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={loading}>
                  <SaveOutlined/>登録
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </CardComponent>
    </MainLayout>
  );
}