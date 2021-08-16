<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="20">
        <!-- gutter表示row中两个col的间距有20px，span栅格表示col的占比（总共24） -->
        <el-col :span="8">
      <!-- 下边的input和button可谓固定格式;clearable出现搜索框中小叉号;clear配合clearable,
      即点叉号清除输入的内容后重恢复全部内容；此处直接调用getUserList即可查询,用再写js来查询（vue的方便之处） -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialog">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <!-- el-table是一个大表格,el-table-column是大表格中的每一行 -->
      <el-table :data="userList" border stripe>
        <!-- :data是绑定数据域(userList=res.data故是一整套的数据),stripe是斑马条 -->
        <!-- prop属性对应对象中(userList)的键名来填入数据 -->
        <el-table-column type="index"></el-table-column><!--表示索引列-->
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="颜色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
        <!--scope.row表示这一行的数据(以下也为获取行数据的固定格式),原来状态对应的prop
         是mg_state(对应布尔值),但布尔值不可展示，便用了el-switch的转换组件-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"
             @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
    <!-- 因为要给showEditDialog函数传入id值(即形参),故要调用scope来传递 -->
            <el-button
              type="primary"
              @click="showEditDialog(scope.row.id)"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button @click="removeUserById(scope.row.id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
            <!-- 分配角色按钮 -->
      <!--el-tooltip可显示文字提示信息(即鼠标移动到此处有提示信息);
        effect表示提示信息的颜色(此处为dark暗色);
        plcaement表示提示信息(即content内容)在的位置(此处为上面);
        enterable表示鼠标是否可进入提示框浮层中,默认为false -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
  <!--切换的多少条/页触发size-change;点击第几页触发current-change;
  :page-size表示当前情况下每页显示的数据是多少;:current-change表示显示的是第几页的数据;
  :page-sizes表示可选择的页面数据条数;layout是战士在页面上的分页功能(比如total展示共几条数据)
  :total表示共有几条数据 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
