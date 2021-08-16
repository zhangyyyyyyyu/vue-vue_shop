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

        <!-- 警告提示区 -->
        <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！"
         type="warning" :closable="false">
        </el-alert>
         <!-- 选择商品分类区 -->
         <el-row class="cat_opt">
                 <span>选择商品分类:</span>
         <!-- 选择商品分类初级选择框 -->
           <el-cascader expand-trigger="hover" :options="cateList" :props="cateProps"
            v-model="selectedCateKeys" @change="handleChange">
           </el-cascader>
        </el-row>
        
         <!-- tab页签区 -->
         <el-tabs v-model="activeName" @tab-click="handleTabClick">

            <!-- 添加动态参数的面板 -->
           <el-tab-pane label="动态参数" name="many">
               <!-- 添加参数的按钮 -->
               <el-button type="primary" size="mini" @click="addDialogVisible = true"
                 :disabled="isBtnDisabled">添加参数</el-button>
                 <!-- 动态参数表格 -->
                 <el-table :data="manyTableData" border stripe>
                     <!-- 展开行 -->
                     <el-table-column type="expand">
                         <!-- 循环渲染tag标签 -->
                         <template slot-scope="scope">
                             <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                             @close="handleClose(i,scope.row)" closable>
                                 {{item}}
                             </el-tag>
                             <!-- 输入的文本框 -->
                             <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                              v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                               @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm">
                             </el-input>
                             <!-- 添加按钮 -->
                             <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+New Tag</el-button>
                         </template>
                     </el-table-column>
                     <!-- 索引列 -->
                     <el-table-column type="index"></el-table-column>
                     <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                     <el-table-column label="操作">
                         <template slot-scope="scope">
                             <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                             <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                         </template>
                     </el-table-column>
                 </el-table>
           </el-tab-pane>

            <!-- 添加静态属性的面板 -->
           <el-tab-pane label="静态属性" name="only">
               <el-button type="primary" size="mini" @click="removeParams(scope.row.attr_id)"
                 :disabled="isBtnDisabled">静态属性</el-button>
                <!-- 静态属性表格 -->
                   <el-table :data="onlyTableData" border stripe>
                     <!-- 展开行 -->
                      <el-table-column type="expand">
                         <!-- 循环渲染tag标签 -->
                         <template slot-scope="scope">
                             <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                             @close="handleClose(i,scope.row)" closable>
                                 {{item}}
                             </el-tag>
                             <!-- 输入的文本框 -->
                             <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                              v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                               @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm">
                             </el-input>
                             <!-- 添加按钮 -->
                             <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+New Tag</el-button>
                         </template>
                     </el-table-column>
                     <!-- 索引列 -->
                     <el-table-column type="index"></el-table-column>
                     <el-table-column label="属性" prop="attr_name"></el-table-column>
                     <el-table-column label="操作">
                         <template slot-scope="scope">
                             <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEidtDialog(scope.row.attr_id)">编辑</el-button>
                             <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                         </template>
                     </el-table-column>
                 </el-table>
           </el-tab-pane>

         </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%"
     @close="addDialogClosed">
     <!-- 添加参数的对象表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>  
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible=false">取消</el-button>
           <el-button @click="addParams">确定</el-button>
      </span>
    </el-dialog>

     <!-- 修改参数的对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="editDialogVisible" width="50%"
     @close="editDialogClosed">
     <!-- 添加参数的对象表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>  
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible=false">取消</el-button>
           <el-button @click="editParams">确定</el-button>
      </span>
    </el-dialog>
    
 </div>
</template>

