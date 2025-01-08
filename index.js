const puppeteer = require("puppeteer");

function delay(milliseconds) {
  return new Promise((r) => setTimeout(r, milliseconds));
}

const juejin_check_in = async (cookie) => {
  let jdUrlArray = "https://juejin.cn/user/center/signin?from=main_page";
  const brower = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
      // "--single-process",
      "--start-maximized",
      "--use-gl=swiftshader",
      "--disable-gl-drawing-for-tests",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  const context = await brower.createIncognitoBrowserContext();
  const page = await context.newPage();
  page.setViewport({
    width: 1920,
    height: 1080,
  });
  page.setDefaultNavigationTimeout(50 * 1000);

  await page.evaluateOnNewDocument(() => {
    const newProto = navigator.__proto__;
    delete newProto.webdriver;
    navigator.__proto__ = newProto;
  });
  await page.evaluateOnNewDocument(() => {
    window.navigator.chrome = {
      runtime: {},
    };
  });

  await Promise.all(
    cookie.map((pair) => {
      return page.setCookie(pair);
    })
  );
  try {
    await Promise.all([
      page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.76"),
      page.setJavaScriptEnabled(true), //  允许执行 js 脚本
      page.goto(jdUrlArray, {
        waitUntil: "networkidle0",
      }),
      delay(2 * 1000),
    ]);
    console.log("进入签到页面");
    await delay(10 * 1000);
    await page.click(`.signin .btn`);
    console.log("签到成功!");
    await delay(10 * 1000);
    console.log("进入抽奖页面");
    await page.click(".btn-area .btn");
    await delay(10 * 1000);
    console.log("点击抽奖");
    await page.click("#turntable-item-0");
    await delay(5 * 1000);
    await page.close();
  } catch (error) {
    console.log(error);
    await page.close();
  }

  await brower.close();
};

(async function () {
  //填入cookie
  let cookieArray = [];
  for (const [index, iterator] of cookieArray.entries()) {
    console.log(`账号${index + 1}开始`);
    await delay(2000);
    await juejin_check_in(iterator);
  }
})();
