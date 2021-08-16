<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png">
      </div>
      <!-- 登陆表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 用户名区域 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- 密码区域 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default{
  data(){
    return {
      //默认表单对象
      loginForm: {
        username: 'zy',
        password: '123'
      },
      //表单对象验证规则
      loginFormRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', tiger: 'blur'},
          { min:2,max:10, meaaage: '长度在2到10个字符', tiger: 'blur'}
        ],
        //验证密码是否合法
        password: [
          { required: true, message: '请输入密码', tiger: 'blur'},
          { min:5,max:12, meaaage: '长度在5到12个字符', tiger: 'blur'}
        ]
      }
    }
  },
  methods: {
    //点击按钮，重置对象
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    //点击登录，进行预校验
    login() {
      this.$refs.loginFormRef.validate(async valid =>{//valid是个boolean值
        if(!valid) return;
        const {data: res}=await this.$http.post("login", this.loginForm);
        if(res.meta.status !==200) return this.$message.error("登陆失败！");
        this.$message.success("登陆成功！");//$message是自己在element——ui中起的名字，用来挂在全局变量Message
        //登录成功之后将token保存到sessionStorage中
        window.sessionStorage.setItem("token",res.data.token);
        //通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push("/home");      
      })
    }
  }
};
</script>

<style lang="less" scoped>
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}
.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  /*以下四行为使盒子居中的操作*/
  position:absolute;
  left: 50%;
  top:50%;
  transform: translate(-50%,-50%);

.avatar_box{
  height: 130px;
  width: 130px;
  border:1px solid #eee;
  border-radius: 50%;
  padding:10px;
  background-color: #eee;
  /*以下也为盒子居中操作*/
  position:absolute;
  left:50%;
  transform: translate(-50%,-50%);
  img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
    }
  }
}
.login_form{
  position: absolute;
  bottom:0;
  width: 100%;
  padding:0 20px;
  /*令边框和内边距都在盒子中，不会使内容突出来*/
  box-sizing: border-box;
}
.btns{
  /*使盒子成为flex容器*/
  display:flex;
  /*使里边的内容从后开始排列*/
  justify-content: flex-end;
}
</style>