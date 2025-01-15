// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import 'fs';
import axios from "axios";
// import { completion } from 'litellm' ;



// 导入 prompts.ts 中的常量
import { SYSTEM_FIRST_PROMPT, SYSTEM_SECOND_PROMPT, SYSTEM_THIRD_PROMPT } from './prompts';
import { json } from 'stream/consumers';
import { promises } from 'dns';



// DeepSeek API 的基础配置
const deepSeekConfig = {
	baseUrl: "https://api.deepseek.com/v1/completion", // DeepSeek 的 API 地址
	// apiKey: "sk-ab52e831715e4d439a7850c9a073af88", // 替换为你的 API 密钥
	apiKey: "sk-ba182f6fe539473e8dd6c73ea872bd13", // 替换为你的 API 密钥
};


function formatUserMessage(data: Record<string, string>): string {
	/** Helper method to format the data into a user message */
	const parts: string[] = [];

	for (const [key, value] of Object.entries(data)) {
		if (key === 'file_tree') {
			parts.push(`<file_tree>\n${value}\n</file_tree>`);
		} else if (key === 'readme') {
			parts.push(`<readme>\n${value}\n</readme>`);
		} else if (key === 'explanation') {
			parts.push(`<explanation>\n${value}\n</explanation>`);
		} else if (key === 'component_mapping') {
			parts.push(`<component_mapping>\n${value}\n</component_mapping>`);
		} else if (key === 'instructions' && value !== "") {
			parts.push(`<instructions>\n${value}\n</instructions>`);
		} else if (key === 'diagram') {
			parts.push(`<diagram>\n${value}\n</diagram>`);
		}
	}

	return parts.join("\n\n");
}


const
	installDependency = () => {
		vscode.window.showInformationMessage(
			'是否执行安装依赖命令？',
			'确认',
			'取消'
		).then(selection => {
			if (selection === '确认') {
				const command = 'go install github.com/peng456/goclassuml@least';
				cp.exec(command, (error, stdout, stderr) => {
					if (error) {
						vscode.window.showErrorMessage(`执行命令失败: ${error.message}`);
						return;
					}
					if (stderr) {
						vscode.window.showWarningMessage(`命令输出警告: ${stderr}`);
						return;
					}
					vscode.window.showInformationMessage(`命令执行成功: ${stdout}`);
				});
			}
		});
	};


// async function callDeepSeekOld(system_prompt: string, data: Record<string, string>) {
// 	// 初始化 LLM 实例
// 	const llm = new LLM({
// 		baseUrl: deepSeekConfig.baseUrl, // 设置 API 地址
// 		headers: {
// 			"Authorization": `Bearer ${deepSeekConfig.apiKey}`, // 设置 API 密钥
// 			"Content-Type": "application/json", // 确保发送的是 JSON
// 		},
// 	});

// 	// 入参处理
// 	let fordata = formatUserMessage(data);

// 	try {
// 		// 调用 API
// 		const response = await llm.chat({
// 			// model:"claude-3-5-sonnet-latest",
// 			model:"deepseek-chat",
// 			messages: [
// 					{ role: "user", content: [
// 										{ 	type: "text", text: fordata }
// 									],
// 					},
// 			], 
// 			stream: false,
// 			system: system_prompt,
// 			max_tokens: 4096, // 最大生成长度
// 			temperature: 0, // 调整生成内容随机性
// 		});

// 		console.log("DeepSeek 响应:", response);
// 		return response.choices?.[0]?.message?.content; // 返回生成的内容
// 	} catch (error) {
// 		console.error("调用 DeepSeek API 出错:", error);
// 		throw error;
// 	}
// }

// async function callDeepSeekOld(system_prompt: string, data: Record<string, string>) {

// 	process.env['OPENAI_API_KEY'] = deepSeekConfig.apiKey;

// 	// 入参处理
// 	let fordata = formatUserMessage(data);
// 	let nestedContent = [
// 		{ type: "text", text: fordata }
// 	];
// 	try {

// 		const response = await completion({
// 			baseUrl: deepSeekConfig.baseUrl,
// 			apiKey: deepSeekConfig.apiKey,
// 			// temperature: 0.5,
// 			// max_tokens: 1024,
// 			model: 'openai/deepseek-chat',
// 			messages: [
// 				{
// 					role: "user",
// 					content: JSON.stringify(nestedContent)
// 				},
// 			],
// 		});

// 		console.log("DeepSeek 响应:", response);
// 		return response.choices?.[0]?.message?.content; // 返回生成的内容
// 	} catch (error) {
// 		console.error("调用 DeepSeek API 出错:", error);
// 		throw error;
// 	}
// }

