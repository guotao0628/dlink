package com.dlink.metadata;

import com.dlink.metadata.driver.ClickHouseDriver;
import com.dlink.metadata.driver.Driver;
import com.dlink.metadata.driver.DriverConfig;
import com.dlink.metadata.result.JdbcSelectResult;
import com.dlink.model.Column;
import com.dlink.model.Schema;
import com.dlink.utils.JSONUtil;
import com.fasterxml.jackson.databind.util.JSONPObject;
import org.junit.Test;

import java.util.List;

/**
 * ClickhouseTest
 *
 * @author heyang
 * @since 2022/4/21 1:06
 **/
public class ClickHouseTest {

    private static final String IP = "127.0.0.1";
    private static String url="jdbc:clickhouse://"+IP+":8123/default";
    private ClickHouseDriver clickHouseDriver = new ClickHouseDriver();
    public Driver getDriver() {
        DriverConfig config = new DriverConfig();
        config.setType(clickHouseDriver.getType());
        config.setName(clickHouseDriver.getName());
        config.setIp(IP);
        config.setPort(8123);
//        config.setUsername(null);
//        config.setPassword(null);
        config.setUrl(url);
        return Driver.build(config);
    }

    @Test
    public void connectTest() {
        String test = getDriver().test();
        System.out.println(test);
        System.out.println("end...");
    }

    @Test
    public void schemaTest() {
        List<Schema> schemasAndTables = getDriver().getSchemasAndTables();
        System.out.println(JSONUtil.toJsonString(schemasAndTables));
        System.out.println("end...");
    }

    @Test
    public void columnTest() {
        Driver driver = getDriver();
        List<Column> columns = driver.listColumns("xxx", "xxx");
        System.out.println(JSONUtil.toJsonString(columns));
        System.out.println("end...");
    }

    @Test
    public void queryTest() {
        Driver driver = getDriver();
        JdbcSelectResult query = driver.query("select * from xxx", 10);
        System.out.println(JSONUtil.toJsonString(query));
        System.out.println("end...");
    }
}
