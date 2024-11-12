import { execSync } from "child_process";
import { readFileSync } from "fs";

// 获取版本类型参数 (patch|minor|major)
const versionType = process.argv[2] || "patch";
const validVersionTypes = ["patch", "minor", "major"];

if (!validVersionTypes.includes(versionType)) {
	console.error("Invalid version type. Use: patch, minor, or major");
	process.exit(1);
}

try {
	// 运行 npm version 命令，这会：
	// 1. 更新 package.json 中的版本
	// 2. 通过 version script 更新 manifest.json 和 versions.json
	// 3. 创建 git commit 和 tag
	execSync(`npm version ${versionType}`, { stdio: "inherit" });

	// 获取新版本号
	const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
	const newVersion = packageJson.version;

	// 推送更改和标签
	execSync("git push", { stdio: "inherit" });
	execSync(`git push origin ${newVersion}`, { stdio: "inherit" });

	console.log(`\nSuccessfully published version ${newVersion}`);
	console.log("The GitHub Action will create a release draft shortly.");
} catch (error) {
	console.error("Error during publish:", error);
	process.exit(1);
}
