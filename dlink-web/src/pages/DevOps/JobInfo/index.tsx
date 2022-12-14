import {useEffect, useState} from 'react';
import {history, useLocation} from 'umi';
import {ClusterOutlined, EllipsisOutlined, FireOutlined, RedoOutlined, RocketOutlined} from '@ant-design/icons';
import {Button, Dropdown, Empty, Menu, message, Modal, Space, Tag, Typography} from 'antd';
import {PageContainer} from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import {JobInfoDetail} from "@/pages/DevOps/data";
import {getJobInfoDetail, refreshJobInfoDetail} from "@/pages/DevOps/service";
import moment from "moment";
import BaseInfo from "@/pages/DevOps/JobInfo/BaseInfo";
import Config from "@/pages/DevOps/JobInfo/Config";
import JobStatus, {isStatusDone} from "@/components/Common/JobStatus";
import {cancelJob, offLineTask, restartJob} from "@/components/Studio/StudioEvent/DDL";
import {CODE} from "@/components/Common/crud";
import JobLifeCycle, {JOB_LIFE_CYCLE} from "@/components/Common/JobLifeCycle";
import Exception from "@/pages/DevOps/JobInfo/Exception";
import FlinkSQL from "@/pages/DevOps/JobInfo/FlinkSQL";
import Alert from "@/pages/DevOps/JobInfo/Alert";
import DataMap from "@/pages/DevOps/JobInfo/DataMap";
import CheckPoints from "@/pages/DevOps/JobInfo/CheckPoints";
import FlinkClusterInfo from "@/pages/DevOps/JobInfo/FlinkClusterInfo";


const {Link} = Typography;

