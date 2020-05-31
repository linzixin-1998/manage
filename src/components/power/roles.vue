<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="AddRolesVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe style="width:1366px">
        <!-- 展开列 -->
        <el-table-column type="expand"> 
          <template slot-scope="scope">
            <!-- 一级权限 -->
            <el-row
              v-for="(item,t1) in scope.row.children"
              :key="item.id"
              :class="['bot-border',t1===0?'top-border':'','vcenter']"
            >
              <el-col :span="5">
                <el-tag closable @close="removerRelesById(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row
                  v-for="(item2,t2) in item.children"
                  :key="item2.id"
                  :class="[t2===0?'':'top-border', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removerRelesById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removerRelesById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRolesDialog(scope.row)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRolesById(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              type="warning"
              icon="el-icon-share"
              size="mini"
              @click="showRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="AddRolesVisible"
      width="50%"
      @close="addRolesDialogClose"
    >
      <!-- 对话框内容区 -->
      <el-form
        :model="addRolesform"
        :rules="RolesformRules"
        ref="addRolesformRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addrRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRolesVisible"
      width="50%"
      @close="editRolesDialogClose"
    >
      <!-- 对话框内容区 -->
      <el-form
        :model="editRolesform"
        :rules="RolesformRules"
        ref="editRolesformRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="RightDialogVisible" width="50%" @close="closeRightDialog">
      <!-- 树形控件 -->
      <el-tree :data="RightsList" :props="treeProps" ref="treeRef" show-checkbox default-expand-all node-key="id" :default-checked-keys="rightsID"></el-tree>
      <!-- 对话框底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="RightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="alotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getroleList()
  },
  data() {
    return {
      //角色列表数据
      roleList: [],
      //控制添加角色对话框显示
      AddRolesVisible: false,
      //添加角色表单数据
      addRolesform: {
        roleName: '',
        roleDesc: ''
      },
      //表单验证规则
      RolesformRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //控制角色编辑对话框的显示
      editRolesVisible: false,
      //编辑角色对话框表单数据
      editRolesform: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      //控制分配权限对话框的显示
      RightDialogVisible: false,
      //权限列表
      RightsList: [],
      //树形控件绑定属性的值
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      //角色已有权限的id
      rightsID:[],
      //当前即将分配权限id
      roleId:''
    }
  },

  methods: {
    //获取角色列表方法
    async getroleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.roleList = res.data
      return this.$message.success('获取角色列表成功!')
    },
    //添加角色对话框关闭时
    addRolesDialogClose() {
      this.$refs.addRolesformRef.resetFields()
    },
    //监听添加角色确定按钮事件
    addrRoles() {
      this.$refs.addRolesformRef.validate(async valid => {
        if (!valid) return
        //表单校验通过，发起网络请求
        const { data: res } = await this.$http.post('roles', this.addRolesform)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        //用户创建成功

        //隐藏对话框
        this.AddRolesVisible = false
        //重新获取角色列表
        this.getroleList()
        //提示添加角色成功
        return this.$message.success('添加角色成功')
      })
    },

    //显示角色编辑对话框
    showEditRolesDialog(data) {
      this.editRolesform.id = data.id
      this.editRolesform.roleName = data.roleName
      this.editRolesform.roleDesc = data.roleDesc
      this.editRolesVisible = true
    },
    //关闭编辑对话框时初始化对话框内容事件
    editRolesDialogClose() {
      this.$refs.editRolesformRef.resetFields()
    },
    //监听确定按钮，提交角色编辑对话框事件
    editRoles() {
      this.$refs.editRolesformRef.validate(async valid => {
        if (!valid) return
        //编辑表单验证通过，发起网络请求
        const { data: res } = await this.$http.put(
          `roles/${this.editRolesform.id}`,
          {
            roleName: this.editRolesform.roleName,
            roleDesc: this.editRolesform.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色数据失败!')
        }
        //隐藏编辑对话框
        this.editRolesVisible = false
        //重新获取用户数据
        this.getroleList()
        //提示用户更新数据成功
        return this.$message.success('更新用户数据成功!')
      })
    },
    //通过id删除该角色信息
    async deleteRolesById(id) {
      const confirmResule = await this.$confirm(
        '此操作将永久删除该角色数据, 是否继续?',
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
      const { data: res } = await this.$http.delete(`roles/${id}`)
      //console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.getroleList()
      return this.$message.success('删除用户成功!')
    },
    async removerRelesById(roles, rightId) {
      const confirmResult = await this.$confirm(
        '删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      //点击取消按钮，提示用户取消删除
      if (confirmResult !== 'confirm') return this.$message.info('取消删除!')
      //点击确认按钮，删除该权限
      const { data: res } = await this.$http.delete(
        `roles/${roles.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('取消权限失败!')
      roles.children = res.data
      return this.$message.success('取消权限成功!')
    },
    //控制分配权限对话框
    async showRightDialog(role) {
      this.roleId=role.id;
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200)
        return this.$message.error('获取权限列表失败!')
      this.RightsList = res.data
      //console.log(this.RightsList)

      //递归获取权限id
      this.getRoleAllRightId(role,this.rightsID)
      //显示分配权限对话框
      this.RightDialogVisible = true

    },
    //通过递归获取当前角色下所有三级权限id
    //并保存到rightsID中
    getRoleAllRightId(node,arr){
      //判断是否为三级权限节点
      //是将其加入数组中
      if(!node.children){
        return arr.push(node.id)
      }
      //获取该节点children属性中的数组所有项递归调用getRoleAllRightId
      node.children.forEach(item=>this.getRoleAllRightId(item,arr))

    },
    //对话框关闭时清空rightsID
    closeRightDialog(){
      this.rightsID=[]
    },
    //监听确定分配权限按钮事件
    async alotRights(){
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
        
      ]
      const idStr=keys.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status!==200){
        return this.$message.error('分配权限失败!')
      }
      this.$message.success('分配角色权限成功!')
      this.getroleList()
      return this.RightDialogVisible=false
    }
  }
}
</script>
<style scoped>
.vcenter {
  display: flex;
  align-items: center;
}
</style>