<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区 -->
    <el-card>   
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="AddRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe row-key="id">
        <!-- 展开列 expand表示下拉展开列(很多情乱均可模仿此展开列写法+css)-->
        <el-table-column type="expand">
          <!-- 一级权限边框线和布局及数据 -->
          <template slot-scope="scope">
            <el-row
              :class="['vcenter','bdbottom',index1 === 0 ? 
               'bdtop':'']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限样式和展示数据 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级、三级权限边框线和布局及获取二级权限数据 -->
              <el-col :span="19">
                <el-row
                  :class="['vcenter',index2 === 0 ? '':'bdtop']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限样式及张氏数据 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限展示数据 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightsById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 index表示'#'索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRole(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoles(scope.row)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showDialogRights(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加角色" :visible.sync="AddRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
      <!-- ref：通过使用this.$ref.addRoleFormRef可获取到此dom元素，然用resetfiled
       方法将此dom元素隐藏，即实现关闭此表单的功能-->
      <el-form
        :model="addRoleForm"
        ref="addRoleFormRef"
        :rules="addRoleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightDialogClose"
    >
      <!-- 树形控件 -->
<!--data是数据源;props是此控件的属性绑定对象(data中有此具体对象);
   show-checkbox对应勾选框;node-key接受值为string类型此处对应位每个节点的id
   default-expand-all表示是否展示所有节点(若无它则默认为false);
   :default-checked-keys默认选中节点的id值数组-->
      <el-tree :data="rightsList" :props="treeProps"
        show-checkbox node-key="id"
        default-expand-all   ref="treeRef"
        :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible"
      width="50%" @close="editRoleDialogVisibleClose">
        <el-form :model="eidtForm" :rules="eidtFormRules" ref="eidtFormRef" label-width="100px">
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="eidtForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="eidtForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole()">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色对象
      rolesList: [],
      //权限对话框的显示与隐藏
      setRightsDialogVisible: false,
      //权限对象
      rightsList: [],
      // 树形控件数据绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认选中的三级权限id数组
      defKeys: [],
      roleId: '',
      //添加用户对话框
      AddRoleDialogVisible: false,
      //添加角色表单
      addRoleForm: {},
      //添加角色表单验证
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //编辑信息对话框
      editRoleDialogVisible: false,
      // 用户编辑表单对象
      eidtForm: {
        roleName: '',
        roleDesc: '',
      },
      // 验证对象
      eidtFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表信息
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$messge.error('获取角色列表失败！')
      }
      // 如果返回正常，把数据保存到rolesList中
      this.rolesList = res.data
    },

    //是否删除的权限id
    async removeRightsById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('删除权限失败！')
      }
      // 重新加载角色列表,这种会导致整个角色列表刷新，角色展开栏关闭
      this.getRolesList()
      // 返回的数据包含了最新的权限数据
      role.children = res.data
    },
    // 显示权限对话框
    async showDialogRights(row) {
      this.roleId = row.id
      // 获取权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败！')
      }
      this.rightsList = res.data
      // 调用递归函数获取三级权限的id,并保存到defKeys中,
      //通过defkeys传递给树形组件（即传递对应权限的id并使tree组件展示出来）
      this.getLeafKey(row, this.defKeys)
      this.setRightsDialogVisible = true
    },
    // 递归调用函数,获取三级节点的id,并保存到defKeys中
    getLeafKey(node, arr) {
      // 如果节点不存在children属性，说明是三级节点
      if(!node.children) {
        //则将此节点保存到defKeys中
        return arr.push(node.id)
      }
      // 遍历node节点(若不是三级节点则继续遍历)
      node.children.forEach((element) => {
        this.getLeafKey(element, arr)
      })
    },
    // 分配角色权限
    async allotRights() {
  //获取点击的权限的id,分为三级全选(可直接用getCheckedKeys()方法获取到)
//和一二级半选(可直接用getHalfCheckedKeys()获取到),直接从页面tree组件获取
      var keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // 将id数组用,分割拼接成一个新数组
      var idStr = keys.join(',')
      // 请求修改(选中的id已保存到roleId)
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.msg !== 200) {
        this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightsDialogVisible = false
    },
    // 关闭权限对话框(防bug)
    setRightDialogClose() {
      // 清空勾选的权限
      this.defKeys = []
    },

    // 添加角色对话框的关闭
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRoles () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.AddRoleDialogVisible = false
        this.getRolesList()
      })
    },

    // 删除角色
    async deleteRoles(row) {
      // 确认时，接收的confirmResult为confirm ,取消时 confirmResult为cancel
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      // 点击取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 确认删除
      const { data: res } = await this.$http.delete(`roles/${row.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('删除成功')
      // 重新请求最新数据
      this.getRolesList()
    },

    // 显示编辑角色对话框
    async showEditRole(row) {
      // 根据角色id获取角色信息，保存到编辑角色对象中
      const { data: res } = await this.$http.get(`roles/${row.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.eidtForm = res.data
      this.editRoleDialogVisible = true
    },
    //编辑按钮
    async editRole() {
      const { data: res } = await this.$http.put(
        `roles/${this.eidtForm.roleId}`,
        this.eidtForm
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.editRoleDialogVisible = false
      this.getRolesList()
    },
    editRoleDialogVisibleClose() {
      this.$refs.eidtFormRef.resetFields()
    },
  },
//此页特点
//①分配权限(树形组件+js)
//②展开列
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>