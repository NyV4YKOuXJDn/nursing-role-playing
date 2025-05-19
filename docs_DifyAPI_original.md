工作流编排对话型应用 API
对话应用支持会话持久化，可将之前的聊天记录作为上下文进行回答，可适用于聊天/客服 AI 等。

基础 URL
Code
http://www.hulichatbot.xyz/v1

Copy
Copied!
鉴权
Service API 使用 API-Key 进行鉴权。 强烈建议开发者把 API-Key 放在后端存储，而非分享或者放在客户端存储，以免 API-Key 泄露，导致财产损失。 所有 API 请求都应在 Authorization HTTP Header 中包含您的 API-Key，如下所示：

Code
  Authorization: Bearer {API_KEY}

Copy
Copied!
POST
/chat-messages
发送对话消息
创建会话消息。

Request Body
Name
query
Type
string
Description
用户输入/提问内容。

Name
inputs
Type
object
Description
允许传入 App 定义的各变量值。 inputs 参数包含了多组键值对（Key/Value pairs），每组的键对应一个特定变量，每组的值则是该变量的具体值。 如果变量是文件类型，请指定一个包含以下 files 中所述键的对象。 默认 {}

Name
response_mode
Type
string
Description
streaming 流式模式（推荐）。基于 SSE（Server-Sent Events）实现类似打字机输出方式的流式返回。
blocking 阻塞模式，等待执行完毕后返回结果。（请求若流程较长可能会被中断）。 由于 Cloudflare 限制，请求会在 100 秒超时无返回后中断。
Name
user
Type
string
Description
用户标识，用于定义终端用户的身份，方便检索、统计。 由开发者定义规则，需保证用户标识在应用内唯一。

Name
conversation_id
Type
string
Description
（选填）会话 ID，需要基于之前的聊天记录继续对话，必须传之前消息的 conversation_id。

Name
files
Type
array[object]
Description
文件列表，适用于传入文件结合文本理解并回答问题，仅当模型支持 Vision 能力时可用。

type (string) 支持类型：
document 具体类型包含：'TXT', 'MD', 'MARKDOWN', 'PDF', 'HTML', 'XLSX', 'XLS', 'DOCX', 'CSV', 'EML', 'MSG', 'PPTX', 'PPT', 'XML', 'EPUB'
image 具体类型包含：'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'
audio 具体类型包含：'MP3', 'M4A', 'WAV', 'WEBM', 'AMR'
video 具体类型包含：'MP4', 'MOV', 'MPEG', 'MPGA'
custom 具体类型包含：其他文件类型
transfer_method (string) 传递方式:
remote_url: 图片地址。
local_file: 上传文件。
url 图片地址。（仅当传递方式为 remote_url 时）。
upload_file_id 上传文件 ID。（仅当传递方式为 local_file 时）。
Name
auto_generate_name
Type
bool
Description
（选填）自动生成标题，默认 true。 若设置为 false，则可通过调用会话重命名接口并设置 auto_generate 为 true 实现异步生成标题。

