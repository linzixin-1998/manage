<template>
  <div class="login_cont">
    <div class="login_box">
      <!--头像区-->
      <div class="tou_box">
        <img src="./../assets/zou.jpeg"/>
      </div>
      <!--表单区-->
      <el-form
        ref="login_form_ref"
        :model="login_form"
        :rules="login_form_rules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="login_form.username" 
          prefix-icon="icon iconfont iconyonghu"
           clearable
           placeholder="请输入用户名"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="login_form.password"
            type="password"
            prefix-icon="icon iconfont iconmima"
            placeholder="请输密码"
          ></el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item class="btns">
          <el-button type="success" @click="login">登录</el-button>
          <el-button type="warning" @click="resetLogin_form">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
<!-- 动画区 -->
  </div>
</template>

<script>
import { async } from 'q'
export default {
  name: 'login',
  data() {
    return {
      //表单数据绑定
      login_form: {
        username: 'admin',
        password: '123456'
      },
      //表单验证规则
      login_form_rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //重置表单数据
    resetLogin_form() {
      //console.log(this);
      this.$refs.login_form_ref.resetFields()
    },
    //点击登录按钮事件
    login() {
      //网络请求前先进行表单验证，
      this.$refs.login_form_ref.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.post('login', this.login_form)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功!')
        //1.将登录成功后得token保存到客户端sessionStorge 中
        //  1.1 项目中登录得其他qpi接口，必须要再登录成功后才能访问
        //  1.2 token 只应在当前网站打开期间生效，所以将token保存在sessionStorge中
        window.sessionStorage.setItem('token', res.data.token)
        //2.通过编程式导航跳到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style  scoped>
.login_cont {
  background-color: rgb(66, 76, 88);
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.login_box .tou_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login_box .tou_box img {
  height: 100%;
  width: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}



</style>