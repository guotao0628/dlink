import {connect} from "umi";
import {StateType} from "@/pages/DataStudio/model";
import {Form, InputNumber, Input, Select, Tag, Row, Col, Badge, Tooltip, Button, Space} from "antd";
import {InfoCircleOutlined, PlusOutlined, MinusSquareOutlined, MinusCircleOutlined,PaperClipOutlined} from "@ant-design/icons";
import styles from "./index.less";
import {useEffect} from "react";
import {JarStateType} from "@/pages/Jar/model";
import {Scrollbars} from "react-custom-scrollbars";
import {RUN_MODE} from "@/components/Studio/conf";

const {Option} = Select;

const StudioJarSetting = (props: any) => {

  const {clusterConfiguration, current, form, dispatch, tabs, jars,env, toolHeight} = props;

  const getClusterConfigurationOptions = () => {
    const itemList = [];
    for (const item of clusterConfiguration) {
      const tag = (<><Tag color={item.enabled ? "processing" : "error"}>{item.type}</Tag>{item.alias === "" ? item.name : item.alias}</>);
      itemList.push(<Option key={item.id} value={item.id} label={tag}>
        {tag}
      </Option>)
    }
    return itemList;
  };

  const getJarOptions = () => {
    const itemList = [];
    for (const item of jars) {
      const tag = (<><Tag color={item.enabled ? "processing" : "error"}>{item.type}</Tag>{item.alias === "" ? item.name : item.alias}</>);
      itemList.push(<Option key={item.id} value={item.id} label={tag}>
        {tag}
      </Option>)
    }
    return itemList;
  };

  useEffect(() => {
    form.setFieldsValue(current.task);
  }, [current.task]);


  const onValuesChange = (change: any, all: any) => {
    const newTabs = tabs;
    for (let i = 0; i < newTabs.panes.length; i++) {
      if (newTabs.panes[i].key === newTabs.activeKey) {
        for (const key in change) {
          newTabs.panes[i].task[key] = all[key];
        }
        break;
      }
    }
    dispatch({
      type: "Studio/saveTabs",
      payload: newTabs,
    });
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <div style={{float: "right"}}>
            <Tooltip title="?????????">
              <Button
                type="text"
                icon={<MinusSquareOutlined/>}
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
      <Scrollbars style={{height: (toolHeight - 32)}}>
        <Form
          form={form}
          layout="vertical"
          className={styles.form_setting}
          onValuesChange={onValuesChange}
        >
          <Form.Item
            label="????????????" className={styles.form_item} name="type"
            tooltip='?????? Flink ????????????????????????????????? Local'
          >
            <Select defaultValue={RUN_MODE.YARN_APPLICATION} value={RUN_MODE.YARN_APPLICATION}>
              <Option value={RUN_MODE.YARN_APPLICATION}>Yarn Application</Option>
            </Select>
          </Form.Item>
          <Row>
            <Col span={24}>
              <Form.Item label="Flink????????????" tooltip={`??????Flink?????????????????? ${current.task.type} ???????????????????????????`}
                         name="clusterConfigurationId"
                         className={styles.form_item}>
                <Select
                  style={{width: '100%'}}
                  placeholder="??????Flink????????????"
                  optionLabelProp="label"
                >
                  {getClusterConfigurationOptions()}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="????????? Jar"
                     tooltip={`??????????????? Jar ?????? ${current.task.type} ????????????????????? Jar ???????????????????????????????????????????????????????????? Jar.`}
                     name="jarId"
                     className={styles.form_item}>
            <Select
              style={{width: '100%'}}
              placeholder="???????????????Jar????????????"
              allowClear
              optionLabelProp="label"
            >
              {getJarOptions()}
            </Select>
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item label="CheckPoint" tooltip="??????Flink???????????????????????????0 ???????????????" name="checkPoint"
                         className={styles.form_item}>
                <InputNumber min={0} max={999999} defaultValue={0}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Parallelism" className={styles.form_item} name="parallelism"
                tooltip="??????Flink?????????????????????????????? 1"
              >
                <InputNumber min={1} max={9999} defaultValue={1}/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="SavePoint??????" className={styles.form_item} name="savePointStrategy"
            tooltip='?????? SavePoint????????????????????????'
          >
            <Select defaultValue={0}>
              <Option value={0}>??????</Option>
              <Option value={1}>????????????</Option>
              <Option value={2}>????????????</Option>
              <Option value={3}>????????????</Option>
            </Select>
          </Form.Item>
          {current.task.savePointStrategy === 3 ?
            (<Form.Item
              label="SavePointPath" className={styles.form_item} name="savePointPath"
              tooltip='???SavePointPath??????Flink??????'
            >
              <Input placeholder="hdfs://..."/>
            </Form.Item>) : ''
          }
          <Form.Item
            label="????????????" className={styles.form_item}
            tooltip={{title: '??????????????????????????????????????????????????? pipeline.name', icon: <InfoCircleOutlined/>}}
          >

            <Form.List name="config"
            >
              {(fields, {add, remove}) => (
                <>
                  {fields.map(({key, name, fieldKey, ...restField}) => (
                    <Space key={key} style={{display: 'flex'}} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        style={{marginBottom: '5px'}}
                      >
                        <Input placeholder="??????"/>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        style={{marginBottom: '5px'}}
                      >
                        <Input placeholder="???"/>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)}/>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                      ???????????????
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Scrollbars>
    </>
  );
};

export default connect(({Studio, Jar}: { Studio: StateType, Jar: JarStateType }) => ({
  sessionCluster: Studio.sessionCluster,
  clusterConfiguration: Studio.clusterConfiguration,
  current: Studio.current,
  tabs: Studio.tabs,
  session: Studio.session,
  currentSession: Studio.currentSession,
  toolHeight: Studio.toolHeight,
  jars: Jar.jars,
  env: Studio.env,
}))(StudioJarSetting);