<!--el-dialog是弹出面板;@close是用来关闭此面板时触发事件;
:visible.sync是控制面板是否展示(主要和后边的addDialogVisible有关) -->
    <el-dialog title="添加用户信息" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区 -->
 <!--:rules对应的是此表单的验证规则对下个(具体规则写于data域);:model绑定表单数据域;
 ref即表单的引用对象(代表整个表单信息),它可通过调用this.$refs来调出addFormRef用来配合methods中的函数-->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username"><!--此prop对应的是验证规则的属性-->
          <el-input v-model="addForm.username"></el-input><!--此v-model绑定的是表单具体数据项-->
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible"
     width="50%" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
      <div>
        <p>当前用户:{{userInfo.username}}</p>
        <p>当前角色:{{userInfo.role_name}}</p>
        <p>分配角色:<!--select下拉选择框(固定格式)-->
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id"
            :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱的规则（固定格式，搭配验证邮箱的validator验证规则(合法性)）
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (!regEmail.test(value)) {
        callback(new Error('请输入合法的邮箱'))
      }
      callback()
    }
    //验证手机号的规则（同上）
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (!regMobile.test(value)) {
        callback(new Error('请输入合法的电话'))
      }
      callback()
    }
    return {
      //获取但钱参数对象
      queryInfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示多少数据
        pagesize: 2,
      },
      userList: [],
      total: 0,
      //添加用户对话框内容显示与隐藏
      addDialogVisible: false,
      //添加用户的表单数据
      addForm:{
        username: '',
        password: '',
        email: '',
        mobile: ''
        },
      //添加表单的验证对象(固定格式)
      addFormRules:{
        username:[
          { required: true,
            message: '请输入用户名', tigger: 'blur'},
          {min:2,max:10, 
            meaaage: '长度在2到10个字符', tigger: 'blur'}
        ],
         password:[
          { required: true,
            message: '请输入密码', tigger: 'blur'},
          {min:6,max:15, 
            meaaage: '长度在6到15个字符', tigger: 'blur'}
        ],
         email:[
          { required: true,
            message: '请输入邮箱', tigger: 'blur'},
            {validator: checkEmail,tigger: 'blur'}
        ],
         mobile:[
          { required: true,
            message: '请输入手机号码', tigger: 'blur'},
             {validator: checkMobile,tigger: 'blur'}
        ]
      },
      //修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //修改用户的表单数据
      editForm: {},
      //修改表单对象的验证规则
      editFormRules: {
       email:[
          { required: true,
            message: '请输入邮箱', tigger: 'blur'},
            {validator: checkEmail,tigger: 'blur'}
        ],
         mobile:[
          { required: true,
            message: '请输入手机号码', tigger: 'blur'},
             {validator: checkMobile,tigger: 'blur'}
        ]
      },
      //控制角色分配对话框的显示与隐藏
      setRoleDialogVisible:false,
      //需要分配角色的用户信息
      userInfo:{},
      //所有角色的数据列表
      rolesList:[],
      //已选中的角色Id值
      selectedRoleId:''
    }
  },
  created() {//生命周期中必有加载获取数据的核心函数
    this.getUserList()
  },
  methods: {
    async getUserList() {//获取数据的核心函数---固定格式
//①async,await②data中写参数对象(queryInfo{name:xx;age:xx;...}③if判做出失败回应④赋值
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },

    //监听 每页数据条数(pagesize) 改变的事件--（固定格式）
    handleSizeChange(newSize) {
      //用户更改每页数据条数后触发@size-change并传入新的值newSize;
      //之后更改数据(pagesize)重加数据；
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听 页码值(pagenum) 改变的事件--（固定格式）
    handleCurrentChange(newPage) {
      //具体过程同上函数
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    //监听 switch 开关状态的改变
    async userStateChanged(userinfo) {
//一般获取数据都是get，修改数据都是put；
//API文档给的修改用户状态的接口是users/:id/state/:mg_state,其中:开头的都是参数,参数更改用${}
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
//虽然不对但用户已修改(可以理解为前台修改但后台没改),故要个更改用户的修改
//毕竟vue不能操作数据库,只能通过网络请求更改后台
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功')
    },

    //监听添加用户按钮(点击添加用户啊button时触发此函数)-固定格式
    addDialog(){
      this.addDialogVisible= true
    },
    //监听添加用户对话框关闭事件(关闭添加用户面板时触发)-固定格式
    addDialogClosed(){//用$refs.ref(=addFormRef即调出表单的引用对象)来ewserFields清空内容
      this.$refs.addFormRef.resetFields()
    },
    //添加用户对话框确定按钮（固定格式）
    addUser(){
      this.$refs.addFormRef.validate(async valid => {//使用$refs来调出表单的应用对象(addFormRef)来接受校验结果valide
        if(!valid) return//如果校验结果不对直接返回即可
        //发起网络请求（即校验通过）
        const {data: res}=await this.$http.post('user',this.addForm)
        if(res.meta.status!==201){
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //隐藏添加用户对话框
        this.addDialogVisible=false
        //重新获取列表数据
        this.getUserList()   
       })
    },

    //展示修改用户对话框（固定格式）
    async showEditDialog(id){
      const {data:res} = await this.$http.get('users/'+id)
      if(res.meta.status!==200){
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm=res.data
      this.editDialogVisible = true
    },
    //监听修改用户关闭事件（固定格式）
    editDialogClosed(){
      //关闭时还是要重置表单内容的，若是不重置则再次打开表单时表单还有上次写入表单的内容
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息提交（固定格式）
    editUserInfo(){
      //先进行表单的预校验
      this.$refs.editFormRef.validate(async valid=>{
        //如果校验不通过直接返回
        if(!valid) return
        //否则则校验通过即发起修改用户信息的数据请求
        const{data:res}=await this.$http.put('users/'+this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        })
        if(res.meta.status!==200){
          return this.$message.error('更新用户信息失败！')
        }
        //关闭对话框
        this.editDialogVisible=false
        //刷新数据列表
        this.getUserList()
        //提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },

    //根据id删除对应的用户信息（固定格式）
    async removeUserById(id){
      //询问用户是否删除数据对话框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error=>error)//此处为简写(捕获错误的完整写法为error=>{return error})
      //如果用户不确认删除(即点了提示框的取消按钮)--确认的返回值是confirm
      if(confirmResult!=='confirm'){
        return this.$message.info('已取消删除')
      }
      //若用户确认删除(即点了提示框的确认按钮)
      const {data:res}=await this.$http.delete('users/'+ id)
      if(res.meta.status!==200){
        return this.$message.error('删除用户失败!')
      }

      this.$message.success('删除用户成功!')
      this.getUserList()
     },
     
      //展示分配角色的对话框
      async setRole(userInfo){
        this.userInfo=userInfo

        //展示对话框之前，先获取列表数据
        const{data:res}=await this.$http.get('roles')
        if(res.meta.status!==200){
          return this.$message.error('获取角色列表失败!')
        }
        
        this.rolesList=res.data
        this.setRoleDialogVisible=true
      },
      //点击确定按钮，分配角色
      async saveRoleInfo(){
        if(!this.selectedRoleId){
          return this.$message.error('请选择要分配的角色!')  
        }
        
        const{data:res}=await this.$http.put(`users/
        ${this.userInfo.id}/role`,{
          rid:this.selectedRoleId
        })

        if(res.meta.status!==200){
          return this.$message.error('更新角色失败!')
        }

        this.$message.success('更新角色成功！')
        this.getUserList()
        this.setRoleDialogVisible = false
      }
  },

}
</script>

<style lang="less" scoped>
</style>