const JobInfo = (props: any) => {

  const params = useLocation();
  const {} = props;
  const id = params.query.id;
  const [job, setJob] = useState<JobInfoDetail>();
  const [time, setTime] = useState(() => Date.now());
  const [tabKey, setTabKey] = useState<string>('base');

  const handleGetJobInfoDetail = () => {
    const res = getJobInfoDetail(id);
    res.then((result) => {
      setJob(result.datas);
      setTime(Date.now());
    });
  };

  useEffect(() => {
    handleGetJobInfoDetail();
    let dataPolling = setInterval(handleGetJobInfoDetail, 3000);
    return () => {
      clearInterval(dataPolling);
    };
  }, []);

  const handleRefreshJobInfoDetail = () => {
    const res = refreshJobInfoDetail(id);
    res.then((result) => {
      setJob(result.datas);
      setTime(Date.now());
    });
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleSavepoint = (key: string) => {
    if (key == 'canceljob') {
      Modal.confirm({
        title: '????????????',
        content: `???????????????????????????????????? SavePoint ????????????`,
        okText: '??????',
        cancelText: '??????',
        onOk: async () => {
          if (!job?.cluster?.id) return;
          const res = cancelJob(job?.cluster?.id, job?.instance?.jid);
          res.then((result) => {
            if (result.code == CODE.SUCCESS) {
              message.success(key + "??????");
              handleGetJobInfoDetail();
            } else {
              message.error(key + "??????");
            }
          });
        }
      });
      return;
    }
    Modal.confirm({
      title: key + '??????',
      content: `??????${key}???????????????`,
      okText: '??????',
      cancelText: '??????',
      onOk: async () => {
        if (!job?.cluster?.id) return;
        const res = offLineTask(job?.instance?.taskId, key);
        res.then((result) => {
          if (result.code == CODE.SUCCESS) {
            message.success(key + "??????");
            handleGetJobInfoDetail();
          } else {
            message.error(key + "??????");
          }
        });
      }
    });
  };

  const handleRestart = () => {
    Modal.confirm({
      title: '??????????????????',
      content: `?????????????????????????????????`,
      okText: '??????',
      cancelText: '??????',
      onOk: async () => {
        if (!job?.cluster?.id) return;
        const res = restartJob(job?.instance?.taskId, job?.instance?.step == JOB_LIFE_CYCLE.ONLINE);
        res.then((result) => {
          if (result.code == CODE.SUCCESS) {
            message.success("??????????????????");
          } else {
            message.error("??????????????????");
          }
        });
      }
    });
  };

  const getButtons = () => {
    let buttons = [
      <Button key="back" type="dashed" onClick={handleBack}>??????</Button>,
    ];
    buttons.push(<Button key="refresh" icon={<RedoOutlined/>} onClick={handleRefreshJobInfoDetail}/>);
    buttons.push(<Button key="flinkwebui">
      <Link href={`http://${job?.history?.jobManagerAddress}/#/job/${job?.instance?.jid}/overview`} target="_blank">
        FlinkWebUI
      </Link></Button>);
    buttons.push(<Button key="autorestart" type="primary"
                         onClick={handleRestart}>??????{job?.instance?.step == 5 ? '??????' : '??????'}</Button>);
    if (!isStatusDone(job?.instance?.status as string)) {
      buttons.push(<Button key="autostop" type="primary" danger onClick={() => {
        handleSavepoint('cancel')
      }}>{job?.instance?.step == 5 ? '??????' : '????????????'}</Button>);
      buttons.push(<Dropdown
        key="dropdown"
        trigger={['click']}
        overlay={
          <Menu onClick={({key}) => handleSavepoint(key)}>
            <Menu.Item key="trigger">SavePoint??????</Menu.Item>
            <Menu.Item key="stop">SavePoint??????</Menu.Item>
            <Menu.Item key="cancel">SavePoint??????</Menu.Item>
            <Menu.Item key="canceljob">????????????</Menu.Item>
          </Menu>
        }
      >
        <Button key="4" style={{padding: '0 8px'}}>
          <EllipsisOutlined/>
        </Button>
      </Dropdown>);
    }
    return buttons;
  }

  return (
    <PageContainer
      header={{
        title: (<><JobLifeCycle step={job?.instance?.step}/>{job?.instance?.name}</>),
        ghost: true,
        extra: getButtons(),
      }}
      content={<>
        <Space size={0}>
          {job?.instance?.jid ? (
            <Tag color="blue" key={job?.instance?.jid}>
              <FireOutlined/> {job?.instance?.jid}
            </Tag>
          ) : undefined}
          <JobStatus status={job?.instance?.status}/>
          {job?.history?.type ? (
            <Tag color="blue" key={job?.history?.type}>
              <RocketOutlined/> {job?.history?.type}
            </Tag>
          ) : undefined}
          {job?.cluster?.alias ? (
            <Tag color="green" key={job?.cluster?.alias}>
              <ClusterOutlined/> {job?.cluster?.alias}
            </Tag>
          ) : (<Tag color="green" key='local'>
            <ClusterOutlined/> ????????????
          </Tag>)}
        </Space>
      </>}
      tabBarExtraContent={`?????????????????????${moment(time).format('HH:mm:ss')}`}
      tabList={[
        {
          tab: '????????????',
          key: 'base',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'cluster',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'snapshot',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'exception',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'log',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'optimize',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'config',
          closable: false,
        },
        {
          tab: 'FlinkSQL',
          key: 'flinksql',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'datamap',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'olap',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'version',
          closable: false,
        },
        {
          tab: '????????????',
          key: 'alert',
          closable: false,
        },

      ]}
      onTabChange={(key) => {
        setTabKey(key);
      }}
    >
      <ProCard>
        {tabKey === 'base' ? <BaseInfo job={job}/> : undefined}
        {tabKey === 'config' ? <Config job={job}/> : undefined}
        {tabKey === 'cluster' ? <FlinkClusterInfo job={job}/> : undefined}
        {tabKey === 'snapshot' ? <CheckPoints job={job}/> : undefined}
        {tabKey === 'exception' ? <Exception job={job}/> : undefined}
        {tabKey === 'log' ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/> : undefined}
        {tabKey === 'optimize' ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/> : undefined}
        {tabKey === 'flinksql' ? <FlinkSQL job={job}/> : undefined}
        {tabKey === 'datamap' ? <DataMap job={job}/> : undefined}
        {tabKey === 'olap' ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/> : undefined}
        {tabKey === 'version' ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/> : undefined}
        {tabKey === 'alert' ? <Alert job={job}/> : undefined}
      </ProCard>
    </PageContainer>
  );
};

export default JobInfo;
