let puppeteer;
let chrome = {};
const chromeLauncher = require("chrome-launcher");

const getBrowserPath = async () => {
  let options = {};
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
  } else {
    puppeteer = require("puppeteer");
  }
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }
  return options.executablePath;
};

export default async (req, res) => {
  const url = req.body.url;
  // Perform URL validation
  if (!url || !url.trim()) {
    res.json({
      status: "error",
      error: "Enter a valid URL",
    });
    return;
  }
  let browser = null;
  try {
    const browserPath = await getBrowserPath();
    console.log("Browser path", browserPath);
    let chrome;
    log.setLevel(logLevel);
    chrome = await chromeLauncher.launch({
      chromePath: browserPath,
      chromeFlags: [
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
      logLevel,
    });
    let page = await browser.newPage();
    await page.goto(url);
    const result = await page.screenshot({
      path: "my-screenshot.png",
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      data: error.message || "Something went wrong",
    });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
