import { DownloaderHelper } from "node-downloader-helper";
import to from "await-to-js";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

export const downloadAppNormally = ({
  downloadUrl,
  destination,
  customFileName,
}: {
  downloadUrl: string;
  destination: string;
  customFileName?: string;
}) => {
  console.info(`Start downloading "${downloadUrl}" into ${destination}`);

  const downloadHelper = new DownloaderHelper(downloadUrl, destination, {
    timeout: 30000,
    resumeOnIncomplete: false,
    resumeOnIncompleteMaxRetry: 0,
    removeOnStop: false,
    removeOnFail: false,
    fileName: customFileName,
  });

  downloadHelper.on("stateChanged", (state) => {
    console.info(`Downloading: stateChanged to`, state);
  });

  const promise = new Promise<boolean>((resolve, reject) => {
    downloadHelper.on("end", () => resolve(true));
    downloadHelper.on("error", (error) => {
      console.error(`Downloading:Error`, error);

      reject(error);
    });

    downloadHelper.start().catch((error) => {
      console.error(`Downloading:StartError`, error);

      reject(error);
    });
  });

  return {
    promise,
    downloadHelper,
    downloadUrl,
    destination,
    customFileName,
  };
};

export const downloadAppRange = ({
  downloadUrl,
  destination,
  customFileName,
  startDownloadingFromByte,
}: {
  downloadUrl: string;
  destination: string;
  customFileName?: string;
  startDownloadingFromByte: number;
}) => {
  console.info(
    `Start downloading "${downloadUrl}" into ${destination} starting from byte ${startDownloadingFromByte}`
  );

  const downloadHelper = new DownloaderHelper(downloadUrl, destination, {
    timeout: 30000,
    resumeOnIncomplete: false,
    resumeOnIncompleteMaxRetry: 0,
    removeOnStop: false,
    removeOnFail: false,
    fileName: customFileName,
    httpsRequestOptions: {
      headers: { range: `bytes=${startDownloadingFromByte}-` },
    },
  });

  downloadHelper.on("stateChanged", (state) => {
    console.info(`Downloading: stateChanged to`, state);
  });

  const promise = new Promise<boolean>((resolve, reject) => {
    downloadHelper.on("end", () => resolve(true));
    downloadHelper.on("error", (error) => {
      console.error(`Downloading:Error`, error);

      reject(error);
    });

    downloadHelper.start().catch((error) => {
      console.error(`Downloading:StartError`, error);

      reject(error);
    });
  });

  return {
    promise,
    downloadHelper,
    downloadUrl,
    destination,
    customFileName,
  };
};

export const downloadAppKeepAlive = ({
  downloadUrl,
  destination,
  customFileName,
}: {
  downloadUrl: string;
  destination: string;
  customFileName?: string;
}) => {
  const startDownloadingFromByte = 1024 * 80 * 1024;
  console.info(
    `Start downloading "${downloadUrl}" into ${destination} with keepAlive=true`
  );

  const downloadHelper = new DownloaderHelper(downloadUrl, destination, {
    timeout: 30000,
    resumeOnIncomplete: false,
    resumeOnIncompleteMaxRetry: 0,
    removeOnStop: false,
    removeOnFail: false,
    fileName: customFileName,
    httpsRequestOptions: {
      agent: new https.Agent({ keepAlive: true }),
    },
  });

  downloadHelper.on("stateChanged", (state) => {
    console.info(`Downloading: stateChanged to`, state);
  });

  const promise = new Promise<boolean>((resolve, reject) => {
    downloadHelper.on("end", () => resolve(true));
    downloadHelper.on("error", (error) => {
      console.error(`Downloading:Error`, error);

      reject(error);
    });

    downloadHelper.start().catch((error) => {
      console.error(`Downloading:StartError`, error);

      reject(error);
    });
  });

  return {
    promise,
    downloadHelper,
    downloadUrl,
    destination,
    customFileName,
  };
};

