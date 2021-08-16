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
      <!-- 添加按钮 -->
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加商品</el-button>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: green" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag v-if="scope.row.cat_level===1" type="success" size="mini">二级</el-tag>
          <el-tag v-if="scope.row.cat_level===2" type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
       :cuttent-page="queryInfo.pagenum" :page-sizes="[1,5,10,20]"
       layout="total,sizes,prev,pager,next,jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible"
     width="50%" @close="addCateDialogCloesd">
     <!-- 添加分类的表单 -->
     <el-form :model="addCateForm" :rules="addCateFormRules" 
      ref="addCateFormRef" label-width="100px">
      <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item> 
      <el-form-item label="父级分类">
          <el-cascader expand-trigger="hover" :options="getParentCateList"
           :props="cascaderProps" v-model="selectKeys" @change="parentCateChanged"
            clearable change-on-select>
          </el-cascader>
      </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
       <el-button @click="addCateDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="addCate">确定</el-button>
     </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" 
     width="50%" @close="editDialogVisibleClosed">
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类数据列表
      catalist: [],
      //总数居条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //表示当前定义模板列
          type: 'template',
          //表示当前值一列使用的模板名称
          template: 'isok',
        },
        {
          label: '排序',
          //表示当前定义模板列
          type: 'template',
          //表示当前值一列使用的模板名称
          template: 'order',
        },
        {
          label: '是否有效',
          //表示当前定义模板列
          type: 'template',
          //表示当前值一列使用的模板名称
          template: 'opt',
        },
      ],
      //控制添加分类对话框的隐藏与显示
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm:{
          //将要添加的分类名称
          cat_name:'',
          //父级分类的id
          cat_pid:0,
          //父类的等级，默认添加的是1级分类
          cat_level:0
      },
      //添加分类表单的验证对象
      addCateFormRules: {
          cat_name: { required: true,
            message: '请输入用户名', tigger: 'blur'},
      },
      //父级分类的列表
      parentCateList:[],
      //指定级联选择器的配置对象
      cascaderProps:{
          value:'cat_id',
          label:'cat_name',
          children:'children'
      } ,
        // 选中父级分类的Id数组
      selectKeys: [],
      // 编辑分类对象
      editCateForm: {
        cat_name: ''
      },
      // 编辑分类验证对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      //把数据列表赋值
      this.catelist = res.data.result
      //为总数据条数赋值
      this.total = res.data.total
    },

    //监听Pagesize的改变
    handleSizeChange(newSize){
          this.queryInfo.pagesize=newSize
          this.getCateList()
    },
    //监听pagenum的改变
    handleCurrentChange(newPage){
           this.queryInfo.pagenum=newPage
           this.getCateList()
    },

    //点击按钮展示添加分类的对话框
    showAddCateDialog(){
        //先获取父级分类的数据列表
        this.getParentCateList()
        //再展示对话框
        this.addCateDialogVisible=true
    },
      //获取父级分类的数据列表
      async getParentCateList(){
          const {data:res}=await this.$http.get(
              'categories',{
                  params:{type:2}
              })

              if(res.mata.status !==200){
                  return this.$message.error('获取数据失败！')
              }
              this.getParentCateList=res.date
      },
      //选项发生变化时触及这个函数
      parentCateChanged(){
        //如果selectedKeys中的数组大于0，证明选中父级分类
        if(this.selectedKeys.length>0){
           //父级分类的id
           this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
           //当前分类的等级
           this.addCateForm.cat_level=this.selectedKeys.length
           return 
        }
        //反之说明没有选中任何父级分类
        else{
          this.selectedKeys.cat_pid=0
          this.selectedKeys.cat_level=0
        }
      },

      //点击按钮添加新的分类
      addCate(){
        this.$refs.addCateFormRef.validate(async valid=>{
          if(!valid) return 
          const{data:res}=await this.$http.post('categories',this.addCateForm)
          
          if(res.meta.status!==201){
            return this.$message.error('添加分类失败！')
          }

          this.$message.success('添加分类成功！')
          this.getCateList()
          this.addCateDialogVisible=false
        })
      },
      //监听对话框的关闭事件，重置表单数据
      addCateDialogCloesd(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys=[]
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
      },

   async showEditDialog(id) {
      // 根据分类id请求分类对象信息
      const {data:res} = await this.$http.get('categories/'+id)
      if(res.meta.status!==200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editCateForm = res.data
      this.editDialogVisible = true
      console.log(editCateForm);
    },
    // 关闭编辑分类对话框，重置表单
    editDialogVisibleClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
  //显示编辑分类对话框
  async editCate(){
    const {data:res}=await this.$http.put(`categories/${this.editCateForm.cat_id}`, this.editCateForm)
    if(res.meta.status!==200){
      return this.$message.error(res.meta.msg)
    }

    this.$message.success(res.meta.msg)
    this.editDialogVisible=false
    this.getCateList()
  },

  //删除分类
  async showDeleteDialog(row){
    const confirmResult=await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示',{
      confirmButtonText:'确定',
      cancelButtonText:'取消',
      type:'warning'
    }).catch(err=>err)
   
   if(confirmResult!=='confirm'){
      return this.$message.info('已取消删除')
    }
   
   const{data:res}=await this.$http.delete(`categories/${row.cat_id}`)
   if(res.meta.status!==200){
     return this.$message.error(res.meta.status)
   }
    return this.$message.success(res.meta.status)
    this.getCateList()
  }
  },
}
</script>

<style lang="less" scoped>
.treeTable{
    margin-top:15px;
}
.el-cascader{
    width: 100%;
}
</style>