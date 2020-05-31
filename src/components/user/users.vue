<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="AddDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top-start"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetSlotDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="AddDialogVisible" width="50%" @close="addDialogClose">
      <!-- 对话框内容区 -->
      <el-form :model="addUserform" :rules="UserformRules" ref="addUserformRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserform.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserform.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserform.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserform.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- 对话框内容区 -->
      <el-form
        :model="editUserform"
        :rules="UserformRules"
        ref="editUserformRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editUserform.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserform.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserform.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setslotDialogVisible" @close='CloseSetslotDialog'>
      <p>当前用户:{{UserInfo.username}}</p>
      <p>当前角色:{{UserInfo.role_name}}</p>
      <p>
        分配新角色:
        <el-select v-model="selectSlotId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
            </el-option>
        </el-select>
      </p>
            <!-- 对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setslotDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSlotInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //校验邮箱是否合法
    var checkEmail = (rule, value, callback) => {
      const emailRule = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
      if (emailRule.test(value)) callback()
      callback(new Error('请输入正确邮箱'))
    }
    //校验手机是否合法
    var checMobile = (rule, value, callback) => {
      const MobileRule = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
      if (MobileRule.test(value)) callback()
      callback(new Error('请输入正确手机号码'))
    }
    return {
      //users请求参数
      queryinfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 2
      },
      //用户列表
      userList: [],
      //数据条数
      total: 0,
      //控制添加用户对话框显示与否
      AddDialogVisible: false,
      //添加用户表单
      addUserform: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //用户表单验证规则
      UserformRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checMobile, trigger: 'blur' }
        ]
      },
      //编辑用户对话框显示与否
      editDialogVisible: false,
      editUserform: {
        username: '',
        email: '',
        mobile: '',
        id: 0
      },
      //控制分配角色对话框的显示
      setslotDialogVisible: false,
      //需要分配角色的用户
      UserInfo: {},
      //所有角色列表
      roleList: [],
      //已经选中角色id
      selectSlotId:''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //获取用户列表事件
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryinfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('用户数据获取失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
      //console.log(this.usersList)
    },
    //监听pageSize改变事件
    handleSizeChange(newSize) {
      this.queryinfo.pagesize = newSize
      this.getUserList()
      // console.log(newSize)
    },
    //监听  页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryinfo.pagenum = newPage
      this.getUserList()
      console.log(newPage)
    },
    //监听用户状态改变事件
    async userStateChanged(UserInfo) {
      //console.log(UserInfo)
      const { data: res } = await this.$http.put(
        `users/${UserInfo.id}/state/${UserInfo.mg_state}`
      )
      //console.log(res)
      if (res.meta.status !== 200) {
        UserInfo.status = !UserInfo.status
        return this.$message.error('用户状态改变失败')
      }
      return this.$message.success('用户状态改变成功')
    },
    //监听对话框关闭事件
    addDialogClose() {
      this.$refs.addUserformRef.resetFields()
    },
    //监听添加用户按钮事件，添加用户
    addUser() {
      this.$refs.addUserformRef.validate(async valid => {
        if (!valid) return
        //表单校验通过，发起网络请求
        const { data: res } = await this.$http.post('users', this.addUserform)
        //console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        //用户创建成功

        this.AddDialogVisible = false
        this.getUserList()
        return this.$message.success('添加用户成功')
      })
    },
    //显示编辑对话框
    showEditDialog(data) {
      //console.log(data)
      this.editDialogVisible = true
      this.editUserform.username = data.username
      this.editUserform.email = data.email
      this.editUserform.mobile = data.mobile
      this.editUserform.id = data.id
    },
    //关闭编辑对话框时事件
    editDialogClose() {
      this.$refs.editUserformRef.resetFields()
    },
    //确定编辑对话框
    editUser() {
      this.$refs.editUserformRef.validate(async valid => {
        //console.log(valid)
        if (!valid) return
        //编辑表单验证通过，发起网络请求
        const { data: res } = await this.$http.put(
          `users/${this.editUserform.id}`,
          { email: this.editUserform.email, mobile: this.editUserform.mobile }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户数据失败!')
        }
        //隐藏编辑对话框
        this.editDialogVisible = false
        //重新获取用户数据
        this.getUserList()
        //提示用户更新数据成功
        return this.$message.success('更新用户数据成功!')
      })
    },
    //永久删除用户信息
    async deleteUserById(id) {
      const confirmResule = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
      const { data: res } = await this.$http.delete(`users/${id}`)
      //console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.getUserList()
      return this.$message.success('删除用户成功!')
    },
    //显示分配角色对话框
    async showSetSlotDialog(UserInfo) {
      this.UserInfo = UserInfo
      //获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!')
      }
      this.roleList = res.data
      this.setslotDialogVisible = true
    },
    //确定分配角色按钮事件
    async saveSlotInfo(){
      if(!this.selectSlotId){
        return  this.$message.error('请选择要分配的角色')
      }
      //发送网络请求给用户分配新角色
      const {data:res}=await this.$http.put(`users/${this.UserInfo.id}/role`,{rid:this.selectSlotId})
      //console.log(res)
      if(res.meta.status!==200){
        this.$message.error('分配角色失败!')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setslotDialogVisible=false
    },
    CloseSetslotDialog(){
      this.UserInfo={}
      this.selectSlotId=''
    }
  }
}
</script>

<style scoped>
</style>