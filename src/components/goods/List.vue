<template>
  <div>
     <!-- 面包屑导航区 -->
     <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

     <!--商品试图区 -->
     <el-card>
         <el-row  :gutter="20">
             <el-col :span="8">
                 <el-input placeholder="请输入商品内容" v-model="queryInfo.query" clearable @clear="getGoodList">
                     <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                 </el-input>
             </el-col>
             <el-col :span="4">
                 <el-button type="primary" @click="goAddGoods">添加商品</el-button>
             </el-col>
         </el-row>

           <!-- table表格区域 -->
     <el-table :data="goodslist" border stripe>
         <el-table-column type="index"></el-table-column>
         <el-table-column label="商品名称" prop="goods_name"></el-table-column>
         <el-table-column label="商品价格（元）" width="90px" prop="goods_price"></el-table-column>
         <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
         <el-table-column label="创建时间" prop="add_time" width="120px">
             <template slot-scope="scope">
               {{scope.row.add_time | dateFormat}}
             </template>
         </el-table-column>
         <el-table-column label="操作" width="130px">
             <template slot-scope="scope">
               <el-button type="danger" icon="el-icon-delet"
                @click="removeById(scope.row.goods_id)">删除</el-button>
             </template>
         </el-table-column>
     </el-table>

         <!-- 分页区域 -->
         <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagesize"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total" background
      ></el-pagination>
     </el-card>

  </div>
</template>

<script>
export default {
    data(){
        return{
            //查询参数对象
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            //商品列表
            goodslist:[],
            //总数据条数
            total:0
        }
    },
    created(){
        this.getGoodsList()
    },
    methods:{
        //根据分页获取对应数据列表
        async getGoodsList(){
            const{data:res}=await this.$http.get('goods',{
                params:this.queryInfo
            })
            if(res.meta.status!==200){
                return this.$message.error('获取商品列表失败')
            }
            this.$message.success('成功')
            this.goodslist=res.data.goods
            this.total=res.data.total
        },
        // pagesize改变
        handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        // 重新请求商品数据
        this.getGoodsList()
        },
        // pagenum改变
        handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
        },
         // 根据ID删除商品
        async removeById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') {
            return this.$message.info('已取消删除')
        }
        
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if(res.meta.status !== 200) {
            this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getGoodsList()
        },
        //
        goAddGoods(){
            this.$router.push('/goods/add')
        }
    }
}
</script>

<style lang="less" scoped>
</style>