Response
当 response_mode 为 blocking 时，返回 ChatCompletionResponse object。 当 response_mode 为 streaming时，返回 ChunkChatCompletionResponse object 流式序列。

  • ChunkChatCompletionResponse返回 App 输出的流式块，Content-Type 为 text/event-stream。 每个流式块均为 data: 开头，块之间以 \n\n 即两个换行符分隔，如下所示：data: {"event": "message", "task_id": "900bbd43-dc0b-4383-a372-aa6e6c414227", "id": "663c5084-a254-4040-8ad3-51f2a3c1a77c", "answer": "Hi", "created_at": 1705398420}\n\n
  • CopyCopied!流式块中根据 event 不同，结构也不同：
  • event: message LLM 返回文本块事件，即：完整的文本以分块的方式输出。
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • message_id (string) 消息唯一 ID
  • conversation_id (string) 会话 ID
  • answer (string) LLM 返回文本块内容
  • created_at (int) 创建时间戳，如：1705395332
  • event: message_file 文件事件，表示有新文件需要展示
  • id (string) 文件唯一ID
  • type (string) 文件类型，目前仅为image
  • belongs_to (string) 文件归属，user或assistant，该接口返回仅为 assistant
  • url (string) 文件访问地址
  • conversation_id (string) 会话ID
  • event: message_end 消息结束事件，收到此事件则代表流式返回结束。
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • message_id (string) 消息唯一 ID
  • conversation_id (string) 会话 ID
  • metadata (object) 元数据
  • usage (Usage) 模型用量信息
  • retriever_resources (array[RetrieverResource]) 引用和归属分段列表
  • event: tts_message TTS 音频流事件，即：语音合成输出。内容是Mp3格式的音频块，使用 base64 编码后的字符串，播放的时候直接解码即可。(开启自动播放才有此消息)
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • message_id (string) 消息唯一 ID
  • audio (string) 语音合成之后的音频块使用 Base64 编码之后的文本内容，播放的时候直接 base64 解码送入播放器即可
  • created_at (int) 创建时间戳，如：1705395332
  • event: tts_message_end TTS 音频流结束事件，收到这个事件表示音频流返回结束。
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • message_id (string) 消息唯一 ID
  • audio (string) 结束事件是没有音频的，所以这里是空字符串
  • created_at (int) 创建时间戳，如：1705395332
  • event: message_replace 消息内容替换事件。 开启内容审查和审查输出内容时，若命中了审查条件，则会通过此事件替换消息内容为预设回复。
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • message_id (string) 消息唯一 ID
  • conversation_id (string) 会话 ID
  • answer (string) 替换内容（直接替换 LLM 所有回复文本）
  • created_at (int) 创建时间戳，如：1705395332
  • event: workflow_started workflow 开始执行
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • workflow_run_id (string) workflow 执行 ID
  • event (string) 固定为 workflow_started
  • data (object) 详细内容
  • id (string) workflow 执行 ID
  • workflow_id (string) 关联 Workflow ID
  • sequence_number (int) 自增序号，App 内自增，从 1 开始
  • created_at (timestamp) 开始时间
  • event: node_started node 开始执行
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • workflow_run_id (string) workflow 执行 ID
  • event (string) 固定为 node_started
  • data (object) 详细内容
  • id (string) workflow 执行 ID
  • node_id (string) 节点 ID
  • node_type (string) 节点类型
  • title (string) 节点名称
  • index (int) 执行序号，用于展示 Tracing Node 顺序
  • predecessor_node_id (string) 前置节点 ID，用于画布展示执行路径
  • inputs (object) 节点中所有使用到的前置节点变量内容
  • created_at (timestamp) 开始时间
  • event: node_finished node 执行结束，成功失败同一事件中不同状态
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • workflow_run_id (string) workflow 执行 ID
  • event (string) 固定为 node_finished
  • data (object) 详细内容
  • id (string) node 执行 ID
  • node_id (string) 节点 ID
  • index (int) 执行序号，用于展示 Tracing Node 顺序
  • predecessor_node_id (string) optional 前置节点 ID，用于画布展示执行路径
  • inputs (object) 节点中所有使用到的前置节点变量内容
  • process_data (json) Optional 节点过程数据
  • outputs (json) Optional 输出内容
  • status (string) 执行状态 running / succeeded / failed / stopped
  • error (string) Optional 错误原因
  • elapsed_time (float) Optional 耗时(s)
  • execution_metadata (json) 元数据
  • total_tokens (int) optional 总使用 tokens
  • total_price (decimal) optional 总费用
  • currency (string) optional 货币，如 USD / RMB
  • created_at (timestamp) 开始时间
  • event: workflow_finished workflow 执行结束，成功失败同一事件中不同状态
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • workflow_run_id (string) workflow 执行 ID
  • event (string) 固定为 workflow_finished
  • data (object) 详细内容
  • id (string) workflow 执行 ID
  • workflow_id (string) 关联 Workflow ID
  • status (string) 执行状态 running / succeeded / failed / stopped
  • outputs (json) Optional 输出内容
  • error (string) Optional 错误原因
  • elapsed_time (float) Optional 耗时(s)
  • total_tokens (int) Optional 总使用 tokens
  • total_steps (int) 总步数（冗余），默认 0
  • created_at (timestamp) 开始时间
  • finished_at (timestamp) 结束时间
  • event: error 流式输出过程中出现的异常会以 stream event 形式输出，收到异常事件后即结束。
  • task_id (string) 任务 ID，用于请求跟踪和下方的停止响应接口
  • message_id (string) 消息唯一 ID
  • status (int) HTTP 状态码
  • code (string) 错误码
  • message (string) 错误消息
  • event: ping 每 10s 一次的 ping 事件，保持连接存活。
  • Errors
  • 404，对话不存在
  • 400，invalid_param，传入参数异常
  • 400，app_unavailable，App 配置不可用
  • 400，provider_not_initialize，无可用模型凭据配置
  • 400，provider_quota_exceeded，模型调用额度不足
  • 400，model_currently_not_support，当前模型不可用
  • 400，completion_request_error，文本生成失败
  • 500，服务内部异常