// 替换为你的 DeepSeek API 密钥
// const API_KEY = 'sk-ab52e831715e4d439a7850c9a073af88';
const API_KEY = 'sk-ba182f6fe539473e8dd6c73ea872bd13';
// const API_URL = 'https://api.deepseek.com/v1/completions'; // 替换为实际的 API 端点
const API_URL = 'https://api.deepseek.com/chat/completions'; // 替换为实际的 API 端点

async function callDeepSeek(system_prompt: string, data: Record<string, string>): Promise<string> {
	try {

		// 入参处理
		let fordata = formatUserMessage(data);
		// let nestedContent = [
		// 	{ type: "text", text: fordata }
		// ];

		let body = {
			// 请求体参数
			model: "deepseek-chat",
			// prompt: "hello world",
			// max_tokens: 4096,
			temperature: 0,
			stream: false,
			messages: [
				{ role: 'system', content: system_prompt },
				// { role: 'user', content: 'How do I use the API?' }
				// { role: 'user', content: JSON.stringify(nestedContent) }
				{ role: 'user', content: fordata }
			],
		};
		console.log('请求体:', body);

		const response = await axios.post(API_URL,
			body,
			{
				headers: {
					'Authorization': `Bearer ${API_KEY}`,
					'Content-Type': 'application/json',
				},

			}
		);


		console.log('API 响应:', response.data);
		return response.data.choices?.[0]?.message?.content || ''; // 返回生成的内容或空字符串

	} catch (error) {
		console.error('调用 API 时出错:', error);
		throw error; // 抛出错误以便外部处理

	}
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {



	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "goclassshow" is now active!');


	const showClassDiagramCommond = vscode.commands.registerCommand('goclassshow.showgoclassdiagram', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		// 获取当前打开的文件路径
		const editor = vscode.window.activeTextEditor;
		let filePath = '';
		if (editor) {
			filePath = editor.document.uri.fsPath;
			// vscode.window.showInformationMessage(`当前文件路径: ${filePath}`);
		} else {
			vscode.window.showInformationMessage('没有打开文件');
		}

		// 获取当前工作区路径
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && (workspaceFolders.length > 0)) {
			const projectPath = workspaceFolders[0].uri.fsPath; // 获取第一个工作区的路径
		} else {
			vscode.window.showInformationMessage('没有打开工作区');
		}
		// 执行命令行 检测 git 是否安装
		cp.exec('goclassuml --version', (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage('请先安装 goclassuml');
				// 询问用户是否 执行 依赖安装命令 ；如果按转 则执行 go install github.com/peng456/goclassuml@least
				installDependency();
				return;
			}

			// vscode.window.showInformationMessage(stdout);

		});

		// js 获取某个文件的所在的目录
		let directory = path.dirname(filePath);

		// vscode.window.showInformationMessage(directory);

		let cmdExce = "goclassuml --recursive=true --class_type_render_style=outer --ot=2 " + directory;

		cp.exec(cmdExce, async (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage(cmdExce + ' 执行失败' + error);
				return;
			}

			// vscode.window.showInformationMessage(stdout);
			// 计算 string 长度
			// const len = stdout.length;

			// 停顿 1s ts 代码
			// await new Promise(resolve => setTimeout(resolve, 100));

			// vscode.window.showInformationMessage("长度");
			// await new Promise(resolve => setTimeout(resolve, 100));

			// vscode.window.showInformationMessage(stdout.length.toString());
			// await new Promise(resolve => setTimeout(resolve, 1000));

			// stdout 是符合mermaid语法的字符串，请渲染 webiew

			// 获取本地 mermaid.min.js 文件的 URI
			const mermaidScriptPath = vscode.Uri.file(
				path.join(context.extensionPath, 'media', 'mermaid.min.js')
			);
			// vscode.window.showInformationMessage(mermaidScriptPath.fsPath);

			renderWithMermaid(stdout, mermaidScriptPath,context);
		});
	});

	context.subscriptions.push(showClassDiagramCommond);


	const gitdiagramCommond = vscode.commands.registerCommand('goclassshow.gitdiagram_generate', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

	// 	let mermaidCode = `
	// 	flowchart TD
    // subgraph "Gin Framework"
    //     CoreEngine["Core Engine"]:::core
    //     Router["Router"]:::core
    //     Context["Context"]:::core
    //     Binding["Binding"]:::binding
    //     Rendering["Rendering"]:::rendering
    //     Middleware["Middleware"]:::middleware
    //     Utilities["Utilities"]:::utilities
    //     TestingExamples["Testing and Examples"]:::testing
    //     DocumentationConfig["Documentation and Configuration"]:::docs

    //     CoreEngine --> Router
    //     Router --> Context
    //     Context --> Middleware
    //     Middleware --> Binding
    //     Middleware --> Rendering
    //     Context --> Binding
    //     Context --> Rendering
    //     Utilities --> CoreEngine
    //     Utilities --> Router
    //     Utilities --> Context
    //     TestingExamples --> CoreEngine
    //     TestingExamples --> Router
    //     TestingExamples --> Context
    //     DocumentationConfig --> CoreEngine
    //     DocumentationConfig --> Router
    //     DocumentationConfig --> Context
    // end

    // classDef core fill:#96c8ff,stroke:#333,stroke-width:2px
    // classDef binding fill:#ffcc99,stroke:#333,stroke-width:2px
    // classDef rendering fill:#99ff99,stroke:#333,stroke-width:2px
    // classDef middleware fill:#ff9999,stroke:#333,stroke-width:2px
    // classDef utilities fill:#cccccc,stroke:#333,stroke-width:2px
    // classDef testing fill:#ffccff,stroke:#333,stroke-width:2px
    // classDef docs fill:#ccffff,stroke:#333,stroke-width:2px

    // click CoreEngine "javascript:openFile('fileA.txt');"


    // click Router "openFile://Users/peng/lab/gin/routergroup.go"
    // click Context "openFile://Users/peng/lab/gin/context.go"
    // click Binding "openFile://Users/peng/lab/gin/binding/"
    // click Rendering "openFile://Users/peng/lab/gin/render/"
    // click Middleware "openFile://Users/peng/lab/gin/middleware_test.go"
    // click Utilities "openFile://Users/peng/lab/gin/utils.go"
    // click TestingExamples "openFile://Users/peng/lab/gin/examples/"
    // click DocumentationConfig "openFile://Users/peng/lab/gin/docs/"	"Open Documentation"
	// 	`;


	// 	// 获取本地 mermaid.min.js 文件的 URI
	// 	const mermaidScriptPath = vscode.Uri.file(
	// 		path.join(context.extensionPath, 'media', 'mermaid.min.js')
	// 	);

	// 	renderWithMermaid(mermaidCode, mermaidScriptPath, context);

	// 	return;






		// 获取当前打开的文件路径
		const editor = vscode.window.activeTextEditor;
		let filePath = '';
		if (editor) {
			filePath = editor.document.uri.fsPath;
			// vscode.window.showInformationMessage(`当前文件路径: ${filePath}`);
		} else {
			vscode.window.showInformationMessage('没有打开文件');
		}

		// 获取当前工作区路径
		let projectPath = '';
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && (workspaceFolders.length > 0)) {
			projectPath = workspaceFolders[0].uri.fsPath; // 获取第一个工作区的路径
		} else {
			vscode.window.showInformationMessage('没有打开工作区');
		}

		try {
			// 第一阶段：解释项目结构
			// 获取 readme.md 文件内容
			const fs = require('fs');
			let readmeContentLLM = '';
			if ((!fs.existsSync(path.join(projectPath, 'readme.md'))) && (!fs.existsSync(path.join(projectPath, 'README.md')))) {
				vscode.window.showInformationMessage('readme.md 文件不存在');
			} else {
				let readmeFilePath = path.join(projectPath, 'readme.md');
				// 读取文件内容
				const readFile = (filePath: string) => {
					try {
						const readmeContent = fs.readFileSync(filePath, 'utf8');
						return readmeContent;
					} catch (err) {
						console.error(err);
						return '';
					}
				};

				readmeContentLLM = readFile(readmeFilePath);

			}

			// 查询消耗token数

			// Prepare system prompts with instructions if provided
			let first_system_prompt = SYSTEM_FIRST_PROMPT;
			let second_system_prompt = SYSTEM_SECOND_PROMPT;
			// - This is a correct click event: \`click Example "openFile:app/example.js"\`

			let third_system_prompt = SYSTEM_THIRD_PROMPT;
			// 	if body.instructions:
			// 		first_system_prompt = first_system_prompt + \
			// 	"\n" + ADDITIONAL_SYSTEM_INSTRUCTIONS_PROMPT
			// 	third_system_prompt = third_system_prompt + \
			// 	"\n" + ADDITIONAL_SYSTEM_INSTRUCTIONS_PROMPT

			//  get the explanation for sysdesign from claude
			// vscode.window.showInformationMessage(projectPath);

			// 获取项目结构
			let file_tree = getProjectFileTree(projectPath);
			const fileTreeStr = (await file_tree).join("\n");
			let data = {
				"file_tree": fileTreeStr,
				"readme": readmeContentLLM,
				// "instructions": body.instructions
			};

			// vscode.window.showInformationMessage(first_system_prompt, JSON.stringify(data));

			//  获取解释 && 第一次调用 DeepSeek API
			let explanation = callDeepSeek(first_system_prompt, data);

			const explanationStr = await explanation;
			
			if (typeof explanationStr !== 'string' || typeof fileTreeStr !== 'string') {
				vscode.window.showErrorMessage('Failed to generate component mapping: Invalid input data');
				return;
			}

			// 检查 explanation 是否包含 "BAD_INSTRUCTIONS"
			if (explanationStr.includes("BAD_INSTRUCTIONS")) {
				vscode.window.showErrorMessage('Invalid or unclear instructions provided');
				return; // 返回以停止进一步处理
			}

			// 第二阶段：映射组件到文件结构 && 第二次调用 deepseek api
			const componentMapping: string = await mapComponentsToFileStructure(explanationStr, second_system_prompt, fileTreeStr); // 假设该函数也返回 Promise
			console.log('componentMapping:', componentMapping);

			const componentMappingText = extractComponentMapping(componentMapping);
			console.log('componentMappingText:', componentMappingText);


			// 第三阶段：生成Mermaid.js代码
			const mermaidCode = await generateMermaidCodeFromLLM(third_system_prompt, explanationStr, componentMappingText); // 假设该函数也返回 Promise

			console.log('mermaidCode:', mermaidCode);

			// 处理 click

			// 获取本地 mermaid.min.js 文件的 URI
			const mermaidScriptPath = vscode.Uri.file(
				path.join(context.extensionPath, 'media', 'mermaid.min.js')
			);

			renderWithMermaid(mermaidCode, mermaidScriptPath, context);
		} catch (error) {
			let errorMessage: string;
			let errorStack: string | undefined;

			if (error instanceof Error) {
				errorMessage = error.message;
				errorStack = error.stack;
			} else {
				errorMessage = String(error);
				errorStack = undefined;

			}
			vscode.window.showErrorMessage(`Failed to draw architecture diagram: ${errorMessage}${errorStack ? `\n${errorStack}` : ''}`);
		}

	});

	context.subscriptions.push(gitdiagramCommond);

}

