import { DownloaderHelper } from "node-downloader-helper";

export const downloadApp = ({
  downloadUrl,
  destination,
  customFileName,
}: {
  downloadUrl: string;
  destination: string;
  customFileName?: string,
}) => {
  console.info(`Start downloading "${downloadUrl}" into ${destination}`);

  const downloadHelper = new DownloaderHelper(downloadUrl, destination, {
    timeout: 30000,
    resumeOnIncomplete: true,
    resumeOnIncompleteMaxRetry: 5,
    removeOnStop: true,
    removeOnFail: true,
    fileName: customFileName
  });

  downloadHelper.on('stateChanged', (state) => {
    console.info(`Downloading: stateChanged to`, state);
  });

  const promise = new Promise<boolean>((resolve, reject) => {
    downloadHelper.on('end', () => resolve(true));
    downloadHelper.on('error', (error) => {
      console.error(`Downloading:Error`, error);

      reject(error)
    });

    downloadHelper.start().catch(error => {
      console.error(`Downloading:StartError`, error);

      reject(error)
    });
  });

  return {
    promise,
    downloadHelper,
    downloadUrl,
    destination,
    customFileName
  };
};


const { promise } = downloadApp({
  downloadUrl: 'https://app-dist-dev.toonly.com/main/1.7.32/2022-12-29_16-31-25/Toonly-1.7.32-main.dev.dmg',
  destination: __dirname,
});

promise
  .then(x => {
    console.log('promise:OK', x);
  })
  .catch(x => {
    console.log('promise:Error', x);
  })