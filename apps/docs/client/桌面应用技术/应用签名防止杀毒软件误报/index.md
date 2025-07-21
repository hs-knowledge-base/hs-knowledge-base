# 应用签名防止杀毒软件误报

## 简介

通过使用 签名工具 防止应用在安装时被杀毒软件误报为病毒。

## 步骤 1: https://evsign.cn/ 购买签名服务，下载签名工具

## 步骤 2: 打包后将.exe文件丢到签名工具中签名。

## 步骤 3: ！！！注：签名后latest.yml中.exe的sha512会改变，会导致更新失败，通过脚本将sha512替换掉。

```js
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const yaml = require("js-yaml");

function hashFile(file, algorithm = "sha512", encoding = "base64") {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    hash.on("error", reject).setEncoding(encoding);

    fs.createReadStream(file, {
      highWaterMark: 1024 * 1024, // 1MB chunks for better performance
    })
      .on("error", reject)
      .on("end", () => {
        hash.end();
        resolve(hash.read());
      })
      .pipe(hash, { end: false });
  });
}

/**
 * 获取最新版本的文件夹
 * @returns {string} 最新版本的文件夹路径
 */
const getLatestVersionFolder = () => {
  const RELEASE_DIR = "./release";

  // 读取release目录下的所有文件夹
  const versionFolders = fs
    .readdirSync(RELEASE_DIR)
    .filter((folder) => {
      const folderPath = path.join(RELEASE_DIR, folder);
      return (
        fs.statSync(folderPath).isDirectory() && /^\d+\.\d+\.\d+$/.test(folder)
      );
    })
    .sort((a, b) => {
      // 按版本号排序（假设版本号格式为x.y.z）
      const versionA = a.split(".").map(Number);
      const versionB = b.split(".").map(Number);

      for (let i = 0; i < 3; i++) {
        if (versionA[i] !== versionB[i]) {
          return versionB[i] - versionA[i]; // 降序排列，最新版本在前
        }
      }
      return 0;
    });

  if (versionFolders.length === 0) {
    throw new Error("没有找到任何版本文件夹");
  }

  const latestVersion = versionFolders[0];
  console.log(`找到最新版本: ${latestVersion}`);
  return path.join(RELEASE_DIR, latestVersion);
};

async function updateChecksum() {
  try {
    // 动态获取最新版本文件夹
    const releaseDir = getLatestVersionFolder();
    const absoluteReleaseDir = path.resolve(releaseDir);

    // 查找exe文件（支持不同的命名格式）
    const files = fs.readdirSync(absoluteReleaseDir);
    const exeFiles = files.filter(
      (file) => file.endsWith(".exe") && !file.endsWith(".blockmap")
    );

    if (exeFiles.length === 0) {
      console.error("错误：在目录中找不到 .exe 文件:", absoluteReleaseDir);
      return;
    }

    const exeFile = path.join(absoluteReleaseDir, exeFiles[0]);
    const latestYmlPath = path.join(absoluteReleaseDir, "latest.yml");

    // 检查文件是否存在
    if (!fs.existsSync(exeFile)) {
      console.error("错误：找不到 .exe 文件:", exeFile);
      return;
    }

    if (!fs.existsSync(latestYmlPath)) {
      console.error("错误：找不到 latest.yml 文件:", latestYmlPath);
      return;
    }

    console.log("正在计算签名后文件的 SHA512...");
    console.log("处理文件:", exeFile);

    // 计算新的 sha512
    const newSha512 = await hashFile(exeFile);
    console.log("新的 SHA512:", newSha512);

    // 读取并更新 latest.yml
    const ymlContent = fs.readFileSync(latestYmlPath, "utf8");
    const data = yaml.load(ymlContent);

    if (data && data.sha512) {
      console.log("旧的 SHA512:", data.sha512);

      // 更新主 sha512 字段
      data.sha512 = newSha512;

      // 更新 files 数组中的 sha512
      if (data.files && data.files.length > 0) {
        data.files[0].sha512 = newSha512;
      }

      // 写回文件
      fs.writeFileSync(latestYmlPath, yaml.dump(data));
      console.log("✅ 已成功更新 latest.yml 中的 SHA512 校验和");
      console.log("更新的文件:", latestYmlPath);
    } else {
      console.error("错误：latest.yml 文件格式不正确");
    }
  } catch (error) {
    console.error("更新过程中发生错误:", error.message);
  }
}

// 运行更新
updateChecksum();
```

## 步骤 4: 配置 package.json 文件

```js
"scripts": {
    "checkSh512": "node ./checksha512.js",
  }
```

## 总结

总体思路就是：

1. 购买签名服务，下载签名工具。
2. 使用签名工具对.exe文件进行签名。
3. 使用脚本将.exe文件的sha512更新。