const startTag = "<component_mapping>";
const endTag = "</component_mapping>";

function extractComponentMapping(fullSecondResponse: string): string {
	const startIndex = fullSecondResponse.indexOf(startTag);
	const endIndex = fullSecondResponse.indexOf(endTag) + endTag.length;

	if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
		return ""; // 如果标签不存在或顺序不正确，返回空字符串
	}

	return fullSecondResponse.slice(startIndex, endIndex);
}

// 新增函数：映射组件到文件结构
export async function mapComponentsToFileStructure(explanation: string, system_prompt: string, file_tree: string,): Promise<string> {


	let data = {
		"explanation": explanation,
		"file_tree": file_tree,
	};

	// 调用 DeepSeek API 获取解释
	let res = await callDeepSeek(system_prompt, data);

	// 确保返回值不是 null 或 undefined
	if (typeof res !== 'string' || res === null || res === undefined) {
		vscode.window.showErrorMessage('Failed to generate component mapping: Invalid response from API');
		return ''; // 返回空字符串或其他默认值
	}

	return res;

}


async function getProjectFileTree(projectPath: string): Promise<string[]> {
	var files: string[] = [];

	async function readDirectory(dirPath: string, files: string[]): Promise<void> {
		const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
		for (const [name, type] of entries) {
			const fullPath = path.join(dirPath, name);
			// vscode.window.showInformationMessage(fullPath);

			if (inExcludeFile(fullPath)) {
				continue;
			}
			// vscode.window.showInformationMessage(fullPath);

			if (type === vscode.FileType.Directory) {
				await readDirectory(fullPath, files);
			} else if (type === vscode.FileType.File) {
				files.push(fullPath);
			}
		}
	}

	await readDirectory(projectPath, files);
	return files;
}

