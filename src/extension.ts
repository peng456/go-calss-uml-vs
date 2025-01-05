// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';



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
			// vscode.window.showInformationMessage(`当前工作区路径: ${projectPath}`);
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

		let cmdExce = "goclassuml --recursive=true --class_type_render_style=outer --ot=2 " + directory ;

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

			renderWithMermaid(stdout, mermaidScriptPath);
		});
	});

	context.subscriptions.push(showClassDiagramCommond);

}

function renderWithMermaid(plantUmlText: string, mermaidScriptPath: vscode.Uri) {
	// Create a new Webview panel or use an existing one.
	const panel = vscode.window.createWebviewPanel(
		'mermaidRenderer', // 标识符
		'Renderedr', // 显示名称
		vscode.ViewColumn.One, // 编辑器中的位置
		{
			enableScripts: true // 允许 Webview 执行脚本
		}	
	);
	const mermaidScriptUri = panel.webview.asWebviewUri(mermaidScriptPath);

	// Load mermaid.min.js into the webview and pass the PlantUml text.
	var content = getWebviewContent(plantUmlText, mermaidScriptUri);

	// vscode.window.showInformationMessage(content);

	// cp.exec('sleep 1');
	// console.log(content);


	// vscode.window.showInformationMessage("panel.webview.htmlpanel.webview.htmlpanel.webview.html");
	// vscode.window.showInformationMessage(panel.webview.html);

	// cp.exec('sleep 1');

	panel.webview.html = content;
	


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
	// vscode.window.showInformationMessage("getWebviewContent");
	// vscode.window.showInformationMessage(mermaidScriptUri.fsPath);
	// plantUmlText = mermaidScriptUri.fsPath
	// https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js
	// mermaidScriptUri
	// plantUmlText = `
// classDiagram
//   class  BindUnmarshaler~interface~ {
//         ClassType struct
//         +String name %% dog's name
// 	}
//   class Binding {           
//   }
//   BindUnmarshaler <|.. Binding : realizes
// 	`;

	// plantUmlText1 = `flowchart TD
    // A[Start] --> B[Do something]
    // B --> C{Is it OK?}
    // C -->|Yes| D[Done]
    // C -->|No| E[Retry]
    // E --> B`
	return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Mermaid Diagram</title>
          <script src="${mermaidScriptUri}" onload="onMermaidLoad()"></script>
          <script>
		  	mermaid.initialize({startOnLoad:true}); 
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
