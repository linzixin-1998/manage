<template>
  <div>
      <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
        <el-table :data="RightList" border stripe>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="权限说明" prop="authName"></el-table-column>
            <el-table-column label="路径" prop="path"></el-table-column>
            <el-table-column label="权限层级">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.level==='0'">一级</el-tag>
                    <el-tag v-else-if="scope.row.level==='1'" type="success">二级</el-tag>
                    <el-tag v-else-if="scope.row.level==='2'" type="danger">三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
    data(){
        return{
            RightList:[]
        }
    },
    created(){
        this.getRightList()
    },
    methods:{
        //获取权限列表
        async getRightList(){
            const {data:res}=await this.$http.get('rights/list')
            if(res.meta.status!==200){
                return this.$message.error('获取用户列表失败!')
            }
            this.RightList=res.data;
            return this.$message.success('获取用户列表成功!')

        }
    }
}
</script>

<style scoped>
</style>