# 前端测试用例（详细表格）

| 编号 | 测试项 | 步骤/条件（含具体输入） | 预期结果 | 类型 |
|------|--------|------------------------|----------|------|
| F-01 | 语言切换 | 切换右上角语言为中文/English | 所有label/选项即时切换为对应语言 | 功能性 |
| F-02 | Tab切换 | 依次点击Basic/Backends/Cookies等Tab | 内容区切换，无滚动，内容正确 | 功能性 |
| F-03 | API配置加载 | 页面加载 | 所有表单项label/选项/校验规则均来自API | 功能性 |
| F-04 | 搜索-关键字 | 列表页输入"api" | 仅显示域名/路径/项目名包含"api"的数据 | 功能性 |
| F-05 | 搜索-域名 | 输入"test.example.com" | 仅显示域名为test.example.com的数据 | 功能性 |
| F-06 | 搜索-项目 | 选择"Project A" | 仅显示CMDB项目为Project A的数据 | 功能性 |
| F-07 | 搜索-状态 | 选择"启用" | 仅显示Enable为true的数据 | 功能性 |
| F-08 | 搜索-分页 | 切换到第2页 | 显示第2页数据，刷新后仍为第2页 | 功能性 |
| F-09 | BasicTab必填 | 域名/路径/后端转发路径/CMDB项目全部留空，点击提交 | 分别提示"Domain is required"等 | 内容校验 |
| F-10 | BasicTab唯一性 | 域名填"api.example.com"，路径填"/v1/*"，已存在同组合，点击提交 | 提示"Domain + Path Pattern must be unique" | 内容校验 |
| F-11 | BackendsTab增删 | 点击"Add Backend"，再点"删除" | 新增/删除目标服务器，数据同步 | 功能性 |
| F-12 | BackendsTab端口 | 端口填"-1"或"70000" | 提示"Port must be between 0-65535" | 内容校验 |
| F-13 | BackendsTab Proxy | 勾选Enable Web Proxy，填Proxy Host"proxy.local"，Port"8080"，Username"user"，Password"pass" | Proxy相关项显示，输入值同步，禁用后清空 | 功能性 |
| F-14 | BackendsTab Enable | 勾选/取消Enable | 状态切换，数据同步 | 功能性 |
| F-15 | BackendsTab Rewrite Host | 勾选/取消Rewrite Host | 状态切换，数据同步 | 功能性 |
| F-16 | CookiesTab策略 | 选择"Passthrough"/"Persist" | 策略切换，数据同步 | 功能性 |
| F-17 | CookiesTab增删 | 点击"Add Excluded Cookie"，再点"Remove" | 新增/删除Excluded Cookie，数据同步 | 功能性 |
| F-18 | CookiesTab校验 | Cookie Name填"abc@def" | 提示"Invalid Cookie Name (RFC6265)" | 内容校验 |
| F-19 | CookiesTab模糊匹配 | 勾选/取消Started With | 状态切换，数据同步 | 功能性 |
| F-20 | HeadersTab增删 | 点击"Add Request Header"，再点"Remove" | 新增/删除Header，数据同步 | 功能性 |
| F-21 | HeadersTab校验 | Name或Value留空 | 提示"Name is required"/"Value is required" | 内容校验 |
| F-22 | HeadersTab Override | 勾选/取消Override | 状态切换，数据同步 | 功能性 |
| F-23 | ResponseBodyDecorator增删 | 点击"Add Mapping"，再点"Remove" | 新增/删除Error Page Mapping，数据同步 | 功能性 |
| F-24 | ResponseBodyDecorator校验 | Page Path填"abc"或"http:/bad" | 提示"Must be URI Path or Full URL" | 内容校验 |
| F-25 | LimitersTab增删 | 点击"Add Rule"，再点"Remove" | 新增/删除IP规则，数据同步 | 功能性 |
| F-26 | LimitersTab校验 | IP填"999.999.999.999"或"1.1.1.1/99" | 提示"Invalid IPv4 or CIDR" | 内容校验 |
| F-27 | LimitersTab方法 | 勾选/取消"GET"/"POST" | 状态切换，数据同步 | 功能性 |
| F-28 | LimitersTab并发/频率 | Max Concurrent填"-1"，Max Calls Per Minute填"abc" | 提示"Must be a positive number"/"Must be a number" | 内容校验 |
| F-29 | 表单提交 | 所有字段填写有效值，点击提交 | 弹窗展示详情，确认后POST，成功/失败有提示 | 功能性 |
| F-30 | 权限-只读 | 只读用户登录，尝试编辑/提交/删除 | 所有输入项/按钮禁用，无提交/删除 | 安全性 |
| F-31 | 权限-编辑 | 编辑用户登录，尝试删除 | 可编辑/保存，删除按钮不可见 | 安全性 |
| F-32 | 权限-管理员 | 管理员登录，尝试新建/编辑/删除 | 可新建/编辑/删除，操作成功 | 安全性 |
| F-33 | 权限-无权 | 无权限用户访问页面 | 显示"无权限"，API返回403 | 安全性 |
| F-34 | API越权 | 只读/编辑用户用Postman等直接POST/DELETE | 返回403，操作被拒绝 | 安全性 |
| F-35 | API日志 | 管理员新建/编辑/删除后端 | 后端日志有操作记录 | 安全性 |
| F-36 | XSS防护 | 输入<script>alert(1)</script>到任意输入框 | 页面无弹窗/无脚本执行 | 安全性 |
| F-37 | CSRF防护 | 用第三方站点伪造POST | API拒绝，安全无漏洞 | 安全性 |
| F-38 | 数据同步 | 在BackendsTab添加后切换到其它Tab再切回 | 新增数据未丢失，context同步 | 功能性 |
| F-39 | 多语言内容 | 切换语言后提交 | 提交内容为当前语言label/选项 | 功能性 |
| F-40 | 响应式UI | 手机/平板/PC访问 | 布局自适应，操作无障碍 | 功能性 | 