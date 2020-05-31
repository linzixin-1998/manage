<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 设置警告区 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>

      <!-- 选择分类区 -->
      <el-row class="select">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="cataList"
            :props="cateProps"
            v-model="selectedCateKey"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab区 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数设置面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtndisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数列表 -->
          <el-table :data="manyTableList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="closeTag(i,scope.row)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性设置面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态属性按钮 -->
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtndisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态属性列表 -->
          <el-table :data="onlyTableList" border stripe>
              <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="closeTag(i,scope.row)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+addDialogCate"
      :visible.sync="addDialogVisible"
      size="50%"
      @close="dialogClose">
      <!-- 对话框表单区 -->
      <el-form :model="addform" :rules="addformRules" ref="addformRef" label-width="100px">
        <el-form-item :label="addDialogCate" prop="attr_name">
          <el-input v-model="addform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      :title="'修改'+addDialogCate"
      :visible.sync="editDialogVisible"
      size="50%"
      @close="editdialogClose"
    >
      <!-- 对话框表单区 -->
      <el-form :model="editform" :rules="addformRules" ref="editformRef" label-width="100px">
        <el-form-item :label="addDialogCate" prop="attr_name">
          <el-input v-model="editform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { async } from 'q'
export default {
  data() {
    return {
      cataList: [],
      //级联选择框配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //级联选择框双向绑定到的数组
      selectedCateKey: [],
      activeName: 'many',
      //获取到的动态参数数据
      manyTableList: [],
      //获取到的静态属性数据
      onlyTableList: [],
      //控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加参数表单的数据对象
      addform: { attr_name: '' },
      //表单的验证规则
      addformRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      //编辑表单数据对象
      editform: {
        attr_name: '',
        attrId: 0
      },
      //动态编辑标签输入框的显示与隐藏
      inputVisible:false,
      
      inputValue:''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      //console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类列表失败!')
      this.cataList = res.data
    },
    //级联选择器值改变时触发
    handleChange() {
      this.getParamsData()
    },
    //el-tabs 分页项改变时触发事件
    handleClick() {
      this.getParamsData()
    },
    //获取商品的参数数据
    async getParamsData() {
      //选择的不是三级分类
      if (this.selectedCateKey.length !== 3) {
        this.selectedCateKey = []
        this.manyTableList = []
        this.onlyTableList = []
        return
      }
      //选择的是三级分类
      //发起请求获取参数数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取该商品参数失败!')
      }

      res.data.forEach(item => {
        //将attr_valsz字符串分割为数组
        item.attr_vals=item.attr_vals ? item.attr_vals = item.attr_vals.split(' ') : []
        //添加inputVisible属性
        item.inputVisible=false
        //添加inputValue属性
        item.inputValue=''
      })


      //console.log(res)
      //获取参数成功,判断activeName是那种类型，分别存到对应参数列表
      if (this.activeName === 'many') {
        this.manyTableList = res.data
        //console.log(this.manyTableList)
      } else {
        this.onlyTableList = res.data
        //console.log(this.onlyTableList)
      }
    },
    //关闭对话框时清空预校验
    dialogClose() {
      this.$refs.addformRef.resetFields()
    },
    //监听表单确定按钮，添加参数
    addParams() {
      this.$refs.addformRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          { attr_name: this.addform.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 201)
          return this.$message.error('添加参数失败！')
        //添加参数成功
        //console.log(res)
        this.addDialogVisible = false
        this.getParamsData()
        this.$message.success('添加参数成功！')
      })
    },
    //控制编辑对话框的显示与隐藏
    showEditDialog(data) {
      this.editDialogVisible = true
      this.editform.attr_name = data.attr_name
      this.editform.attrId = data.attr_id
    },
    //编辑对话框关闭时初始化表单验证
    editdialogClose() {
      this.$refs.editformRef.resetFields()
    },
    //监听修改属性对话框确定按钮事件
    editParams() {
      this.$refs.editformRef.validate(async valid => {
        //判断表单预验证是否通过
        if (!valid) return
        //通过表单预验证，发起网络请求
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editform.attrId}`,
          { attr_name: this.editform.attr_name, attr_sel: this.activeName }
        )
        //根据请求返回状态码提示用户是否修改成功
        if (res.meta.status !== 200) {
          //修改失败
          return this.$message.error('修改参数失败！')
        }
        //修改成功
        this.editDialogVisible = false
        this.getParamsData()
        this.$message.success('修改参数成功!')
      })
    },
    //通过id删除参数
    async deleteParam(id) {
      const confirmResule = await this.$confirm(
        '此操作将删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //confirmResule如果为confirm用户点击确定按钮
      //confirmResule如果为cancel用户点击取消按钮
      if (confirmResule !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      //confirmResule如果为confirm，发送网络请求删除该数据
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      //console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.getParamsData()
      return this.$message.success('删除参数成功!')
    },
    //显示动态编辑标签输入框
    showInput(data){
         data.inputVisible=true
        //点击按钮时自动获取焦点
        //nextTick当页面重新渲染完成后执行回调函数
         this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
       
    },
    //当动态编辑标签输入框按下enter键或失去焦点时触发
    handleInputConfirm(data){
        if(data.inputValue.trim().length===0){
            data.inputValue=''
            data.inputVisible=false
            return
        }
        data.attr_vals.push(data.inputValue.trim())
        data.inputValue=''
        data.inputVisible=false
        this.savaAttrvals(data)
        
    },
    //将attr_vals保存到数据库
    async savaAttrvals(data){
        //如果没有return,将数据添加到attr_vals

        const {data:res}=await this.$http.put(
          `categories/${this.cateId}/attributes/${data.attr_id}`,
        {
          attr_name:data.attr_name,
          attr_sel:this.activeName,
          attr_vals:data.attr_vals.join(' ')
          }
        )
        if(res.meta.status!==200){
            return this.$message.error('修改参数失败!')
        }
        this.$message.success('修改参数成功!')
    },
    //关闭Tag标签时
    closeTag(i,data){
        data.attr_vals.splice(i,1)
        this.savaAttrvals(data)
    }
  },
  computed: {
    isBtndisabled() {
      if (this.selectedCateKey.length !== 3) return true
      else return false
    },
    //获取级联选择框选择到的三级分类id
    cateId() {
      if (this.selectedCateKey.length === 3) return this.selectedCateKey[2]
      return
    },
    addDialogCate() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped>
.select {
  margin: 25px 0px;
}
.input-new-tag{
    width: 150px
}
</style>