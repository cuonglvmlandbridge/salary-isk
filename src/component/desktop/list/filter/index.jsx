// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import {Button, Col, DatePicker, Form, Input, Row} from 'antd';
import dayjs from 'dayjs';

import styles from './styles.module.css';

const days = ['日', '月', '火', '水', '木', '金', '土']

export default function FilterList({ onFinish, fields }) {

    const [form] = Form.useForm();

    const renderModalContentDetail = (data) => {
        return (
            <Row gutter={20} className={styles.formItem}>
                {data.map((el, index2) => (
                    <Col className="gutter-row" span={6} sm={12} xs={24} key={`${el?.formItemProps?.name}-${index2}`}>
                        <Form.Item {...el.formItemProps}>
                            {el.renderInput()}
                        </Form.Item>
                    </Col>
                ))}
                <Col className="gutter-row" span={6} xs={24}>
                    <Button htmlType={'submit'} type={'primary'}>
                        表示
                    </Button>
                </Col>
            </Row>
        );
    };

    const renderModalContent = () => {
        const generalInformationInput = [
            {
                formItemProps: {
                    label: '従業員',
                    name: 'staff',
                    labelAlign: 'left',
                },
                renderInput: () => <Input />,
            },
            {
                formItemProps: {
                    label: '月',
                    name: 'month',
                    labelAlign: 'left',
                },
                renderInput: () => <DatePicker picker={'month'} placeholder={''}/>,
            },
        ];
        return (
            <div className={styles.formFilter}>
                <Form form={form} autoComplete="off" onFinish={onSubmitForm}>
                    {renderModalContentDetail(generalInformationInput)}
                </Form>
            </div>
        );
    };

    const onSubmitForm = (payload) => {
        onFinish && onFinish(payload)
    }

    return (
        <div>
            <div className={styles.day}>
                {`${dayjs().format('YYYY年MM月DD日')}(${days[dayjs().day()]})` }
            </div>
            {renderModalContent()}
        </div>
    )
}