<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加商品</el-button>
        </el-col>
      </el-row>
<!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        show-index
        border
        :show-row-hover="false"
        class="tree-table">
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope"> 
            <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag type="success" size="mini" v-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag type="warning " size="mini" v-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
     </tree-table>
     <!-- 分页 -->
        <el-pagination @size-change="handleSizeChange"
         @current-change="handleCurrentChange" :current-page="querIfo.pagenum" 
         :page-sizes="[1, 5, 10, 15]" :page-size="querIfo.pagesize" 
         layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

        <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader expand-trigger="hover" :options="parentCateList" 
          :props="cascaderProps" v-model="selectedKeys"
           @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
       
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { async } from 'q'
export default {
  created() {
    this.getCategoriesList()
  },
  data() {
    return {
      //查询条件
      querIfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品分类列表
      cateList: [],
      //总数据条数
      total: 0,
      //每一列的配置对象
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'opt'
        },
      ],
       // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      parentCateList: [],
       // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      //控制编辑对话框的显示隐藏
      editDialogVisible:false,
      editCateForm:{
          id:0,
          cat_name:''
      }
    }
  },
  methods: {
    //获取商品分类列表
    async getCategoriesList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querIfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败!')
      }
      //保存到cateList
      this.cateList = res.data.result
      //保存总数据条数
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.querIfo.pagesize = newSize
      this.getCategoriesList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.querIfo.pagenum = newPage
      this.getCategoriesList()
    },
     // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      //console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      //console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCategoriesList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    //显示编辑对话框
    showEditDialog(data){
        this.editDialogVisible=true
        this.editCateForm.id=data.cat_id
        this.editCateForm.cat_name=data.cat_name
    },
    //监听编辑对话框确定按钮事件
    EditCate(){
        this.$refs.editCateFormRef.validate(async valid=>{
            
            if(!valid) return
            //编辑表单验证通过，发起网络请求
            const {data:res}=await this.$http.put(`categories/${this.editCateForm.id}`,{cat_name:this.editCateForm.cat_name})

            //console.log(res)
            if(res.meta.status!==200) {
                return this.$message.error('修改分类失败!')
            }
            //隐藏编辑对话框
        this.editDialogVisible = false
        //重新获取分类数据
        this.getCategoriesList()
        //提示用户更新分类数据成功
        return this.$message.success('修改分类成功!')
        })
    },
    //编辑对话框关闭时
    editDialogClosed(){
        this.$refs.editCateFormRef.resetFields()
    },
    //通过id删除分类
    async deleteCate(id){
         const confirmResule = await this.$confirm(
        '此操作将删除该分类, 是否继续?',
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
      const { data: res } = await this.$http.delete(`categories/${id}`)
      //console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败!')
      }
      this.getCategoriesList()
      return this.$message.success('删除分类成功!')
    }
  }
}
</script>

<style scoped>
.tree-table{
    margin-top: 15px
}
.el-cascader {
  width: 100%;
}
</style>