function inExcludeFile(path: string): boolean {
	// Patterns to exclude
	const excludedPatterns = [
		// Dependencies
		'node_modules/', 'vendor/', 'venv/',
		// Compiled files
		'.min\\.', '.pyc', '.pyo', '.pyd', '.so', '.dll', '.class',
		// Asset files
		'.jpg', '.jpeg', '.png', '.gif', '.ico', '.svg', '.ttf', '.woff', '.webp',
		// Cache and temporary files
		'__pycache__/', '.cache/', '.tmp/',
		// Lock files and logs
		'yarn.lock', 'poetry.lock', '\\.log',
		// Configuration files
		'\\.vscode', '\\.idea', '\\.github', '\\.git', '\\.gitignore', '\\.gitmodules', '\\.gitattributes', '\\.DS_Store',
	].map(pattern => new RegExp(pattern, 'i'));

	// Normalize path for consistent matching (e.g., convert to forward slashes)
	const normalizedPath = path.replace(/\\/g, '/').toLowerCase();

	return excludedPatterns.some(pattern => pattern.test(normalizedPath));

}
function renderWithMermaid(plantUmlText: string, mermaidScriptPath: vscode.Uri, context: vscode.ExtensionContext) {
	// Create a new Webview panel or use an existing one.
	const panel = vscode.window.createWebviewPanel(
		'mermaidRenderer', // 标识符
		'Renderedr', // 显示名称
		vscode.ViewColumn.One, // 编辑器中的位置
		{
			enableScripts: true, // 允许 Webview 执行脚本
			retainContextWhenHidden: true, // 保持 Webview 在隐藏时的状态

		}
	);

	const mermaidScriptUri = panel.webview.asWebviewUri(mermaidScriptPath);

	// Load mermaid.min.js into the webview and pass the PlantUml text.
	var content = getWebviewContent(plantUmlText, mermaidScriptUri);

	panel.webview.html = content;


	// // 监听 Webview 消息
	// panel.webview.onDidReceiveMessage(
	// 	message => {
	// 		switch (message.command) {
	// 			case 'openFile':
	// 				vscode.window.showInformationMessage(`${message.path}`);
	// 				// vscode.commands.executeCommand('vscode.open', vscode.Uri.file(message.path));

	// 				// const filePath = message.filePath;
	// 				// const fileUri = vscode.Uri.file(filePath);
	// 				// vscode.workspace.openTextDocument(fileUri).then(doc => {
	// 				// 	vscode.window.showTextDocument(doc);
	// 				// }, err => {
	// 				// 	vscode.window.showErrorMessage(`Failed to open file: ${err.message}`);
	// 				// });
	// 				return;
	// 		}

	// 	},
	// 	undefined,
	// 	context.subscriptions
	// );



	// return
	// let mermaidContentStr = `
	// 	graph LR
	// 	 	A[Start] --> B[Process]
	// 		B --> C
	// `;
	// panel.webview.html
	// panel.webview.postMessage({ command: 'renderMermaid', mermaidContent: mermaidContentStr });

}

