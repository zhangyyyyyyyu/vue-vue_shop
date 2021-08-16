<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片试图区 -->
        <el-card>
<!--alert警告区！！colsable是将警告去后的删除好隐藏掉;center控制文本居中显示 -->
            <el-alert title="添加商品信息" center type="info" show-icon 
            :closable="false"></el-alert>
<!--进度条!align-center控制文本居中显示;:active表示激活索引项(即此项索引高亮)-->
            <el-steps align-center finish-status="success" :space="200" :active="activeIndex-0">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!--form表单要包裹在tab栏之外,实现点击不同tab栏展示不同文本信息的效果;
            label-position="top"实现label在上文本框在下的效果-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
<!--tab栏区域!:tab-position表示tab栏居的位置;此处v-model和steps组件的active同用一数据项
(因为active接受数值,所以activeIndex(字符串)直接-0即可)这样实现进度条和tab栏联动的效果
 before-leave切换标签之前的钩子,若返回 false 或者返回 Promise 且被 reject,则阻止切换
 @tab-click即点击tab面板切换时的反应函数-->
              <el-tabs :tab-position="'left'" v-model="activeIndex" 
              :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                  <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                  </el-form-item>
                  <el-form-item label="商品价格" prop="goods_price">
                    <!-- type=number表示文本框只能输入数字 -->
                    <el-input v-model="addForm.goods_price" type="number"></el-input>
                  </el-form-item>
                  <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="addForm.goods_weight" type="number"></el-input>
                  </el-form-item>
                  <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="addForm.goods_number" type="number"></el-input>
                  </el-form-item>
                  <el-form-item label="商品分类" prop="goods_cat">
  <!--options绑定级联选择器的数据源;props绑定级联选择器的配置项,需要在data中设定配置规则;
   @change即表示更改选中项的变化;model将选中的id双向绑定;change即选择变化触发的函数;
   expand-trigger="hover"表示Cascader 级联选择器hover选择效果-->
                    <el-cascader v-model="addForm.goods_cat" expand-trigger="hover"
                    :options="cateList" :props="cateProps" @change="handleChange">
                    </el-cascader>
                  </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                  <!-- 商品参数展示页 -->
                  <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                    <el-checkbox-group v-model="item.attr_vals">
                      <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                  <el-form-item :label="item.attr_name" v-for="item in onlyTableData" 
                  :key="item.attr_id">
                    <el-input v-model="item.attr_vals"></el-input>
                  </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                  <!-- action表示图片要上传到的后台的api地址 p表示处理图片预览效果,r表示处理图片删除效果,lt表示看到的类型-->
                  <el-upload :action="uploadURL" :on-preview="handlePreview"
                  :on-remove="handleRemove" list-type="picture" :headers="headerObj">
                    <el-button size="small" type="primary">点击上传</el-button>   
                  </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                  <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                    <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
                </el-tab-pane>
              </el-tabs>
            </el-form>

            <!-- 预览图片的对话框 -->
              <el-dialog title="预览图片" :visible.sync="previewImgVisible" width="50%">
                 <img :src="previewPath" alt class="previewImg" />
              </el-dialog>
        </el-card>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data(){
        return{
            activeIndex:'0',
            addForm:{
                goods_name:'',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 选中的商品类别id数组
                goods_cat: [],
                // 上传图片临时对象数组
                pics: [],
                // 商品简介
                goods_introduce: '',
                // 动态参数和静态属性
                attrs: []
            },
            addFormRules:{
                goods_name:[ { required: true, message: '请输入商品名称', 
                trigger: 'blur' }],
                goods_price:[ { required: true, message: '请输入商品价格', 
                trigger: 'blur' }],
                goods_number:[ { required: true, message: '请输入商品数量', 
                trigger: 'blur' }],
                goods_weight:[ { required: true, message: '请输入商品重量', 
                trigger: 'blur' }],
                goods_cat:[ { required: true, message: '选择商品分类', 
                trigger:'blur'}],
            },
            //商品分类所有数据的列表(数组)
            cateList:[],
            //级联分类规则
            cateProps:{
                expandTrigger: 'hover',
                value: 'cat_id',//代表选中的是哪个值
                label: 'cat_name',//代表看到的是哪个属性
                children: 'children'//表示哪个属性实现父子节点的嵌套
            },
            //动态参数列表
            manyTableData:[],
            // 商品属性数组
            onlyTableData: [],
            //图片上传组件的headers请求头对象
            headerObj:{
                Authorization:
                window.sessionStorage.getItem('token')
            },
            imgUploadURL:'http://www.ysqorz.top:8888/api/private/v1/',
            // 图片预览地址
            previewPath: '',
            // 是否显示图片预览对话框
            previewImgVisible: false
          }
    },
    created(){
      this.getCateList()
    },
    methods:{
        //获取所有商品分类数据
        async getCateList(){
            const {data:res} = await this.$http.get('categories')
            
            if(res.meta.status!==200){
                return this.$message.error(res.meta.msg)
            }

            this.cateList=res.data
            console.log(res);
        },
        //商品类别改变时触发
        handleChange(){
         console.log(this.addForm.goods_cat);
         if(this.addForm.goods_cat.length!==3){//只能选中第三级选择项
           this.addForm.goods_cat=[]//goods_cat为空数组
         }
        },
        //阻止tab面板未填信息即跳转不同面板
        beforeTabLeave(activeName,oldActiveName){
                 //前者形参表将进入的页面名称，后者表将离开的页面名称
            if(oldActiveName === '0'&&this.addForm.goods_cat.length!==3){
                this.$message.error('请先选择商品分类！')
                return false
            }
        },
        //点击tab面板切换时的反应
        async tabClicked(){
           if(this.activeIndex==='1'){//证明选中了name为1的tab面板
               const{data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,
                { params: { sel: 'many' }})
               if(res.meta.status!==200){
                   this.$message.error('error')
               }
            res.data.forEach(item => {
                   item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
            })
           this.manyTableData=res.data
           }else if(this.activeIndex === '2') { // 请求静态属性
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {
                sel: 'only'
            }})
           if(res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
             }
                this.onlyTableData = res.data
           }
        },
        //处理图片预览效果
        handlePreview(){
           this.previewPath = file.response.data.url
           this.previewImgVisible = true
        },
        //处理图片的移除操作
        handleChange(file){
            //1.获取删除图片的临时路径
            const filePath=file.response.data.tem_path
            //2.从pics数组中找到对应的图片索引值
            const i=this.addForm.pics.fileIndex(x=>x.pic===filePath)
            //3.调用splice方法吧对应的图片删除
            this.addForm.pics.splice(i,1)
        },
        //监听图片上传成功的事件
        handleSuccess(response){
            //1.拼接一个图片信息兑现
           const picInfo={pic:response.data.tem_path}
           //2.将图片信息对象push到pics数组中
           this.addForm.pics.push(picInfo)
        },

        //点击添加商品
        add(){ // 添加商品前的表单预验证
          this.$refs.addFormRef.validate(async valid => {
            if(!valid) {
              return this.$message.error('请填写必要的表单预验证！')
            }
            // 执行添加商品操作
            // 将addForm 中的goods_cat转化成由逗号分隔的字符串,为了不影响级联选择框使用，深度拷贝一份
            const form = _.cloneDeep(this.addForm)
            form.goods_cat = form.goods_cat.join(',')
            // 处理动态参数
            this.manyTableData.forEach(item => {
              const newInfo = {
                attr_id: item.attr_id,
                attr_value: item.attr_vals.join(' ')
              }
              this.addForm.attrs.push(newInfo)
            })
            // 处理静态属性
            this.onlyTableData.forEach(item => {
              const newInfo = {
                attr_id: item.attr_id,
                attr_value: item.attr_vals
              }
              this.addForm.attrs.push(newInfo)
            })
            form.attrs = this.addForm.attrs

          // 添加商品
          const { data: res } = await this.$http.post('goods', form)
          if(res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          // 跳转到商品列表页
          this.$router.push('/goods')
          console.log(form)
        })
      }
    },
    computed:{
        cateId(){
           if(this.addForm.goods_cat.length === 3) {
               // 返回下标为2的元素，即三级分类Id
               return this.addForm.goods_cat[2]
          }
          return null
       }
        
    }
}
//本页亮点
//①alert提示项
//②step进度条
//③tab栏切换
</script>

<style scoped>
.el-checkBox{
    margin:0 10px 0 0 !important;
}
.btnAdd{
    margin-top:15px;
}
</style>