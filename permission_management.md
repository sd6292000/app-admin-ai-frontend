# Super Admin (超级管理员)

English:

Given I am a Super Admin and I'm on the configuration item editing page (for either a new or existing item).

When I click on the "Access Policy" tab.

Then I see a section with two groups: "Maintainer Group" and "Developer Group".

And for each group, there is a list of checkboxes or toggles for the following permissions:

[ ] Read Configuration

[ ] Write Configuration Data

[ ] Delete Configuration

[ ] Change Application Assignment

And I can select or deselect any of these checkboxes for either group.

When I save the configuration, the system successfully applies the new policy.

Exception: If I try to save without defining a policy, the system prompts me to set at least the Read Configuration permission for at least one group.

中文:

前提: 我是一名超级管理员，并且正在配置项的编辑页面（无论是新建还是编辑已有）。

当: 我点击“访问策略”标签。

那么: 我会看到一个包含两个组的区域：“维护者组”和“开发者组”。

并且: 对于每个组，都有一个包含以下权限的复选框或开关列表：

[ ] 浏览配置

[ ] 更改配置数据

[ ] 删除配置

[ ] 更改应用关联

并且: 我可以为任一组勾选或取消勾选任何权限。

当: 我保存配置时，系统成功应用新的策略。

例外情况: 如果我试图在没有定义任何策略的情况下保存，系统会提示我至少为某个组设定浏览配置权限。

# Maintainer (维护人员)
English:

Given I am a Maintainer and I am viewing an application configuration item's page.

When the page loads, the system checks my ServiceNow role against the configuration item's policy.

Then based on the policy, I see the following:

If Write Configuration Data is permitted, the "Edit" button is visible and enabled.

If Delete Configuration is permitted, the "Delete" button is visible and enabled.

If Change Application Assignment is permitted, the "Change Application" button is visible and enabled.

If only Read Configuration is permitted, all modification buttons are hidden or disabled, and the page content is read-only.

Exception: If I somehow manage to call a restricted API (e.g., a PUT request to update data when I only have Read permission), the system will return a 403 Forbidden error with a clear message like "You do not have permission to modify this configuration." The UI will then show an error notification to the user.

中文:

前提: 我是一名维护人员，并且正在浏览某个应用配置项的页面。

当: 页面加载时，系统根据我的ServiceNow角色来检查该配置项的策略。

那么: 根据策略，我将看到以下情况：

如果更改配置数据权限被允许，“编辑”按钮可见并可用。

如果删除配置权限被允许，“删除”按钮可见并可用。

如果更改应用关联权限被允许，“更改应用”按钮可见并可用。

如果只允许浏览配置，所有修改按钮都被隐藏或禁用，页面内容为只读。

例外情况: 如果我设法调用了一个受限的API（例如，在只有浏览权限时发送PUT请求来更新数据），系统将返回403 Forbidden错误，并附带明确的提示，例如“您没有权限修改此配置”。页面会显示一个错误通知给用户。

# Developer (开发人员)
English:

Given I am a Developer and I'm viewing an application configuration item's page.

When the page loads, the system checks my ServiceNow role against the configuration item's policy.

Then based on the policy, I see a read-only view of the configuration content.

And the "Edit", "Delete", and "Change Application" buttons are completely hidden or grayed out and disabled.

Exception: If I use developer tools to manipulate the UI and try to trigger a modification, the underlying API request will fail. The system will return a 403 Forbidden error with the message "You do not have permission to modify this configuration."

中文:

前提: 我是一名开发人员，并且正在浏览某个应用配置项的页面。

当: 页面加载时，系统根据我的ServiceNow角色来检查该配置项的策略。

那么: 根据策略，我将看到配置内容的只读视图。

并且: “编辑”、“删除”和“更改应用”按钮完全被隐藏或变为灰色且不可用。

例外情况: 如果我使用开发者工具试图操作界面来触发修改，底层的API请求将失败。系统将返回403 Forbidden错误，并提示“您没有权限修改此配置”。

# Other Possible Operations (其他可能的操作)
除了基本的CRUD和应用关联之外，还有很多企业级操作可以被作为独立的权限进行管理，以实现更细粒度的控制。

1. Versioning and Publishing (版本控制与发布)
Create New Version (创建新版本): 允许用户基于当前配置创建一个新草稿版本，而不会影响线上环境。

Publish Version (发布版本): 将一个草稿版本推送到生产环境，使其生效。

Rollback Version (回滚版本): 将线上配置回滚到之前的某个版本，这通常是紧急情况下的关键操作。

2. Audit Trail and Monitoring (审计与监控)
View Audit Trail (查看审计日志): 访问某个配置项的所有历史变更记录，包括谁在何时做了什么。这是安全和合规的关键功能。

View Live Metrics (查看实时指标): 查看与该配置项相关的实时网关指标，如请求量、延迟和错误率。

3. Advanced Management (高级管理)
Disable/Enable Configuration (禁用/启用配置): 快速关闭或开启某个路由或配置项，而不需要删除它。

Export/Import Configuration (导出/导入配置): 允许用户将配置导出为文件进行备份，或从文件导入配置。

Request Peer Review (请求同行评审): 在发布配置更改前，将更改提交给其他有权限的用户进行审核。

这些操作都可以作为独立的权限粒度，在超级管理员的页面中以复选框的形式被定义，从而让您的配置管理系统更加健壮和安全。