<script>
export default {
    data(){
        return{
            //商品分类列表
            cateList:[],
            //初级选择框配置对象
            cateProps:{
                value: 'cat_id',
                label: 'cat_name',
                children:'children'
            },
            //级联选择框双向绑定到的数组
            selectedCateKeys:[],
            //被激活页面签的名称
            activeName:'many',
            //动态参数的数据
            manyTableData:[],
            //静态属性的数据
            onlyTableData:[],
            //控制添加对话框的显示与隐藏
            addDialogVisible: false,
            //添加参数的表单数据对象
            addForm:{
                attr_name:''
            },
            //添加表单的验证规则对象
            addFormRules:{
                attr_name:[
                    {required:true,message:'请输入参数名称',tigger:blur},
                ]
            },
            //控制修改对话框的显示与隐藏
            editDialogVisible: false,
            //修改的表单数据对象
            editForm:{},
            //修改表单的验证规则对象
            editFormRules:{ attr_name:[
                    {required:true,message:'请输入参数名称',tigger:blur},
                ]
            },
           
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        //获取所有的商品分类列表
        async getCateList(){
            const {data:res}=await this.$http.get('categories')
            if(res.meta.status!==200){
                return this.$message.error('获取商品分类失败！');
            }
            this.cateList=res.data
            console.log(res);
        },

        //级联选择框中项变化，会触发这个函数
        handleChange(){
          this.getParamsData()
        },

        //tab页签点击事件的处理函数
        handleTabClick(){
            this.getParamsData()
        },

        //获取参数的列表数据
        async getParamsData(){
            //只允许选择三级分类
            //通过数组的长度判断
            if(this.selectedCateKeys.length!==3){
                this.selectedCateKeys=[],
                // 清空表格数据
                this.manyTableData=[],
                this.onlyTableData=[]
                return
            }
            //否则选中的是三级分类
            //根据所选分类的id和 当前面板的参数  获取对应的参数
            const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`
            ,{params:{sel:this.activeName}})

            if(res.meta.status!==200){
                return this.$message.error('获取参数列表失败！')
            }
            res.data.forEach(item=>{
                item.attr_vals=item.attr_vals ? item.attr_vals.splice(' ') : []
            })
             if(this.activeName='many'){
                 this.manyTableData=res.data
             }else{
                 this.onlyTableData=res.data
             }
        },

        //监听添加对话框关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        //监听对话框确定按钮
        addParams(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return 
                const {data:res}=await this.$http.post(`categories/${this.cateId}/attributes`,
                {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                
                if(res.meta.status!==201){
                    return this.$message.error('添加参数失败！')
                }

                this.$message.success('添加参数成功！')
                this.addDialogVisible=false
                this.getParamsData()
            })
        },

        //展示修改对话框
        async showEditDialog(attr_id){
            //查询当前参数信息
             const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
                              {params:{attr_sel: this.activeName}})
             if(res.meta.status!==200){
                 return this.$message.error('获取参数信息失败')
             }
             this.addForm=res.data
             this.editDialogVisible=true
        },
        //重置修改的表单
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        //点击确定按钮修改参数信息
        editParams(){
            this.$refs.editFormRef.validate(async valid=>{
               if(!valid) return 
               const{data:res}=await this.$http.put(`categories/${this.cateId}/attributes
                /${this.editForm.attr_id}`,
                {attr_name:this.editForm.attr_name,attr_sel:this.activeName})

                if(res.meta.status!==200){
                    return this.$message.error('修改参数失败')
                }

                this.$message.success('修改参数成功')
                this.getParamsData()
                this.editDialogVisible=false
            })
        },

        //根据id删除对应参数项
       async removeParams(){
          const confirmResult=await this.$confirm('此操作将永久删除该参数，是否继续？',
          '提示',{
              confirmButtonText:'确定',
              cancelButtonText: '取消',
              type:'warning'
          }).catch(err=>err)

          //用户取消操作
          if(confirmResult!=='confirm'){
              return this.$message.info('取消删除')
          }

          //删除业务逻辑
          const {data:res}=await this.$http.delete(`categories/${this.cateId}/attributes/${this.attr_id}`
          )

          if(res.meta.status!==200){
              return this.$message.error('删除参数失败！')
          }

          this.$message.success('删除参数成功！')
          this.getParamsData()
    },

    //文本框失去焦点或按下enter键触发的方法
    async handleInputConfirm(row){
        //如果剔除空格后长度为零
      if(row.inputValue.trim().length===0){
        row.inputValue=''
        row.inputVisible=false
        return
      }
      //如果没有return的后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue=''
      row.inputVisible=false
      this.saveAttrVals(row)
    },
    //点击按钮展示文本输入框
    showInput(row){
      row.inputVisible=true
      //让文本框自动获得焦点
      this.$nextTick(_=>{//此方法的作用：当页面上的元素被重新渲染之后，才会指定回调函数中的代码
          this.$refs.saveTagInput.$refs.input.focus()
      })
     },
     //删除标签
     handleClsoe(i,row){
         row.attr_vals.splice(i,1)
          this.saveAttrVals(row)
     },
     async saveAttrVals(row){
      //需要发起此次请求，保存此次操作
      const{data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
          attr_name: row.attr_name, 
          attr_sel:row.attr_sel,
          attr_vals:row.attr_vals
      })
      if(res.meta.status!==200){
          return this.$message.error('修改参数失败！')
      }
     }
   },
    computed:{
        //如果按钮需要被禁用则返回true，否则返回false
        isBtnDisabled(){
            if(this.selectedCateKeys.length!==3){
                return true
            }
            return false
        },
        //当前选中三级分类的id
        cateId(){
               if(this.selectedCateKeys.length ===3){
                return this.selectedCateKeys[2]
            }
            return null
        },
        titleText () {
            if (this.activeName === 'many') {
                return '动态参数'
            }
            return '静态属性'
        }
    }
}

</script>

<style lang="less" scoped>
.cat_opt{
    margin: 15px 0;
}
.el-tag{
    margin:10px;
}
.input-new-tag{
    width:120px;
}
</style>