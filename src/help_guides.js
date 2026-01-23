const HELP_GUIDES = {
  en: {
    'landing': {
      title: 'Welcome to ClassABC — Quick Start',
      body: `The Landing page helps you sign in or access the Student/Parent portals.

- Teacher: click **Login** to enter your account. If you are new, click **Get Started Free** to create a class.
- Student: click the **Student** role, enter the 5-digit code from your teacher to open the Student Portal.
- Parent: use the **Parent** role and enter your 5-digit parent code to view your child's report.

Signed-in teachers will see their classes and can click a class card to open the Class Dashboard.`
    },
    'teacher-portal': {
      title: 'Teacher Portal — Manage your classes',
      body: `This page lists your classes.

- Add a class: click **Add Class**, give it a name and optional avatar.
- Open a class: click a class card to go to the Class Dashboard.
- Edit/Delete: hover a class card to reveal the pencil (edit) and trash (delete) icons.

Changes are saved immediately to the app state.`
    },
    'class-dashboard': {
      title: 'Class Dashboard — Live classroom control',
      body: `*This is the main teacher workspace for a single class.*

- Sidebar: the left sidebar contains the primary tools (hover to see labels):
  - **Dashboard** (Home): return to the classes main page to choose another class Or add a new class.
  - **Assignments** (Clipboard): create and publish worksheets and send to students.
  - **Messages & Grading** (Message bubble): view submitted student work and grade it.
  - **Lucky Draw** (Dice): randomly pick winners and optionally award points.
  - **Progress Road**: shows class-level milestones and celebration progress.
  - **Attendance** (Check icon): toggle attendance mode to mark absent students.
  - **Access Codes** (QR): view student and parent login codes.
  - **Reports** (Chart): view class and student analytics over time.
  - **Timer** (Clock): start visual timers for activities.
  - **Attention Buzzer** (Bell): a quick alert to regain class focus.
  - **Whiteboard** (Board): open the drawing canvas for the class.
  - **Settings** (Cog): configure Points cards, roster and class options.

- **Select students:** *click a student card to open the Points  and give points.*
- **Whole class:** *click the "Whole Class" card to award points to everyone.*
- **Add student:** *click **Add Student** in the grid to add a new student.*
- **Attendance:** *toggle the Attendance mode (check icon) then click students to mark absent — absences exclude students from class-wide rewards.*
- **Lucky Draw:** *open the dice tool to pick random student winners and optionally award points.*

**All point changes go through the app's standard class update flow and persist to storage/back-end as configured. Use the sidebar icons to quickly jump to tools and remember that many actions (points, student edits) save automatically.*`
    },
    'assignments': {
      title: 'Assignments — Create and publish worksheets',
      body: `Create a worksheet by typing a title and adding questions using the right panel.

- Question types: Short answer, Multiple choice, Fill-the-blank, Matching, or a Reading passage.
- Add images: click the image icon inside a question to attach a photo.
- Assign: choose **All** or **Select** students, then click **Publish to Class**.
- Validation: empty questions are highlighted and prevent publishing.`
    },
    'Messages & Grading': {
      title: 'Inbox — Review and grade student submissions',
      body: `The Inbox page lets you review and grade student work.\n\n
      - Click the Inbox button to open the sidebar and view all student submissions.\n
      - Click a submission to view and grade student answers.\n
      - Enter points in the input, then click the grade button to save and send the grade.\n
      - Graded submissions move to 'Recently Graded'.\n
      - Use the Help button for guidance.\n
      - On mobile, labels appear under icons.\n
      - Use the Close button to exit the Inbox.`
    },
      
    'settings': {
      title: 'Settings — Class configuration',
      body: `Customize the class Points cards.

- Points Cards: add, edit, or delete reward/penalty cards (label, emoji, point value).
- Reset: use "Reset to Defaults" to restore a starter set of Points cards.`
    },
    'access-codes': {
      title: 'Access Codes — Student & Parent codes',
      body: `View each student's **Parent Code** and **Student Code** used to sign into Parent and Student portals.

- **QR Codes:** Each access code is also shown as a QR code. Scanning the QR code on a phone or tablet will log the user in directly to the correct portal
  (Parent or Student) without typing the code.
- **Copy QR:** Use the "Copy QR" button to copy the QR code as an image (PNG) to your clipboard. You can then paste it into emails, documents,
  or printouts for easy sharing.
- **Generated codes:** The Class Dashboard creates missing codes automatically when you open this page.
- **Copy a code:** You can also copy the text code and give it to the parent or student to login to their portal.
- **Parent access:** Parents can access their child's report using the Parent Code.
- **Student access:** Students use the Student Code to view and complete assignments.
- **Assignment visibility:** When submitted, assignments are visible to the teacher in the Messages & Grading section of the Class Dashboard.`
    },

    'settings-cards': {
      title: 'Points  configuration',
      body: `Customize the class Points cards.
- Points Cards: add, edit, or delete reward/penalty cards (label, emoji, point value).
- **Note**: in Edit mode, click the default emoji to open the emoji picker.
- Reset: use "Reset to Defaults" to restore a starter set of Points cards.`
    },
    'whiteboard': {
      title: 'Whiteboard — Draw, type, and export',
      body: `Right-side tools: Pencil, Highlighter, Text, Eraser, Color picker, and Size selector.

- Click and drag on the canvas to draw. Use the Text tool to type, press Enter to place text on the board.
- Export: click **Export PNG** to download the board as an image.
- Clear: use the trash button to wipe the canvas.`
    },
    'parent-portal': {
      title: 'Parent Portal — Quick access',
      body: `Parents enter their 5-digit parent code to view a child-specific report.

- Once logged in, the Parent view shows a simplified Reports page focused on that child.`
    },
    'student-portal': {
      title: 'Student Portal — View and complete assignments',
      body: `Students sign in with a 5-digit student code and can see assigned worksheets.

- Open an assignment to complete it.
- Completed assignments are stored locally and marked complete.
- Use the Refresh button if your teacher just sent a new assignment.`
    }
  },
    
  
  zh: {
    'landing': {
      title: '欢迎使用 ClassABC — 快速入门',
      body: `登录页用于教师/学生/家长进入系统或切换角色。

- 教师：点击 **登录** 输入账号。若您是新用户，请点击 **免费注册** 创建班级。
- 学生：选择 **学生** 角色，输入老师提供的 5 位代码以进入学生门户。
- 家长：选择 **家长** 角色并输入 5 位家长代码以查看学生报告。

登录后的教师会看到他们的班级卡片，点击卡片进入课堂仪表盘。`
    },
    'teacher-portal': {
      title: '教师门户 — 管理您的班级',
      body: `此页面列出您的所有班级。

- 添加班级：点击 **添加班级**，填写名称并可选上传头像。
- 打开班级：点击班级卡片进入该班级的课堂仪表盘。
- 编辑/删除：将鼠标悬停在卡片上即可看到铅笔（编辑）和垃圾桶（删除）图标。

所有更改会自动保存至应用状态。`
    },
    'class-dashboard': {
      title: '课堂仪表盘 — 实时课堂控制',
      body: `*这是单个班级的主要教师工作区。*

- 侧边栏：左侧包含主要工具（悬停查看标签）：
  - **仪表盘**（主页）：返回班级选择界面或添加新班级。
  - **作业**（剪贴板）：创建并发布练习题给学生。
  - **消息与评分**（消息）：查看学生提交并打分。
  - **抽奖**（骰子）：随机选取学生并可立即奖励积分。
  - **进度路线**：展示班级里程碑与庆祝进度。
  - **考勤**（勾选）：切换考勤模式以标记缺勤学生。
  - **访问码**（二维码）：查看学生和家长登录用码。
  - **报告**（图表）：查看班级和学生的历史数据。
  - **计时器**（时钟）：启动课堂计时器。
  - **提醒器**（铃铛）：快速吸引学生注意力。
  - **白板**：打开画板进行教学演示。
  - **设置**（齿轮）：配置积分卡、班级名册及其它选项。

- **选择学生：** 点击学生卡片打开评分弹窗并给予积分。
- **全班：** 点击“全班”卡片可一次性奖励全班。
- **添加学生：** 点击网格中的 **添加学生** 添加新成员。
- **考勤：** 切换考勤模式后点击学生标记缺勤 — 缺勤的学生将不会参与班级奖励。
- **抽奖：** 打开骰子工具随机选出获奖学生并可授予积分。

**所有积分更改会通过应用的更新流程保存并同步到存储/后端。侧边栏图标可快速跳转功能区，大多数操作会自动保存。*`
    },
    'assignments': {
      title: '作业 — 创建并发布练习',
      body: `在右侧面板输入标题并添加题目来创建练习。

- 题型：简答题、选择题、填空、连线或阅读理解。
- 添加图片：在题目中点击图片图标上传附件。
- 发布：选择 **所有学生** 或 **选择学生**，然后点击 **发布到班级**。
- 校验：空题会被标记并阻止发布。`
    },
    'Messages & Grading': {
      title: '消息与评分 — 审阅学生提交',
      body: `“消息与评分”显示右侧的提交列表以及左侧的选中作业详情用于评分。

- 选择待批改的提交查看学生答案。
- 在分数字段输入成绩并点击 **保存并发送** 返回反馈。
- 使用返回/关闭按钮回到仪表盘。`
    },

    'settings-cards': {
      title: '编辑积分卡',
      body: `本页允许您为班级添加、编辑或删除积分卡。
- 生成码：打开该页面时，如果缺失系统会自动生成。

- 选择单个学生或查看整个班级。'
    },
    'access-codes': {
    }
- 更改时间范围（周/月/年）更新图表。
- 支持切换语言以生成适合家长的报告。
- 使用教师笔记生成可复制给家长的简短摘要。`
    },
    'whiteboard': {
      title: '白板 — 绘制、输入与导出',
      body: `右侧工具：铅笔、荧光笔、文本、橡皮、颜色选择与尺寸选择。

- 点击画布绘制。使用文本工具输入文字，按回车固定到画板。
- 导出：点击 **导出 PNG** 下载图片。
- 清空：使用垃圾桶按钮清除画布。`
    },
    'parent-portal': {
      title: '家长门户 — 快速访问',
      body: `家长输入 5 位家长码查看孩子的专属报告。

- 登录后，家长视图会显示针对该学生的简化报告页面。`
    },
    'student-portal': {
      title: '学生门户 — 查看并完成作业',
      body: `学生使用 5 位学生码登录并查看分配给他们的练习。

- 打开作业完成提交。
- 已完成的作业会被标记并保存。
- 如果老师刚发送新作业，请点击刷新按钮。`
    }
  }
};

export default HELP_GUIDES;
