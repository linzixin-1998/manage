<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <span class="name">木子</span>
        <span>商城后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 侧边栏菜单区域 -->
    <el-container>
      <el-aside :width="isCollapse ? '64px' :'200px'">
        <!-- 收缩菜单按钮 -->
        <div class="toggle_btn" @click="toggleEvent">
          <i :class="isCollapse?'icon iconfont iconzhankaijiahao':'icon iconfont iconzhankai'"></i>
        </div>
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path+''"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { async } from 'q'
export default {
  data() {
    return {
      menulist: [],
      iconObj: {
        '125': 'icon iconfont iconyonghuguanli',
        '103': 'icon iconfont iconquanxianguanli',
        '101': 'icon iconfont iconshangpinguanli',
        '102': 'icon iconfont icondingdanguanli',
        '145': 'icon iconfont iconshujutongji'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenulist()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  //监听url改变，当url改变时，触发fetchData方法
  watch: {
    $route: 'fetchData'
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //获取菜单所有数据
    async getMenulist() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      //console.log(this.menulist)
    },
    //toggle按钮事件，控制菜单展开关闭
    toggleEvent() {
      this.isCollapse = !this.isCollapse
    },
    //保存链接激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    //当url改变时触发事件
    fetchData() {
      this.activePath = this.$route.path
    }
  }
}
</script>

<style scoped>
.el-header {
  background-color: #545c64;
  color: rgb(245, 241, 241);
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: #fff;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header div span {
  margin-left: 20px;
}
.el-aside {
  background-color: #545c64;
}

.el-aside .el-menu {
  border: none;
}

.el-main {
  background-color: #e9eef3;
}
.home_container {
  height: 100%;
}
.iconfont {
  margin-right: 10px;
}
.toggle_btn {
  width: 100%;
  text-align: center;
  background-color: #6a747e;
  line-height: 28px;
  color: #fff;
  cursor: pointer;
}
.toggle_btn i {
  position: relative;
  left: 4px;
}
.name{
  font-size: 35px;
  font-style: italic;
  color: red;
  text-shadow:10px 2px 6px #000;
}

</style>