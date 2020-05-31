<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="请添加商品" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区 -->
      <el-steps :space="200" :active="activeName-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 添加商品表单区域 -->
      <el-form
        :model="addGoodForm"
        :rules="addGoodFormRules"
        ref="addGoodFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏区域 -->
        <el-tabs
          v-model="activeName"
          :tab-position="'left'"
          :before-leave="activeNameChange_before"
          @tab-click="tabOnClick"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品分类:">
              <el-cascader
                :options="cateList"
                expand-trigger="hover"
                @change="handleChange"
                :props="cateProps"
                v-model="addGoodForm.goods_cat"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="商品名称:" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格:" prop="goods_price">
              <el-input
                v-model="addGoodForm.goods_price"
                oninput="value=value.replace(/[^\d]/g,'')"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量:" prop="goods_weight">
              <el-input
                v-model="addGoodForm.goods_weight"
                oninput="value=value.replace(/[^\d]/g,'')"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量:" prop="goods_number">
              <el-input
                v-model="addGoodForm.goods_number"
                oninput="value=value.replace(/[^\d]/g,'')"
              ></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 循环渲染商品参数item项 -->
            <el-form-item v-for="item in manyTableData" :label="item.attr_name" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="shux" v-for="(shux,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- :headers="headerObj" -->
            <el-upload
              :headers="headerObj"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor class="minH" v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>


<script>
import _ from 'lodash'
export default {
  data() {
    return {
      //步骤条激活索引
      activeName: '0',
      //添加商品表单数据
      addGoodForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: {},
        //商品介绍
        goods_introduce: '',
        attrs: []
      },
      //添加商品表单验证规则
      addGoodFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入重量', trigger: 'blur' }
        ]
      },
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //动态参数数据
      manyTableData: [],
      //商品属性数据
      onlyTableData: [],
      //上传图片的服务器地址
      uploadUrl: 'http://123.207.238.206:8888/api/private/v1/upload',
      //图片上传请求头参数设置
      headerObj: {
          //服务器未安装tomcat,没有权限访问
        //Authorization: window.sessionStorage.getItem('token')
      }
    }
  },
  methods: {
    async getCateData() {
      //获取商品分类列表
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取产品分类失败!')
      }
      this.cateList = res.data
      //console.log(this.cateList)
    },
    //级联选择器值改变触发事件
    handleChange() {
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.addGoodForm.goods_cat = []
      }
      //console.log(this.addGoodForm.goods_cat)
    },

    //tabs切换之前触发事件
    activeNameChange_before(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },

    //每个tab被激活时事件
    async tabOnClick() {
      //根据激活tab获取数据
      if (this.activeName === '1') {
        //获取商品参数
        const { data: res } = await this.$http.get(
          `categories/${this.CateId}/attributes`,
          { params: { sel: 'many' } }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败!')
        }

        //将attr_vals属性的值从字符串切割为数组并赋值给自己
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        console.log(res.data)
        this.manyTableData = res.data
      } else if (this.activeName === '2') {
        //获取商品属性
        const { data: res } = await this.$http.get(
          `categories/${this.CateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败!')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    //点击图片预览图片事件
    handlePreview() {},
    //点击删除图片触发事件
    handleRemove() {},
    //添加商品按钮事件
    addGood() {
      //提交表单前预验证
      this.$refs.addGoodFormRef.validate(async valid => {
        if (!valid) return console.log('表单验证不通过')
        //表单验证通过，分析准备数据，发送网络请求
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addGoodForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addGoodForm.attrs.push(newInfo)
        })

        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addGoodForm.attrs.push(newInfo)
        })
        form.attrs = this.addGoodForm.attrs
        console.log(form)

        // 商品的名称，必须是唯一的
        if (this.addGoodForm.goods_number === 0 && this.addGoodForm.goods_weight === 0) {
          return this.$message.info('商品数量和商品价格不能为0')
        } 
          const { data: res } = await this.$http.post('goods', form)
          console.log(res)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败！')
          }

          this.$message.success('添加商品成功！')
          this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getCateData()
  },
  computed: {
    CateId() {
      if (this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped>
.el-checkbox {
  margin: 0px 10px 0px 0px !important;
}
.el-button {
  margin: 10px;
}
</style>