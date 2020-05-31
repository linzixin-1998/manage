<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsdata"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button class="add_btn" type="primary" @click="goAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
         <el-table-column label="商品数量" prop="goods_number" width="70px"></el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 修改商品信息 -->
    <el-dialog title="修改商品信息" :visible.sync="editGoodDialogVisible" @close="closeGoodDialog">
      <!-- 对话框内容区 -->
      <el-form
        :model="editGoodform"
        ref="editGoodformRef"
        :rules="editGoodformRules"
        label-width="70px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoodform.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="goods_price">
          <el-input v-model="editGoodform.goods_price" oninput = "value=value.replace(/[^\d]/g,'')"></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
          <el-input v-model="editGoodform.goods_number" oninput = "value=value.replace(/[^\d]/g,'')"></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
          <el-input v-model="editGoodform.goods_weight" oninput = "value=value.replace(/[^\d]/g,'')"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 15
      },
      total: 0,
      goodsList: [],
      editGoodDialogVisible: false,
      editGoodform: {
        goods_name:'',
        goods_price:'',
        goods_number:'',
        goods_weight:''
      },
      editGoodformRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getGoodsdata()
  },
  methods: {
    async getGoodsdata() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      }

      this.goodsList = res.data.goods
      this.total = res.data.total
      //console.log(this.goodsList)
      this.$message.success('获取商品列表成功!')
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsdata()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsdata()
    },
    //根据id删除商品
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除！')
      }

      const { data: res } = await this.$http.delete(`goods/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }

      this.$message.success('删除成功！')
      this.getGoodsdata()
    },
    //显示编辑对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) return
      this.editGoodform = res.data
      //console.log(this.editGoodform)
      this.editGoodDialogVisible = true
    },
    //关闭对话框时执行事件
    closeGoodDialog() {
      this.$refs.editGoodformRef.resetFields()
    },
    //提交编辑商品信息
    editGoods() {
      this.$refs.editGoodformRef.validate(async valid => {
        if (!valid) return
        //编辑表单验证通过，发起网络请求
        const { data: res } = await this.$http.put(
          `goods/${this.editGoodform.goods_id}`,
          {
            goods_name: this.editGoodform.goods_name,
            goods_price: this.editGoodform.goods_price,
            goods_number: this.editGoodform.goods_number,
            goods_weight: this.editGoodform.goods_weight,
            goods_cat: this.editGoodform.goods_cat
          })
        //console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品信息失败!')
        }
        this.editGoodDialogVisible = false
        this.getGoodsdata()
        this.$message.success('修改商品信息成功!')
      })
    },
    //跳转到添加商品页面
    goAddGoodsPage(){

      this.$router.push('/addGoods')
    }
  }
}
</script>
<style scoped>
.add_btn {
  margin-left: 15px;
}
</style>