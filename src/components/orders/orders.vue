<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索内容区 -->
      <el-row>
        <el-col :span="8">
            <!-- 接口未实现过滤功能 -->
          <el-input placeholder="请输入内容（接口未实现过滤功能）" @input="get($event)" v-model="queryinfo.query" clearable @clear="getOrdersData" >
            <el-button slot="append" icon="el-icon-search" @click="getOrdersData"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay!=='1'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <el-tooltip
              class="item"
              effect="dark"
              content="修改地址"
              placement="top-start"
              :enterable="false"
            ><el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editDialogVisible = true"
          ></el-button></el-tooltip>
          <el-tooltip
              class="item"
              effect="dark"
              content="查看物流"
              placement="top-start"
              :enterable="false"
            ><el-button type="success" icon="el-icon-location" size="mini" @click="showExamDialog"></el-button></el-tooltip>
        </el-table-column>
      </el-table>
      <!-- 底部分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%">
      <span>请提供接口</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="查看物流信息" :visible.sync="examDialogVisible" width="50%">
      <span><p v-for="(item,i) in examInfo" :key="i">{{item.ftime}}——{{item.context}}</p></span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="examDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //请求参数
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //总数据条数
      total: 0,
      //订单列表数据
      ordersList: [],
      editDialogVisible: false,
      examDialogVisible: false,
      examInfo: []
    }
  },
  created() {
    this.getOrdersData()
  },
  methods: {
    async getOrdersData() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryinfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败!')
      }
      //获取订单数据成功

      this.total = res.data.total
      this.ordersList = res.data.goods
      this.$message.success('获取订单数据成功!')
      console.log(this.ordersList)
    },
    handleSizeChange(newSize) {
      this.queryinfo.pagesize = newSize
      this.getOrdersData()
    },
    handleCurrentChange(newPage) {
      this.queryinfo.pagenum = newPage
      this.getOrdersData()
    },
    //input输入框无法输入bug
    get(e){
        this.$forceUpdate()
    },
    async showExamDialog() {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')

      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }

      this.examInfo = res.data

      this.examDialogVisible = true
      console.log(this.examInfo)
    }
  }
}
</script>

<style scoped>
</style>