export const downloadAppOneSocket = ({
  downloadUrl,
  destination,
  customFileName,
}: {
  downloadUrl: string;
  destination: string;
  customFileName?: string;
}) => {
  console.info(
    `Start downloading "${downloadUrl}" into ${destination} with maxSockets=1`
  );

  const downloadHelper = new DownloaderHelper(downloadUrl, destination, {
    timeout: 30000,
    resumeOnIncomplete: false,
    resumeOnIncompleteMaxRetry: 0,
    removeOnStop: false,
    removeOnFail: false,
    fileName: customFileName,
    httpsRequestOptions: {
      agent: new https.Agent({
        maxSockets: 1,
      }),
    },
  });

  downloadHelper.on("stateChanged", (state) => {
    console.info(`Downloading: stateChanged to`, state);
  });

  const promise = new Promise<boolean>((resolve, reject) => {
    downloadHelper.on("end", () => resolve(true));
    downloadHelper.on("error", (error) => {
      console.error(`Downloading:Error`, error);

      reject(error);
    });

    downloadHelper.start().catch((error) => {
      console.error(`Downloading:StartError`, error);

      reject(error);
    });
  });

  return {
    promise,
    downloadHelper,
    downloadUrl,
    destination,
    customFileName,
  };
};

const workflow = async () => {
  console.log("Running inside", __dirname);
  const normalFilename = "normal.dmg";
  const rangeFilename = "range.dmg";
  const keepAliveFilename = "keepAlive.dmg";
  const oneSocketFilename = "oneSocket.dmg";

  [normalFilename, rangeFilename, keepAliveFilename, oneSocketFilename].forEach(
    (filename) => {
      const filePath = path.join(__dirname, filename);
      if (fs.existsSync(filePath)) {
        console.log(`rm ${filename}`);
        fs.unlinkSync(filePath);
      }
    }
  );

  let downloadUrl =
    "https://app-dist-dev.toonly.com/main/1.7.32/2022-12-29_16-31-25/Toonly-1.7.32-main.dev.dmg";

  if (false) {
    const [normalError, normalResult] = await to(
      downloadAppNormally({
        downloadUrl: downloadUrl,
        destination: __dirname,
        customFileName: normalFilename,
      }).promise
    );

    console.log("Download App Normal", {
      err: normalError,
      result: normalResult,
    });

    const normalStats = fs.statSync(path.join(__dirname, normalFilename));
    console.log("Downloaded normally file size: ", normalStats.size);

    const [rangeError, rangeResult] = await to(
      downloadAppRange({
        downloadUrl: downloadUrl,
        destination: __dirname,
        customFileName: rangeFilename,
        startDownloadingFromByte: normalStats.size,
      }).promise
    );

    console.log("Download App Range", {
      err: rangeError,
      result: rangeResult,
    });

    const rangeFullPath = path.join(__dirname, rangeFilename);
    if (fs.existsSync(rangeFullPath)) {
      const rangeStats = fs.statSync(rangeFullPath);
      console.log("Downloaded range file size: ", rangeStats.size);
    } else {
      console.log(
        "range file not found, perhaps fully downloaded by normal download?"
      );
    }

    const [keepAliveError, keepAliveResult] = await to(
      downloadAppKeepAlive({
        downloadUrl: downloadUrl,
        destination: __dirname,
        customFileName: keepAliveFilename,
      }).promise
    );

    console.log("Download App KeepAlive", {
      err: keepAliveError,
      result: keepAliveResult,
    });

    const keepAliveStats = fs.statSync(path.join(__dirname, keepAliveFilename));
    console.log("Downloaded keepAlive file size: ", keepAliveStats.size);
  }

  const [oneSocketError, oneSocketResult] = await to(
    downloadAppOneSocket({
      downloadUrl: downloadUrl,
      destination: __dirname,
      customFileName: oneSocketFilename,
    }).promise
  );

  console.log("Download App KeepAlive", {
    err: oneSocketError,
    result: oneSocketResult,
  });

  const oneSocketStats = fs.statSync(path.join(__dirname, oneSocketFilename));
  console.log("Downloaded oneSocket file size: ", oneSocketStats.size);
};

workflow().then(() => {
  console.log("Done!");
});