function getWebviewContent(plantUmlText: string, mermaidScriptUri: vscode.Uri): string {

	return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Mermaid Diagram</title>
          <script src="${mermaidScriptUri}" ></script>
          <script>
		  	mermaid.initialize({startOnLoad:true}); 
            console.log('startOnLoad');

			window.addEventListener('click', function(event) {
			console.log('click');
			console.log(event);
			const href = event.target.href;

			const linkElement = event.target.closest('a');
			if (linkElement && linkElement.href) {
				const href = linkElement.href;
				console.log('href:', linkElement);
				console.log('href:', href);
				if (href.startsWith('openFile://')) {
					const filePath = href.substring('openFile://'.length);
					console.log('filePath:', filePath);
					window.acquireVsCodeApi().postMessage({
						command: 'openFile',
						filePath: filePath
					});
				} else if (href.startsWith('http://') || href.startsWith('https://')) {
					// 如果是外部链接，可以在这里处理
					window.open(href, '_blank');
				}
			}



		  </script>
          
      </head>
      <body>
          <div class="mermaid">${plantUmlText}</div>
      </body>
      </html>
    `;
}
// This method is called when your extension is deactivated
export function deactivate() { }


// 生成Mermaid.js代码
export async function generateMermaidCodeFromLLM(system_prompt: string, explanation: string, componentMappingText: string,): Promise<string> {


	let data = {
		"explanation": explanation,
		"component_mapping": componentMappingText,
		// "instructions": "",
	};


	// 调用 DeepSeek API 获取解释
	let res = await callDeepSeek(system_prompt, data);

	// 确保返回值不是 null 或 undefined
	if (typeof res !== 'string' || res === null || res === undefined) {
		vscode.window.showErrorMessage('Failed to generate component mapping: Invalid response from API');
		return ''; // 返回空字符串或其他默认值
	}

	return res;


}